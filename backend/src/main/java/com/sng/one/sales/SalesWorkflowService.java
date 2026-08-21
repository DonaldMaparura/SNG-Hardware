package com.sng.one.sales;

import com.sng.one.audit.AuditService;
import com.sng.one.catalogue.Product;
import com.sng.one.catalogue.ProductRepository;
import com.sng.one.common.BusinessException;
import com.sng.one.common.SequenceService;
import com.sng.one.customer.Customer;
import com.sng.one.customer.CustomerRepository;
import com.sng.one.inventory.InventoryService;
import com.sng.one.location.Location;
import com.sng.one.security.CurrentUser;
import com.sng.one.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class SalesWorkflowService {
    private final QuoteRequestRepository quoteRequests;
    private final QuoteRepository quotes;
    private final SalesOrderRepository orders;
    private final InvoiceRepository invoices;
    private final SequenceService sequences;
    private final ProductRepository products;
    private final CustomerRepository customers;
    private final InventoryService inventory;
    private final CurrentUser currentUser;
    private final AuditService audit;

    public SalesWorkflowService(QuoteRequestRepository quoteRequests, QuoteRepository quotes,
                                SalesOrderRepository orders, InvoiceRepository invoices,
                                SequenceService sequences, ProductRepository products,
                                CustomerRepository customers, InventoryService inventory,
                                CurrentUser currentUser, AuditService audit) {
        this.quoteRequests = quoteRequests;
        this.quotes = quotes;
        this.orders = orders;
        this.invoices = invoices;
        this.sequences = sequences;
        this.products = products;
        this.customers = customers;
        this.inventory = inventory;
        this.currentUser = currentUser;
        this.audit = audit;
    }

    @Transactional
    public Map<String, Object> convertEnquiry(Long enquiryId) {
        currentUser.assertWritable();
        UserPrincipal p = currentUser.require();
        QuoteRequest enq = quoteRequests.findDetailed(enquiryId)
                .orElseThrow(() -> new BusinessException("Enquiry not found", 404));
        Quote quote = new Quote();
        quote.setReference(sequences.next("quote", "QTE-", 6));
        quote.setCustomer(enq.getCustomer());
        quote.setLocation(enq.getPreferredLocation());
        quote.setStatus("ISSUED");
        quote.setNotes(enq.getNotes());
        quote.setValidUntil(LocalDate.now().plusDays(14));
        quote.setCreatedBy(inventory.requireUser(p.getId()));
        BigDecimal sub = BigDecimal.ZERO;
        for (QuoteRequestLine line : enq.getLines()) {
            QuoteLine ql = new QuoteLine();
            ql.setQuote(quote);
            ql.setProduct(line.getProduct());
            ql.setQuantity(line.getQuantity());
            ql.setUnitPrice(line.getUnitPrice());
            ql.setLineTotal(line.getUnitPrice().multiply(line.getQuantity()).setScale(2, RoundingMode.HALF_UP));
            quote.getLines().add(ql);
            sub = sub.add(ql.getLineTotal());
        }
        quote.setSubtotal(sub);
        quote.setTax(BigDecimal.ZERO);
        quote.setTotal(sub);
        quotes.save(quote);
        enq.setStatus("INVOICE_PREPARED");
        enq.setConvertedQuoteId(quote.getId());
        quoteRequests.save(enq);
        audit.record(p, "QUOTE_FROM_ENQUIRY", "Quote", quote.getReference(), enq.getReference(),
                quote.getReference(), quote.getLocation() == null ? null : quote.getLocation().getId(), null, "WEB");
        return quoteDto(quote);
    }

    @Transactional
    public Map<String, Object> updateEnquiryStatus(Long enquiryId, String status) {
        currentUser.assertWritable();
        QuoteRequest enq = quoteRequests.findDetailed(enquiryId)
                .orElseThrow(() -> new BusinessException("Request not found", 404));
        String next = status == null ? "" : status.trim().toUpperCase().replace(' ', '_');
        java.util.Set<String> allowed = java.util.Set.of(
                "NEW", "REVIEWING", "PRICING", "INVOICE_PREPARED", "SENT", "ACCEPTED", "CANCELLED");
        if (!allowed.contains(next)) {
            throw new BusinessException("Invalid status", 400);
        }
        enq.setStatus(next);
        quoteRequests.save(enq);
        audit.record(currentUser.require(), "REQUEST_STATUS", "QuoteRequest", enq.getReference(),
                null, next, null, null, "APP");
        return com.sng.one.web.Dtos.quoteRequest(enq);
    }

    @Transactional
    public Map<String, Object> acceptQuote(Long quoteId) {
        currentUser.assertWritable();
        UserPrincipal p = currentUser.require();
        Quote quote = quotes.findDetailed(quoteId).orElseThrow(() -> new BusinessException("Quote not found", 404));
        SalesOrder order = new SalesOrder();
        order.setReference(sequences.next("sales_order", "SO-", 6));
        order.setQuote(quote);
        order.setCustomer(quote.getCustomer());
        order.setLocation(quote.getLocation());
        order.setStatus("CONFIRMED");
        order.setFulfilment("COLLECTION");
        order.setSubtotal(quote.getSubtotal());
        order.setTax(quote.getTax());
        order.setTotal(quote.getTotal());
        order.setCreatedBy(inventory.requireUser(p.getId()));
        for (QuoteLine line : quote.getLines()) {
            SalesOrderLine ol = new SalesOrderLine();
            ol.setSalesOrder(order);
            ol.setProduct(line.getProduct());
            ol.setQuantity(line.getQuantity());
            ol.setUnitPrice(line.getUnitPrice());
            ol.setLineTotal(line.getLineTotal());
            order.getLines().add(ol);
        }
        orders.save(order);
        quote.setStatus("ACCEPTED");
        quotes.save(quote);
        if (order.getLocation() != null) {
            for (SalesOrderLine ol : order.getLines()) {
                inventory.reserve(ol.getProduct(), order.getLocation(), ol.getQuantity());
            }
            order.setReserved(true);
            orders.save(order);
        }
        audit.record(p, "ORDER_FROM_QUOTE", "SalesOrder", order.getReference(), quote.getReference(),
                order.getReference(), order.getLocation() == null ? null : order.getLocation().getId(), null, "APP");
        return orderDto(order);
    }

    @Transactional
    public Map<String, Object> invoiceOrder(Long orderId) {
        currentUser.assertWritable();
        SalesOrder order = orders.findDetailed(orderId).orElseThrow(() -> new BusinessException("Order not found", 404));
        Invoice inv = new Invoice();
        inv.setReference(sequences.next("invoice", "INV-", 6));
        inv.setSalesOrder(order);
        inv.setCustomer(order.getCustomer());
        inv.setLocation(order.getLocation());
        inv.setStatus("UNPAID");
        inv.setSubtotal(order.getSubtotal());
        inv.setTax(order.getTax());
        inv.setTotal(order.getTotal());
        for (SalesOrderLine ol : order.getLines()) {
            InvoiceLine il = new InvoiceLine();
            il.setInvoice(inv);
            il.setProduct(ol.getProduct());
            il.setQuantity(ol.getQuantity());
            il.setUnitPrice(ol.getUnitPrice());
            il.setLineTotal(ol.getLineTotal());
            inv.getLines().add(il);
        }
        invoices.save(inv);
        order.setStatus("INVOICED");
        orders.save(order);
        return Map.of("id", inv.getId(), "reference", inv.getReference(), "total", inv.getTotal(), "status", inv.getStatus());
    }

    public Map<String, Object> quoteDto(Quote q) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", q.getId());
        m.put("reference", q.getReference());
        m.put("status", q.getStatus());
        m.put("customer", q.getCustomer() == null ? null : q.getCustomer().getName());
        m.put("location", q.getLocation() == null ? null : q.getLocation().getName());
        m.put("total", q.getTotal());
        m.put("createdAt", q.getCreatedAt());
        m.put("lines", q.getLines() == null ? List.of() : q.getLines().stream().map(l -> Map.of(
                "sku", l.getProduct().getSku(), "name", l.getProduct().getName(),
                "qty", l.getQuantity(), "unitPrice", l.getUnitPrice(), "lineTotal", l.getLineTotal()
        )).toList());
        return m;
    }

    public List<Map<String, Object>> quoteDtoList() {
        return quotes.findAllHeader().stream().map(this::quoteDto).toList();
    }

    public List<Map<String, Object>> listOrders() {
        return orders.findAllHeader().stream().map(this::orderDto).toList();
    }

    public long countOpen() {
        return orders.countByStatusIn(List.of("CONFIRMED", "RESERVED"));
    }

    public Map<String, Object> orderDto(SalesOrder o) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", o.getId());
        m.put("reference", o.getReference());
        m.put("status", o.getStatus());
        m.put("reserved", o.isReserved());
        m.put("customer", o.getCustomer() == null ? null : o.getCustomer().getName());
        m.put("location", o.getLocation() == null ? null : o.getLocation().getName());
        m.put("fulfilment", o.getFulfilment());
        m.put("total", o.getTotal());
        m.put("createdAt", o.getCreatedAt());
        m.put("lines", o.getLines() == null ? List.of() : o.getLines().stream().map(l -> Map.of(
                "sku", l.getProduct().getSku(), "name", l.getProduct().getName(),
                "qty", l.getQuantity(), "unitPrice", l.getUnitPrice()
        )).toList());
        return m;
    }
}
