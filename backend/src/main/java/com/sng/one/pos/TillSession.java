package com.sng.one.pos;

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
@Table(name = "till_sessions")
public class TillSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false)
    @JoinColumn(name = "location_id")
    private Location location;
    @ManyToOne(optional = false)
    @JoinColumn(name = "cashier_id")
    private AppUser cashier;
    @Column(name = "opened_at")
    private Instant openedAt = Instant.now();
    @Column(name = "closed_at")
    private Instant closedAt;
    @Column(name = "opening_float")
    private BigDecimal openingFloat;
    @Column(name = "expected_cash")
    private BigDecimal expectedCash;
    @Column(name = "counted_cash")
    private BigDecimal countedCash;
    private BigDecimal variance;
    @Column(name = "variance_reason")
    private String varianceReason;
    @Column(nullable = false)
    private String status;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Location getLocation() { return location; }
    public void setLocation(Location location) { this.location = location; }
    public AppUser getCashier() { return cashier; }
    public void setCashier(AppUser cashier) { this.cashier = cashier; }
    public Instant getOpenedAt() { return openedAt; }
    public void setOpenedAt(Instant openedAt) { this.openedAt = openedAt; }
    public Instant getClosedAt() { return closedAt; }
    public void setClosedAt(Instant closedAt) { this.closedAt = closedAt; }
    public BigDecimal getOpeningFloat() { return openingFloat; }
    public void setOpeningFloat(BigDecimal openingFloat) { this.openingFloat = openingFloat; }
    public BigDecimal getExpectedCash() { return expectedCash; }
    public void setExpectedCash(BigDecimal expectedCash) { this.expectedCash = expectedCash; }
    public BigDecimal getCountedCash() { return countedCash; }
    public void setCountedCash(BigDecimal countedCash) { this.countedCash = countedCash; }
    public BigDecimal getVariance() { return variance; }
    public void setVariance(BigDecimal variance) { this.variance = variance; }
    public String getVarianceReason() { return varianceReason; }
    public void setVarianceReason(String varianceReason) { this.varianceReason = varianceReason; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}

@Entity
@Table(name = "pos_sales")
class PosSale {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "receipt_no", nullable = false, unique = true)
    private String receiptNo;
    @ManyToOne(optional = false)
    @JoinColumn(name = "till_session_id")
    private TillSession tillSession;
    @ManyToOne(optional = false)
    @JoinColumn(name = "location_id")
    private Location location;
    @ManyToOne(optional = false)
    @JoinColumn(name = "cashier_id")
    private AppUser cashier;
    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;
    private BigDecimal subtotal;
    private BigDecimal discount = BigDecimal.ZERO;
    private BigDecimal tax = BigDecimal.ZERO;
    private BigDecimal total;
    @Column(nullable = false)
    private String status;
    @Column(name = "created_at")
    private Instant createdAt = Instant.now();
    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PosSaleLine> lines = new ArrayList<>();
    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PosPayment> payments = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getReceiptNo() { return receiptNo; }
    public void setReceiptNo(String receiptNo) { this.receiptNo = receiptNo; }
    public TillSession getTillSession() { return tillSession; }
    public void setTillSession(TillSession tillSession) { this.tillSession = tillSession; }
    public Location getLocation() { return location; }
    public void setLocation(Location location) { this.location = location; }
    public AppUser getCashier() { return cashier; }
    public void setCashier(AppUser cashier) { this.cashier = cashier; }
    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }
    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
    public BigDecimal getDiscount() { return discount; }
    public void setDiscount(BigDecimal discount) { this.discount = discount; }
    public BigDecimal getTax() { return tax; }
    public void setTax(BigDecimal tax) { this.tax = tax; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public List<PosSaleLine> getLines() { return lines; }
    public List<PosPayment> getPayments() { return payments; }
}

@Entity
@Table(name = "pos_sale_lines")
class PosSaleLine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false)
    @JoinColumn(name = "pos_sale_id")
    private PosSale sale;
    @ManyToOne(optional = false)
    @JoinColumn(name = "product_id")
    private Product product;
    private BigDecimal quantity;
    @Column(name = "unit_price")
    private BigDecimal unitPrice;
    @Column(name = "line_total")
    private BigDecimal lineTotal;

    public PosSale getSale() { return sale; }
    public void setSale(PosSale sale) { this.sale = sale; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public BigDecimal getLineTotal() { return lineTotal; }
    public void setLineTotal(BigDecimal lineTotal) { this.lineTotal = lineTotal; }
}

@Entity
@Table(name = "pos_payments")
class PosPayment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false)
    @JoinColumn(name = "pos_sale_id")
    private PosSale sale;
    private String method;
    private BigDecimal amount;

    public PosSale getSale() { return sale; }
    public void setSale(PosSale sale) { this.sale = sale; }
    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
}
