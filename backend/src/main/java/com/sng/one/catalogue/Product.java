package com.sng.one.catalogue;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private String sku;
    @Column(nullable = false)
    private String name;
    @Column(columnDefinition = "TEXT")
    private String description;
    @Column(columnDefinition = "TEXT")
    private String specification;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subcategory_id")
    private Category subcategory;
    private String brand;
    @Column(name = "unit_of_measure", nullable = false)
    private String unitOfMeasure;
    @Column(name = "cost_price", nullable = false)
    private BigDecimal costPrice;
    @Column(name = "retail_price", nullable = false)
    private BigDecimal retailPrice;
    @Column(name = "trade_price")
    private BigDecimal tradePrice;
    @Column(name = "promotion_price")
    private BigDecimal promotionPrice;
    private String barcode;
    @Column(name = "supplier_code")
    private String supplierCode;
    private Integer plu;
    @Column(name = "minimum_stock")
    private BigDecimal minimumStock = BigDecimal.ZERO;
    @Column(name = "reorder_quantity")
    private BigDecimal reorderQuantity = BigDecimal.ZERO;
    @Column(name = "weight_kg")
    private BigDecimal weightKg;
    @Column(name = "length_mm")
    private BigDecimal lengthMm;
    @Column(name = "width_mm")
    private BigDecimal widthMm;
    @Column(name = "thickness_mm")
    private BigDecimal thicknessMm;
    @Column(name = "height_mm")
    private BigDecimal heightMm;
    private boolean active = true;
    @Column(name = "website_visible")
    private boolean websiteVisible = true;
    private boolean featured;
    private boolean bestseller;
    @Column(name = "image_url")
    private String imageUrl;
    private String keywords;
    @Column(name = "created_at")
    private Instant createdAt = Instant.now();
    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getSpecification() { return specification; }
    public void setSpecification(String specification) { this.specification = specification; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    public Category getSubcategory() { return subcategory; }
    public void setSubcategory(Category subcategory) { this.subcategory = subcategory; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public String getUnitOfMeasure() { return unitOfMeasure; }
    public void setUnitOfMeasure(String unitOfMeasure) { this.unitOfMeasure = unitOfMeasure; }
    public BigDecimal getCostPrice() { return costPrice; }
    public void setCostPrice(BigDecimal costPrice) { this.costPrice = costPrice; }
    public BigDecimal getRetailPrice() { return retailPrice; }
    public void setRetailPrice(BigDecimal retailPrice) { this.retailPrice = retailPrice; }
    public BigDecimal getTradePrice() { return tradePrice; }
    public void setTradePrice(BigDecimal tradePrice) { this.tradePrice = tradePrice; }
    public BigDecimal getPromotionPrice() { return promotionPrice; }
    public void setPromotionPrice(BigDecimal promotionPrice) { this.promotionPrice = promotionPrice; }
    public String getBarcode() { return barcode; }
    public void setBarcode(String barcode) { this.barcode = barcode; }
    public String getSupplierCode() { return supplierCode; }
    public void setSupplierCode(String supplierCode) { this.supplierCode = supplierCode; }
    public Integer getPlu() { return plu; }
    public void setPlu(Integer plu) { this.plu = plu; }
    public BigDecimal getMinimumStock() { return minimumStock; }
    public void setMinimumStock(BigDecimal minimumStock) { this.minimumStock = minimumStock; }
    public BigDecimal getReorderQuantity() { return reorderQuantity; }
    public void setReorderQuantity(BigDecimal reorderQuantity) { this.reorderQuantity = reorderQuantity; }
    public BigDecimal getWeightKg() { return weightKg; }
    public void setWeightKg(BigDecimal weightKg) { this.weightKg = weightKg; }
    public BigDecimal getLengthMm() { return lengthMm; }
    public void setLengthMm(BigDecimal lengthMm) { this.lengthMm = lengthMm; }
    public BigDecimal getWidthMm() { return widthMm; }
    public void setWidthMm(BigDecimal widthMm) { this.widthMm = widthMm; }
    public BigDecimal getThicknessMm() { return thicknessMm; }
    public void setThicknessMm(BigDecimal thicknessMm) { this.thicknessMm = thicknessMm; }
    public BigDecimal getHeightMm() { return heightMm; }
    public void setHeightMm(BigDecimal heightMm) { this.heightMm = heightMm; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public boolean isWebsiteVisible() { return websiteVisible; }
    public void setWebsiteVisible(boolean websiteVisible) { this.websiteVisible = websiteVisible; }
    public boolean isFeatured() { return featured; }
    public void setFeatured(boolean featured) { this.featured = featured; }
    public boolean isBestseller() { return bestseller; }
    public void setBestseller(boolean bestseller) { this.bestseller = bestseller; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getKeywords() { return keywords; }
    public void setKeywords(String keywords) { this.keywords = keywords; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
