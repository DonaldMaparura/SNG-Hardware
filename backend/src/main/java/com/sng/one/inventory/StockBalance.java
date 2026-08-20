package com.sng.one.inventory;

import com.sng.one.catalogue.Product;
import com.sng.one.location.Location;
import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "stock_balances")
@IdClass(StockBalanceId.class)
public class StockBalance {
    @Id
    @ManyToOne(optional = false)
    @JoinColumn(name = "product_id")
    private Product product;
    @Id
    @ManyToOne(optional = false)
    @JoinColumn(name = "location_id")
    private Location location;
    @Column(nullable = false)
    private BigDecimal quantity = BigDecimal.ZERO;
    @Column(nullable = false)
    private BigDecimal reserved = BigDecimal.ZERO;

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public Location getLocation() { return location; }
    public void setLocation(Location location) { this.location = location; }
    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
    public BigDecimal getReserved() { return reserved; }
    public void setReserved(BigDecimal reserved) { this.reserved = reserved; }
}
