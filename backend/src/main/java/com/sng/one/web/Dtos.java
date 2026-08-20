package com.sng.one.web;

import com.sng.one.catalogue.Product;
import com.sng.one.inventory.AvailabilityService;
import com.sng.one.location.Location;
import com.sng.one.sales.QuoteRequest;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

public final class Dtos {
    private Dtos() {}

    public static Map<String, Object> productCard(Product p, BigDecimal price, AvailabilityService availability) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", p.getId());
        m.put("sku", p.getSku());
        m.put("name", p.getName());
        m.put("brand", p.getBrand());
        m.put("unitOfMeasure", p.getUnitOfMeasure());
        m.put("retailPrice", p.getRetailPrice());
        m.put("promotionPrice", p.getPromotionPrice());
        m.put("price", price);
        m.put("featured", p.isFeatured());
        m.put("bestseller", p.isBestseller());
        m.put("imageUrl", p.getImageUrl());
        m.put("category", p.getCategory() == null ? null : p.getCategory().getName());
        m.put("categorySlug", p.getCategory() == null ? null : p.getCategory().getSlug());
        m.put("inStock", availability.anyInStock(p));
        m.put("inStockBranches", availability.inStockShopCount(p));
        m.put("availability", availability.shopAvailability(p));
        m.put("plu", p.getPlu());
        m.put("barcode", p.getBarcode());
        return m;
    }

    public static Map<String, Object> productDetail(Product p, BigDecimal price, BigDecimal trade, AvailabilityService availability) {
        Map<String, Object> m = productCard(p, price, availability);
        m.put("description", p.getDescription());
        m.put("specification", p.getSpecification());
        m.put("tradePrice", trade);
        m.put("minimumStock", p.getMinimumStock());
        m.put("lengthMm", p.getLengthMm());
        m.put("widthMm", p.getWidthMm());
        m.put("thicknessMm", p.getThicknessMm());
        m.put("active", p.isActive());
        m.put("websiteVisible", p.isWebsiteVisible());
        m.put("availability", availability.shopAvailability(p));
        return m;
    }

    public static Map<String, Object> branch(Location l) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", l.getId());
        m.put("code", l.getCode());
        m.put("name", l.getName());
        m.put("type", l.getType());
        m.put("address", l.getAddress());
        m.put("city", l.getCity());
        m.put("phone", l.getPhone());
        m.put("openingHours", l.getOpeningHours());
        m.put("services", l.getServices());
        return m;
    }

    public static Map<String, Object> quoteRequest(QuoteRequest q) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", q.getId());
        m.put("reference", q.getReference());
        m.put("customerName", q.getCustomerName());
        m.put("phone", q.getPhone());
        m.put("email", q.getEmail());
        m.put("preferredBranch", q.getPreferredLocation() == null ? null : q.getPreferredLocation().getName());
        m.put("preferredLocationId", q.getPreferredLocation() == null ? null : q.getPreferredLocation().getId());
        m.put("fulfilment", q.getFulfilment());
        m.put("deliveryAddress", q.getDeliveryAddress());
        m.put("notes", q.getNotes());
        m.put("status", q.getStatus());
        m.put("createdAt", q.getCreatedAt());
        m.put("convertedQuoteId", q.getConvertedQuoteId());
        m.put("lines", q.lineDtos());
        return m;
    }
}
