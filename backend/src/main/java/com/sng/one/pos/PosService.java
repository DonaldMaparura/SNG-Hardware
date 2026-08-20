package com.sng.one.pos;

import com.sng.one.accounting.AccountingService;
import com.sng.one.audit.AuditService;
import com.sng.one.catalogue.Product;
import com.sng.one.catalogue.ProductRepository;
import com.sng.one.common.BusinessException;
import com.sng.one.common.SequenceService;
import com.sng.one.customer.Customer;
import com.sng.one.customer.CustomerRepository;
import com.sng.one.identity.AppUser;
import com.sng.one.inventory.InventoryService;
import com.sng.one.location.Location;
import com.sng.one.security.CurrentUser;
import com.sng.one.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class PosService {
    private final TillSessionRepository tills;
    private final PosSaleRepository sales;
    private final ProductRepository products;
    private final InventoryService inventory;
    private final AccountingService accounting;
    private final SequenceService sequences;
    private final CurrentUser currentUser;
    private final CustomerRepository customers;
    private final AuditService audit;

    public PosService(TillSessionRepository tills, PosSaleRepository sales, ProductRepository products,
                      InventoryService inventory, AccountingService accounting, SequenceService sequences,
                      CurrentUser currentUser, CustomerRepository customers, AuditService audit) {
        this.tills = tills;
        this.sales = sales;
        this.products = products;
        this.inventory = inventory;
        this.accounting = accounting;
        this.sequences = sequences;
        this.currentUser = currentUser;
        this.customers = customers;
        this.audit = audit;
    }

    public record LineIn(String sku, BigDecimal quantity, BigDecimal unitPrice) {}
    public record PayIn(String method, BigDecimal amount) {}
    public record SaleIn(List<LineIn> lines, List<PayIn> payments, BigDecimal discount, Long customerId) {}

    @Transactional
    public TillSession open(BigDecimal openingFloat, Long locationId) {
        currentUser.assertWritable();
        UserPrincipal p = currentUser.require();
        currentUser.assertLocation(locationId);
        AppUser cashier = inventory.requireUser(p.getId());
        tills.findFirstByCashierAndStatus(cashier, "OPEN").ifPresent(t -> {
            throw new BusinessException("Till already open");
        });
        Location loc = inventory.requireLocation(locationId);
        TillSession t = new TillSession();
        t.setLocation(loc);
        t.setCashier(cashier);
        t.setOpeningFloat(openingFloat);
        t.setStatus("OPEN");
        tills.save(t);
        audit.record(p, "TILL_OPEN", "TillSession", String.valueOf(t.getId()), null,
                "float=" + openingFloat, locationId, null, "POS");
        return t;
    }

    @Transactional
    public Map<String, Object> checkout(SaleIn in) {
        currentUser.assertWritable();
        UserPrincipal p = currentUser.require();
        AppUser cashier = inventory.requireUser(p.getId());
        TillSession till = tills.findFirstByCashierAndStatus(cashier, "OPEN")
                .orElseThrow(() -> new BusinessException("Open the till before selling"));
        currentUser.assertLocation(till.getLocation().getId());
        PosSale sale = new PosSale();
        sale.setReceiptNo(sequences.next("receipt", "RCP-", 6));
        sale.setTillSession(till);
        sale.setLocation(till.getLocation());
        sale.setCashier(cashier);
        if (in.customerId() != null) {
            Customer c = customers.findById(in.customerId()).orElseThrow(() -> new BusinessException("Customer not found", 404));
            sale.setCustomer(c);
        }
        BigDecimal subtotal = BigDecimal.ZERO;
        for (LineIn line : in.lines()) {
            Product product = products.findBySkuIgnoreCase(line.sku())
                    .or(() -> tryPlu(line.sku()))
                    .or(() -> products.findByBarcode(line.sku()))
                    .orElseThrow(() -> new BusinessException("Product not found: " + line.sku(), 404));
            BigDecimal price = line.unitPrice() != null ? line.unitPrice() : product.getRetailPrice();
            BigDecimal qty = line.quantity();
            BigDecimal lt = price.multiply(qty).setScale(2, RoundingMode.HALF_UP);
            PosSaleLine sl = new PosSaleLine();
            sl.setSale(sale);
            sl.setProduct(product);
            sl.setQuantity(qty);
            sl.setUnitPrice(price);
            sl.setLineTotal(lt);
            sale.getLines().add(sl);
            subtotal = subtotal.add(lt);
        }
        BigDecimal discount = in.discount() == null ? BigDecimal.ZERO : in.discount();
        BigDecimal tax = BigDecimal.ZERO;
        BigDecimal total = subtotal.subtract(discount).add(tax);
        sale.setSubtotal(subtotal);
        sale.setDiscount(discount);
        sale.setTax(tax);
        sale.setTotal(total);
        sale.setStatus("COMPLETED");
        BigDecimal paySum = BigDecimal.ZERO;
        String primaryMethod = "CASH";
        for (PayIn pay : in.payments()) {
            PosPayment pp = new PosPayment();
            pp.setSale(sale);
            pp.setMethod(pay.method());
            pp.setAmount(pay.amount());
            sale.getPayments().add(pp);
            paySum = paySum.add(pay.amount());
            primaryMethod = pay.method();
        }
        if (paySum.compareTo(total) < 0) {
            throw new BusinessException("Payment is less than total");
        }
        sales.save(sale);

        BigDecimal cogs = BigDecimal.ZERO;
        for (PosSaleLine sl : sale.getLines()) {
            inventory.move(sl.getProduct(), till.getLocation(), null, sl.getQuantity(),
                    "SALE", "POS_SALE", sale.getId(), p.getId(), "POS sale", sale.getReceiptNo());
            cogs = cogs.add(sl.getProduct().getCostPrice().multiply(sl.getQuantity()));
        }
        String asset = switch (primaryMethod) {
            case "CARD", "BANK_TRANSFER", "ECOCASH" -> "1010";
            case "CUSTOMER_ACCOUNT" -> "1100";
            default -> "1000";
        };
        accounting.post("POS sale " + sale.getReceiptNo(), "POS_SALE", sale.getId(), List.of(
                AccountingService.Line.dr(asset, total, primaryMethod),
                AccountingService.Line.cr("4000", total, "Sales"),
                AccountingService.Line.dr("5000", cogs, "COGS"),
                AccountingService.Line.cr("1400", cogs, "Inventory")
        ));
        if ("CUSTOMER_ACCOUNT".equals(primaryMethod) && sale.getCustomer() != null) {
            Customer c = sale.getCustomer();
            c.setOutstanding(c.getOutstanding().add(total));
            customers.save(c);
        }
        audit.record(p, "POS_SALE", "PosSale", sale.getReceiptNo(), null, "total=" + total,
                till.getLocation().getId(), null, "POS");
        return receiptDto(sale);
    }

    @Transactional
    public TillSession close(BigDecimal counted, String reason) {
        currentUser.assertWritable();
        UserPrincipal p = currentUser.require();
        AppUser cashier = inventory.requireUser(p.getId());
        TillSession till = tills.findFirstByCashierAndStatus(cashier, "OPEN")
                .orElseThrow(() -> new BusinessException("No open till"));
        BigDecimal cashSales = sales.findByTillSession(till).stream()
                .flatMap(s -> s.getPayments().stream())
                .filter(pay -> "CASH".equals(pay.getMethod()))
                .map(PosPayment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal expected = till.getOpeningFloat().add(cashSales);
        BigDecimal variance = counted.subtract(expected);
        if (variance.compareTo(BigDecimal.ZERO) != 0 && (reason == null || reason.isBlank())) {
            throw new BusinessException("Variance reason is required");
        }
        till.setExpectedCash(expected);
        till.setCountedCash(counted);
        till.setVariance(variance);
        till.setVarianceReason(reason);
        till.setClosedAt(Instant.now());
        till.setStatus("CLOSED");
        audit.record(p, "TILL_CLOSE", "TillSession", String.valueOf(till.getId()),
                "expected=" + expected, "counted=" + counted + " variance=" + variance,
                till.getLocation().getId(), reason, "POS");
        return tills.save(till);
    }

    public TillSession current() {
        AppUser cashier = inventory.requireUser(currentUser.require().getId());
        return tills.findFirstByCashierAndStatus(cashier, "OPEN").orElse(null);
    }

    private java.util.Optional<Product> tryPlu(String sku) {
        try {
            return products.findByPlu(Integer.parseInt(sku));
        } catch (NumberFormatException e) {
            return java.util.Optional.empty();
        }
    }

    public Map<String, Object> receiptDto(PosSale sale) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", sale.getId());
        m.put("receiptNo", sale.getReceiptNo());
        m.put("branch", sale.getLocation().getName());
        m.put("cashier", sale.getCashier().getFullName());
        m.put("createdAt", sale.getCreatedAt());
        m.put("subtotal", sale.getSubtotal());
        m.put("discount", sale.getDiscount());
        m.put("tax", sale.getTax());
        m.put("total", sale.getTotal());
        m.put("lines", sale.getLines().stream().map(l -> Map.<String, Object>of(
                "sku", l.getProduct().getSku(),
                "name", l.getProduct().getName(),
                "qty", l.getQuantity(),
                "unitPrice", l.getUnitPrice(),
                "lineTotal", l.getLineTotal()
        )).toList());
        m.put("payments", sale.getPayments().stream().map(p -> Map.<String, Object>of(
                "method", p.getMethod(), "amount", p.getAmount()
        )).toList());
        return m;
    }

    public BigDecimal salesSince(java.time.Instant from) {
        return sales.salesSince(from);
    }

    public Map<String, BigDecimal> salesByBranch() {
        Map<String, BigDecimal> map = new LinkedHashMap<>();
        for (PosSale s : sales.findAll()) {
            String name = s.getLocation().getName();
            map.merge(name, s.getTotal(), BigDecimal::add);
        }
        return map;
    }
}
