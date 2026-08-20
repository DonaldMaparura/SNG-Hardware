package com.sng.one.transfer;

import com.sng.one.catalogue.Product;
import com.sng.one.fleet.Truck;
import com.sng.one.identity.AppUser;
import com.sng.one.location.Location;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "stock_transfers")
public class StockTransfer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private String reference;
    @ManyToOne(optional = false)
    @JoinColumn(name = "from_location_id")
    private Location fromLocation;
    @ManyToOne(optional = false)
    @JoinColumn(name = "to_location_id")
    private Location toLocation;
    @ManyToOne
    @JoinColumn(name = "truck_id")
    private Truck truck;
    @ManyToOne
    @JoinColumn(name = "driver_id")
    private AppUser driver;
    @Column(nullable = false)
    private String status;
    private String notes;
    @ManyToOne
    @JoinColumn(name = "created_by")
    private AppUser createdBy;
    @Column(name = "created_at")
    private Instant createdAt = Instant.now();
    @Column(name = "loaded_at")
    private Instant loadedAt;
    @Column(name = "received_at")
    private Instant receivedAt;
    @OneToMany(mappedBy = "transfer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StockTransferLine> lines = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }
    public Location getFromLocation() { return fromLocation; }
    public void setFromLocation(Location fromLocation) { this.fromLocation = fromLocation; }
    public Location getToLocation() { return toLocation; }
    public void setToLocation(Location toLocation) { this.toLocation = toLocation; }
    public Truck getTruck() { return truck; }
    public void setTruck(Truck truck) { this.truck = truck; }
    public AppUser getDriver() { return driver; }
    public void setDriver(AppUser driver) { this.driver = driver; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public AppUser getCreatedBy() { return createdBy; }
    public void setCreatedBy(AppUser createdBy) { this.createdBy = createdBy; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getLoadedAt() { return loadedAt; }
    public void setLoadedAt(Instant loadedAt) { this.loadedAt = loadedAt; }
    public Instant getReceivedAt() { return receivedAt; }
    public void setReceivedAt(Instant receivedAt) { this.receivedAt = receivedAt; }
    public List<StockTransferLine> getLines() { return lines; }

    public record CargoItem(Product product, java.math.BigDecimal quantity) {}

    public List<CargoItem> cargoItems() {
        return lines.stream().map(l -> new CargoItem(l.getProduct(),
                l.getLoadedQty() == null ? l.getRequestedQty() : l.getLoadedQty())).toList();
    }
}

@Entity
@Table(name = "stock_transfer_lines")
class StockTransferLine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false)
    @JoinColumn(name = "stock_transfer_id")
    private StockTransfer transfer;
    @ManyToOne(optional = false)
    @JoinColumn(name = "product_id")
    private Product product;
    @Column(name = "requested_qty")
    private BigDecimal requestedQty;
    @Column(name = "loaded_qty")
    private BigDecimal loadedQty;
    @Column(name = "received_qty")
    private BigDecimal receivedQty;
    @Column(name = "variance_qty")
    private BigDecimal varianceQty;

    public Long getId() { return id; }
    public StockTransfer getTransfer() { return transfer; }
    public void setTransfer(StockTransfer transfer) { this.transfer = transfer; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public BigDecimal getRequestedQty() { return requestedQty; }
    public void setRequestedQty(BigDecimal requestedQty) { this.requestedQty = requestedQty; }
    public BigDecimal getLoadedQty() { return loadedQty; }
    public void setLoadedQty(BigDecimal loadedQty) { this.loadedQty = loadedQty; }
    public BigDecimal getReceivedQty() { return receivedQty; }
    public void setReceivedQty(BigDecimal receivedQty) { this.receivedQty = receivedQty; }
    public BigDecimal getVarianceQty() { return varianceQty; }
    public void setVarianceQty(BigDecimal varianceQty) { this.varianceQty = varianceQty; }
}
