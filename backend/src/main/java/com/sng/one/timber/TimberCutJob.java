package com.sng.one.timber;

import com.sng.one.catalogue.Product;
import com.sng.one.customer.Customer;
import com.sng.one.identity.AppUser;
import com.sng.one.location.Location;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "timber_cut_jobs")
public class TimberCutJob {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private String reference;
    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;
    @ManyToOne
    @JoinColumn(name = "location_id")
    private Location location;
    @ManyToOne(optional = false)
    @JoinColumn(name = "source_product_id")
    private Product sourceProduct;
    @Column(name = "source_qty")
    private BigDecimal sourceQty;
    @Column(name = "original_length_m")
    private BigDecimal originalLengthM;
    @Column(name = "kerf_mm")
    private BigDecimal kerfMm;
    @Column(name = "used_m")
    private BigDecimal usedM;
    @Column(name = "kerf_total_m")
    private BigDecimal kerfTotalM;
    @Column(name = "offcut_m")
    private BigDecimal offcutM;
    @Column(name = "waste_m")
    private BigDecimal wasteM;
    private BigDecimal utilisation;
    @Column(name = "offcut_reusable")
    private Boolean offcutReusable;
    @Column(nullable = false)
    private String status;
    @ManyToOne
    @JoinColumn(name = "operator_id")
    private AppUser operator;
    private String notes;
    @ManyToOne
    @JoinColumn(name = "created_by")
    private AppUser createdBy;
    @Column(name = "created_at")
    private Instant createdAt = Instant.now();
    @Column(name = "completed_at")
    private Instant completedAt;
    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TimberCutPiece> pieces = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }
    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }
    public Location getLocation() { return location; }
    public void setLocation(Location location) { this.location = location; }
    public Product getSourceProduct() { return sourceProduct; }
    public void setSourceProduct(Product sourceProduct) { this.sourceProduct = sourceProduct; }
    public BigDecimal getSourceQty() { return sourceQty; }
    public void setSourceQty(BigDecimal sourceQty) { this.sourceQty = sourceQty; }
    public BigDecimal getOriginalLengthM() { return originalLengthM; }
    public void setOriginalLengthM(BigDecimal originalLengthM) { this.originalLengthM = originalLengthM; }
    public BigDecimal getKerfMm() { return kerfMm; }
    public void setKerfMm(BigDecimal kerfMm) { this.kerfMm = kerfMm; }
    public BigDecimal getUsedM() { return usedM; }
    public void setUsedM(BigDecimal usedM) { this.usedM = usedM; }
    public BigDecimal getKerfTotalM() { return kerfTotalM; }
    public void setKerfTotalM(BigDecimal kerfTotalM) { this.kerfTotalM = kerfTotalM; }
    public BigDecimal getOffcutM() { return offcutM; }
    public void setOffcutM(BigDecimal offcutM) { this.offcutM = offcutM; }
    public BigDecimal getWasteM() { return wasteM; }
    public void setWasteM(BigDecimal wasteM) { this.wasteM = wasteM; }
    public BigDecimal getUtilisation() { return utilisation; }
    public void setUtilisation(BigDecimal utilisation) { this.utilisation = utilisation; }
    public Boolean getOffcutReusable() { return offcutReusable; }
    public void setOffcutReusable(Boolean offcutReusable) { this.offcutReusable = offcutReusable; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public AppUser getOperator() { return operator; }
    public void setOperator(AppUser operator) { this.operator = operator; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public AppUser getCreatedBy() { return createdBy; }
    public void setCreatedBy(AppUser createdBy) { this.createdBy = createdBy; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
    public List<TimberCutPiece> getPieces() { return pieces; }
}

@Entity
@Table(name = "timber_cut_pieces")
class TimberCutPiece {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false)
    @JoinColumn(name = "job_id")
    private TimberCutJob job;
    @Column(name = "length_m")
    private BigDecimal lengthM;
    private int quantity = 1;
    @Column(name = "sort_order")
    private int sortOrder;

    public TimberCutJob getJob() { return job; }
    public void setJob(TimberCutJob job) { this.job = job; }
    public BigDecimal getLengthM() { return lengthM; }
    public void setLengthM(BigDecimal lengthM) { this.lengthM = lengthM; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }
}
