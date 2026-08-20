package com.sng.one.catalogue;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "product_search_events")
public class ProductSearchEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String query;
    @Column(name = "created_at")
    private Instant createdAt = Instant.now();
    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }
}

@Entity
@Table(name = "product_view_events")
class ProductViewEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "product_id")
    private Long productId;
    @Column(name = "created_at")
    private Instant createdAt = Instant.now();
    public void setProductId(Long productId) { this.productId = productId; }
    public Long getProductId() { return productId; }
}
