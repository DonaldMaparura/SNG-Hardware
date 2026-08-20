package com.sng.one.transfer;

import com.sng.one.audit.AuditService;
import com.sng.one.catalogue.Product;
import com.sng.one.catalogue.ProductRepository;
import com.sng.one.common.BusinessException;
import com.sng.one.common.SequenceService;
import com.sng.one.fleet.FleetService;
import com.sng.one.fleet.Truck;
import com.sng.one.fleet.TruckRepository;
import com.sng.one.identity.AppUser;
import com.sng.one.inventory.InventoryService;
import com.sng.one.location.Location;
import com.sng.one.location.LocationRepository;
import com.sng.one.security.CurrentUser;
import com.sng.one.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class TransferService {
    private final StockTransferRepository transfers;
    private final ProductRepository products;
    private final InventoryService inventory;
    private final LocationRepository locations;
    private final TruckRepository trucks;
    private final FleetService fleet;
    private final SequenceService sequences;
    private final CurrentUser currentUser;
    private final AuditService audit;

    public TransferService(StockTransferRepository transfers, ProductRepository products, InventoryService inventory,
                           LocationRepository locations, TruckRepository trucks, FleetService fleet,
                           SequenceService sequences, CurrentUser currentUser, AuditService audit) {
        this.transfers = transfers;
        this.products = products;
        this.inventory = inventory;
        this.locations = locations;
        this.trucks = trucks;
        this.fleet = fleet;
        this.sequences = sequences;
        this.currentUser = currentUser;
        this.audit = audit;
    }

    public record LineIn(String sku, BigDecimal quantity) {}
    public record CreateIn(Long fromLocationId, Long toLocationId, Long truckId, Long driverId, String notes, List<LineIn> lines) {}
    public record ReceiveIn(List<ReceiveLine> lines) {}
    public record ReceiveLine(String sku, BigDecimal receivedQty) {}

    @Transactional
    public StockTransfer create(CreateIn in) {
        currentUser.assertWritable();
        UserPrincipal p = currentUser.require();
        StockTransfer t = new StockTransfer();
        t.setReference(sequences.next("transfer", "TRF-", 6));
        t.setFromLocation(inventory.requireLocation(in.fromLocationId()));
        t.setToLocation(inventory.requireLocation(in.toLocationId()));
        t.setNotes(in.notes());
        t.setStatus("REQUESTED");
        t.setCreatedBy(inventory.requireUser(p.getId()));
        if (in.truckId() != null) assignTruck(t, in.truckId(), in.driverId());
        for (LineIn line : in.lines()) {
            Product product = products.findBySkuIgnoreCase(line.sku())
                    .orElseThrow(() -> new BusinessException("Unknown SKU " + line.sku()));
            StockTransferLine tl = new StockTransferLine();
            tl.setTransfer(t);
            tl.setProduct(product);
            tl.setRequestedQty(line.quantity());
            t.getLines().add(tl);
        }
        transfers.save(t);
        audit.record(p, "TRANSFER_CREATE", "StockTransfer", t.getReference(), null, t.getReference(),
                t.getFromLocation().getId(), null, "APP");
        return t;
    }

    @Transactional
    public StockTransfer transition(Long id, String status) {
        currentUser.assertWritable();
        StockTransfer t = transfers.findDetailed(id).orElseThrow(() -> new BusinessException("Transfer not found", 404));
        t.setStatus(status);
        return transfers.save(t);
    }

    @Transactional
    public StockTransfer load(Long id) {
        currentUser.assertWritable();
        UserPrincipal p = currentUser.require();
        StockTransfer t = transfers.findDetailed(id).orElseThrow(() -> new BusinessException("Transfer not found", 404));
        if (t.getTruck() == null) throw new BusinessException("Assign a truck before loading");
        Location transit = transitLocation(t);
        for (StockTransferLine line : t.getLines()) {
            BigDecimal qty = line.getRequestedQty();
            line.setLoadedQty(qty);
            inventory.move(line.getProduct(), t.getFromLocation(), transit, qty,
                    "TRANSFER_IN_TRANSIT", "TRANSFER", t.getId(), p.getId(), "Loaded to transit", t.getReference());
        }
        t.setStatus("IN_TRANSIT");
        t.setLoadedAt(Instant.now());
        t.getTruck().setStatus("LOADING");
        trucks.save(t.getTruck());
        fleet.createTransferTrip(t);
        audit.record(p, "TRANSFER_LOAD", "StockTransfer", t.getReference(), t.getFromLocation().getCode(),
                "IN_TRANSIT", t.getFromLocation().getId(), null, "APP");
        return transfers.save(t);
    }

    @Transactional
    public StockTransfer receive(Long id, ReceiveIn in) {
        currentUser.assertWritable();
        UserPrincipal p = currentUser.require();
        StockTransfer t = transfers.findDetailed(id).orElseThrow(() -> new BusinessException("Transfer not found", 404));
        Location transit = transitLocation(t);
        Location damage = locations.findByCode("DMG-01")
                .orElseThrow(() -> new BusinessException("Damage location missing"));
        for (ReceiveLine rl : in.lines()) {
            StockTransferLine line = t.getLines().stream()
                    .filter(l -> l.getProduct().getSku().equalsIgnoreCase(rl.sku()))
                    .findFirst().orElseThrow(() -> new BusinessException("Line not on transfer"));
            BigDecimal loaded = line.getLoadedQty() == null ? line.getRequestedQty() : line.getLoadedQty();
            BigDecimal received = rl.receivedQty();
            BigDecimal variance = received.subtract(loaded);
            line.setReceivedQty(received);
            line.setVarianceQty(variance);
            inventory.move(line.getProduct(), transit, t.getToLocation(), received,
                    "TRANSFER_RECEIPT", "TRANSFER", t.getId(), p.getId(), "Received", t.getReference());
            if (variance.compareTo(BigDecimal.ZERO) < 0) {
                inventory.move(line.getProduct(), transit, damage, variance.abs(),
                        "DAMAGE", "TRANSFER", t.getId(), p.getId(), "Transfer shortage", t.getReference());
            }
        }
        t.setStatus("COMPLETED");
        t.setReceivedAt(Instant.now());
        if (t.getTruck() != null) {
            t.getTruck().setStatus("AVAILABLE");
            trucks.save(t.getTruck());
        }
        fleet.completeTransferTrip(t.getId());
        audit.record(p, "TRANSFER_RECEIVE", "StockTransfer", t.getReference(), "in-transit",
                "received with variance", t.getToLocation().getId(), null, "APP");
        return transfers.save(t);
    }

    public void assignTruck(StockTransfer t, Long truckId, Long driverId) {
        Truck truck = trucks.findById(truckId).orElseThrow(() -> new BusinessException("Truck not found", 404));
        if ("MAINTENANCE".equals(truck.getStatus()) || "OUT_OF_SERVICE".equals(truck.getStatus())
                || "IN_MAINTENANCE".equals(truck.getStatus())) {
            throw new BusinessException("Truck is not available for assignment");
        }
        t.setTruck(truck);
        if (driverId != null) t.setDriver(inventory.requireUser(driverId));
        else t.setDriver(truck.getDriver());
        truck.setStatus("ASSIGNED");
        trucks.save(truck);
    }

    private Location transitLocation(StockTransfer t) {
        if (t.getTruck() != null && t.getTruck().getLocation() != null) return t.getTruck().getLocation();
        return locations.findByCode("TRANSIT-01").orElseThrow(() -> new BusinessException("In-transit location missing"));
    }

    public Map<String, Object> dto(StockTransfer t) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", t.getId());
        m.put("reference", t.getReference());
        m.put("status", t.getStatus());
        m.put("from", t.getFromLocation().getName());
        m.put("to", t.getToLocation().getName());
        m.put("truck", t.getTruck() == null ? null : t.getTruck().getVehicleCode());
        m.put("driver", t.getDriver() == null ? null : t.getDriver().getFullName());
        m.put("createdAt", t.getCreatedAt());
        m.put("lines", t.getLines() == null ? List.of() : t.getLines().stream().map(l -> Map.of(
                "sku", l.getProduct().getSku(),
                "name", l.getProduct().getName(),
                "requested", l.getRequestedQty(),
                "loaded", l.getLoadedQty(),
                "received", l.getReceivedQty(),
                "variance", l.getVarianceQty()
        )).toList());
        return m;
    }
}
