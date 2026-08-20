package com.sng.one.fleet;

import com.sng.one.catalogue.Product;
import com.sng.one.identity.AppUser;
import com.sng.one.location.Location;
import com.sng.one.transfer.StockTransfer;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "trips")
public class Trip {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private String reference;
    @ManyToOne(optional = false)
    private Truck truck;
    @ManyToOne
    @JoinColumn(name = "driver_id")
    private AppUser driver;
    @ManyToOne
    @JoinColumn(name = "from_location_id")
    private Location fromLocation;
    @ManyToOne
    @JoinColumn(name = "to_location_id")
    private Location toLocation;
    @ManyToOne
    @JoinColumn(name = "transfer_id")
    private StockTransfer transfer;
    @Column(name = "trip_type")
    private String tripType;
    @Column(nullable = false)
    private String status;
    @Column(name = "started_at")
    private Instant startedAt;
    @Column(name = "arrived_at")
    private Instant arrivedAt;
    @Column(name = "delivered_at")
    private Instant deliveredAt;
    private String notes;
    @Column(name = "created_at")
    private Instant createdAt = Instant.now();
    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TripCargo> cargo = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }
    public Truck getTruck() { return truck; }
    public void setTruck(Truck truck) { this.truck = truck; }
    public AppUser getDriver() { return driver; }
    public void setDriver(AppUser driver) { this.driver = driver; }
    public Location getFromLocation() { return fromLocation; }
    public void setFromLocation(Location fromLocation) { this.fromLocation = fromLocation; }
    public Location getToLocation() { return toLocation; }
    public void setToLocation(Location toLocation) { this.toLocation = toLocation; }
    public StockTransfer getTransfer() { return transfer; }
    public void setTransfer(StockTransfer transfer) { this.transfer = transfer; }
    public String getTripType() { return tripType; }
    public void setTripType(String tripType) { this.tripType = tripType; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getStartedAt() { return startedAt; }
    public void setStartedAt(Instant startedAt) { this.startedAt = startedAt; }
    public Instant getArrivedAt() { return arrivedAt; }
    public void setArrivedAt(Instant arrivedAt) { this.arrivedAt = arrivedAt; }
    public Instant getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(Instant deliveredAt) { this.deliveredAt = deliveredAt; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Instant getCreatedAt() { return createdAt; }
    public List<TripCargo> getCargo() { return cargo; }
}

@Entity
@Table(name = "trip_cargo")
class TripCargo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false)
    private Trip trip;
    @ManyToOne(optional = false)
    private Product product;
    private BigDecimal quantity;

    public Trip getTrip() { return trip; }
    public void setTrip(Trip trip) { this.trip = trip; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
}

@Entity
@Table(name = "proof_of_delivery")
class ProofOfDelivery {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false)
    private Trip trip;
    private String recipient;
    @Column(name = "delivered_at")
    private Instant deliveredAt = Instant.now();
    @ManyToOne
    @JoinColumn(name = "driver_id")
    private AppUser driver;
    private String notes;
    @Column(name = "photo_url")
    private String photoUrl;
    @Column(name = "signature_data")
    private String signatureData;
    private String reference;

    public Long getId() { return id; }
    public Trip getTrip() { return trip; }
    public void setTrip(Trip trip) { this.trip = trip; }
    public String getRecipient() { return recipient; }
    public void setRecipient(String recipient) { this.recipient = recipient; }
    public Instant getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(Instant deliveredAt) { this.deliveredAt = deliveredAt; }
    public AppUser getDriver() { return driver; }
    public void setDriver(AppUser driver) { this.driver = driver; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
    public String getSignatureData() { return signatureData; }
    public void setSignatureData(String signatureData) { this.signatureData = signatureData; }
    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }
}

@Entity
@Table(name = "maintenance_records")
class MaintenanceRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false)
    private Truck truck;
    @Column(nullable = false)
    private String type;
    private LocalDate date;
    @Column(name = "odometer_km")
    private Integer odometerKm;
    private String supplier;
    private String description;
    private BigDecimal cost = BigDecimal.ZERO;
    @Column(name = "invoice_ref")
    private String invoiceRef;
    @Column(name = "next_service_km")
    private Integer nextServiceKm;
    @Column(name = "next_service_date")
    private LocalDate nextServiceDate;
    @ManyToOne
    @JoinColumn(name = "created_by")
    private AppUser createdBy;
    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public Truck getTruck() { return truck; }
    public void setTruck(Truck truck) { this.truck = truck; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public Integer getOdometerKm() { return odometerKm; }
    public void setOdometerKm(Integer odometerKm) { this.odometerKm = odometerKm; }
    public String getSupplier() { return supplier; }
    public void setSupplier(String supplier) { this.supplier = supplier; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getCost() { return cost; }
    public void setCost(BigDecimal cost) { this.cost = cost; }
    public String getInvoiceRef() { return invoiceRef; }
    public void setInvoiceRef(String invoiceRef) { this.invoiceRef = invoiceRef; }
    public Integer getNextServiceKm() { return nextServiceKm; }
    public void setNextServiceKm(Integer nextServiceKm) { this.nextServiceKm = nextServiceKm; }
    public LocalDate getNextServiceDate() { return nextServiceDate; }
    public void setNextServiceDate(LocalDate nextServiceDate) { this.nextServiceDate = nextServiceDate; }
    public AppUser getCreatedBy() { return createdBy; }
    public void setCreatedBy(AppUser createdBy) { this.createdBy = createdBy; }
    public Instant getCreatedAt() { return createdAt; }
}
