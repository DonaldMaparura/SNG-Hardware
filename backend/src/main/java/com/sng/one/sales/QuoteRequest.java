package com.sng.one.sales;

import com.sng.one.catalogue.Product;
import com.sng.one.customer.Customer;
import com.sng.one.location.Location;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quote_requests")
public class QuoteRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private String reference;
    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;
    @Column(name = "customer_name", nullable = false)
    private String customerName;
    private String phone;
    private String email;
    @ManyToOne
    @JoinColumn(name = "preferred_location_id")
    private Location preferredLocation;
    @Column(nullable = false)
    private String fulfilment;
    @Column(name = "delivery_address")
    private String deliveryAddress;
    private String notes;
    @Column(nullable = false)
    private String status;
    @Column(name = "converted_quote_id")
    private Long convertedQuoteId;
    @Column(name = "created_at")
    private Instant createdAt = Instant.now();
    @OneToMany(mappedBy = "quoteRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuoteRequestLine> lines = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }
    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Location getPreferredLocation() { return preferredLocation; }
    public void setPreferredLocation(Location preferredLocation) { this.preferredLocation = preferredLocation; }
    public String getFulfilment() { return fulfilment; }
    public void setFulfilment(String fulfilment) { this.fulfilment = fulfilment; }
    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getConvertedQuoteId() { return convertedQuoteId; }
    public void setConvertedQuoteId(Long convertedQuoteId) { this.convertedQuoteId = convertedQuoteId; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public List<QuoteRequestLine> getLines() { return lines; }
    public void setLines(List<QuoteRequestLine> lines) { this.lines = lines; }

    public void addLine(com.sng.one.catalogue.Product product, java.math.BigDecimal quantity, java.math.BigDecimal unitPrice) {
        QuoteRequestLine ql = new QuoteRequestLine();
        ql.setQuoteRequest(this);
        ql.setProduct(product);
        ql.setQuantity(quantity);
        ql.setUnitPrice(unitPrice);
        lines.add(ql);
    }

    public java.util.List<java.util.Map<String, Object>> lineDtos() {
        return lines.stream().map(l -> java.util.Map.<String, Object>of(
                "productId", l.getProduct().getId(),
                "sku", l.getProduct().getSku(),
                "name", l.getProduct().getName(),
                "quantity", l.getQuantity(),
                "unitPrice", l.getUnitPrice()
        )).toList();
    }
}

@Entity
@Table(name = "quote_request_lines")
class QuoteRequestLine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false)
    @JoinColumn(name = "quote_request_id")
    private QuoteRequest quoteRequest;
    @ManyToOne(optional = false)
    @JoinColumn(name = "product_id")
    private Product product;
    @Column(nullable = false)
    private BigDecimal quantity;
    @Column(name = "unit_price", nullable = false)
    private BigDecimal unitPrice;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public QuoteRequest getQuoteRequest() { return quoteRequest; }
    public void setQuoteRequest(QuoteRequest quoteRequest) { this.quoteRequest = quoteRequest; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
}
