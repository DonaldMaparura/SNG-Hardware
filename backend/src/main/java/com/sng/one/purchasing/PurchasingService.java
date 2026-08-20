package com.sng.one.purchasing;

import com.sng.one.accounting.AccountingService;
import com.sng.one.audit.AuditService;
import com.sng.one.catalogue.Product;
import com.sng.one.catalogue.ProductRepository;
import com.sng.one.common.BusinessException;
import com.sng.one.common.SequenceService;
import com.sng.one.inventory.InventoryService;
import com.sng.one.location.Location;
import com.sng.one.security.CurrentUser;
import com.sng.one.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class PurchasingService {
    private final SupplierRepository suppliers;
    private final PurchaseOrderRepository orders;
    private final GoodsReceiptRepository receipts;
    private final ProductRepository products;
    private final InventoryService inventory;
    private final AccountingService accounting;
    private final SequenceService sequences;
    private final CurrentUser currentUser;
    private final AuditService audit;

    public PurchasingService(SupplierRepository suppliers, PurchaseOrderRepository orders, GoodsReceiptRepository receipts,
                             ProductRepository products, InventoryService inventory, AccountingService accounting,
                             SequenceService sequences, CurrentUser currentUser, AuditService audit) {
        this.suppliers = suppliers;
        this.orders = orders;
        this.receipts = receipts;
        this.products = products;
        this.inventory = inventory;
        this.accounting = accounting;
        this.sequences = sequences;
        this.currentUser = currentUser;
        this.audit = audit;
    }

    public record LineIn(String sku, BigDecimal quantity, BigDecimal unitCost) {}
    public record CreatePo(Long supplierId, Long locationId, LocalDate expectedDate, String notes, List<LineIn> lines) {}
    public record ReceiveLine(String sku, BigDecimal receivedQty) {}
    public record ReceiveIn(List<ReceiveLine> lines, String notes) {}

    @Transactional
    public Map<String, Object> create(CreatePo in) {
        currentUser.assertWritable();
        UserPrincipal p = currentUser.require();
        PurchaseOrder po = new PurchaseOrder();
        po.setReference(sequences.next("po", "PO-", 6));
        po.setSupplier(suppliers.findById(in.supplierId()).orElseThrow(() -> new BusinessException("Supplier not found")));
        po.setLocation(inventory.requireLocation(in.locationId()));
        po.setExpectedDate(in.expectedDate());
        po.setNotes(in.notes());
        po.setStatus("DRAFT");
        po.setCreatedBy(inventory.requireUser(p.getId()));
        for (LineIn line : in.lines()) {
            Product product = products.findBySkuIgnoreCase(line.sku())
                    .orElseThrow(() -> new BusinessException("Unknown SKU " + line.sku()));
            PurchaseOrderLine pl = new PurchaseOrderLine();
            pl.setPurchaseOrder(po);
            pl.setProduct(product);
            pl.setQuantity(line.quantity());
            pl.setUnitCost(line.unitCost());
            po.getLines().add(pl);
        }
        return poDto(orders.save(po));
    }

    @Transactional
    public Map<String, Object> setStatus(Long id, String status) {
        currentUser.assertWritable();
        PurchaseOrder po = orders.findById(id).orElseThrow(() -> new BusinessException("PO not found", 404));
        po.setStatus(status);
        return poDto(orders.save(po));
    }

    @Transactional
    public Map<String, Object> receive(Long poId, ReceiveIn in) {
        currentUser.assertWritable();
        UserPrincipal p = currentUser.require();
        PurchaseOrder po = orders.findDetailed(poId).orElseThrow(() -> new BusinessException("PO not found", 404));
        Location loc = po.getLocation();
        GoodsReceipt gr = new GoodsReceipt();
        gr.setReference(sequences.next("grn", "GRN-", 6));
        gr.setPurchaseOrder(po);
        gr.setLocation(loc);
        gr.setReceivedBy(inventory.requireUser(p.getId()));
        gr.setNotes(in.notes());
        BigDecimal value = BigDecimal.ZERO;
        boolean partial = false;
        for (ReceiveLine rl : in.lines()) {
            PurchaseOrderLine line = po.getLines().stream()
                    .filter(l -> l.getProduct().getSku().equalsIgnoreCase(rl.sku()))
                    .findFirst().orElseThrow();
            GoodsReceiptLine gl = new GoodsReceiptLine();
            gl.setReceipt(gr);
            gl.setProduct(line.getProduct());
            gl.setExpectedQty(line.getQuantity());
            gl.setReceivedQty(rl.receivedQty());
            gl.setVarianceQty(rl.receivedQty().subtract(line.getQuantity()));
            gr.getLines().add(gl);
            line.setReceivedQty(line.getReceivedQty().add(rl.receivedQty()));
            if (line.getReceivedQty().compareTo(line.getQuantity()) < 0) partial = true;
            inventory.move(line.getProduct(), null, loc, rl.receivedQty(),
                    "PURCHASE_RECEIPT", "GRN", null, p.getId(), "PO " + po.getReference(), gr.getReference());
            value = value.add(line.getUnitCost().multiply(rl.receivedQty()));
        }
        receipts.save(gr);
        po.setStatus(partial ? "PARTIAL" : "RECEIVED");
        orders.save(po);
        accounting.post("Purchase receipt " + gr.getReference(), "GRN", gr.getId(), List.of(
                AccountingService.Line.dr("1400", value, po.getReference()),
                AccountingService.Line.cr("2000", value, po.getSupplier().getName())
        ));
        audit.record(p, "PO_RECEIVE", "GoodsReceipt", gr.getReference(), po.getReference(),
                "value=" + value, loc.getId(), in.notes(), "APP");
        return Map.of("reference", gr.getReference(), "id", gr.getId());
    }

    public List<Map<String, Object>> list() {
        return orders.findAllHeader().stream().map(this::poDto).toList();
    }

    public Map<String, Object> poDto(PurchaseOrder po) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", po.getId());
        m.put("reference", po.getReference());
        m.put("status", po.getStatus());
        m.put("supplier", po.getSupplier().getName());
        m.put("location", po.getLocation().getName());
        m.put("expectedDate", po.getExpectedDate());
        m.put("lines", po.getLines() == null ? List.of() : po.getLines().stream().map(l -> Map.of(
                "sku", l.getProduct().getSku(), "name", l.getProduct().getName(),
                "qty", l.getQuantity(), "unitCost", l.getUnitCost(), "received", l.getReceivedQty()
        )).toList());
        return m;
    }
}
