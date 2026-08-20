package com.sng.one.web;

import com.sng.one.catalogue.CategoryRepository;
import com.sng.one.catalogue.Product;
import com.sng.one.catalogue.ProductQueryService;
import com.sng.one.common.SequenceService;
import com.sng.one.customer.CustomerRepository;
import com.sng.one.inventory.AvailabilityService;
import com.sng.one.location.LocationRepository;
import com.sng.one.sales.QuoteRequest;
import com.sng.one.sales.QuoteRequestRepository;
import com.sng.one.security.UserPrincipal;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
@Transactional(readOnly = true)
public class StorefrontController {
    private final ProductQueryService query;
    private final CategoryRepository categories;
    private final LocationRepository locations;
    private final AvailabilityService availability;
    private final QuoteRequestRepository quoteRequests;
    private final SequenceService sequences;
    private final CustomerRepository customers;
    private final boolean demoOneClick;

    public StorefrontController(ProductQueryService query, CategoryRepository categories, LocationRepository locations,
                                AvailabilityService availability, QuoteRequestRepository quoteRequests,
                                SequenceService sequences, CustomerRepository customers,
                                @Value("${sng.demo-one-click:false}") boolean demoOneClick) {
        this.query = query;
        this.categories = categories;
        this.locations = locations;
        this.availability = availability;
        this.quoteRequests = quoteRequests;
        this.sequences = sequences;
        this.customers = customers;
        this.demoOneClick = demoOneClick;
    }

    @GetMapping("/home")
    public Map<String, Object> home() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("heroTitle", "EVERYTHING YOU NEED TO BUILD.");
        m.put("heroSubtitle", "From foundation to finish — quality building materials, hardware, timber and tools across all SNG branches.");
        m.put("categories", query.rootCategories().stream().map(c -> {
            Map<String, Object> cat = new LinkedHashMap<>();
            cat.put("slug", c.getSlug());
            cat.put("name", c.getName());
            cat.put("imageUrl", c.getImageUrl() == null ? "" : c.getImageUrl());
            cat.put("description", c.getDescription() == null ? "" : c.getDescription());
            cat.put("productCount", query.search(null, c.getSlug(), null, null, null, null, false, false, true).size());
            return cat;
        }).toList());
        m.put("featured", mapProducts(preferSkus(query.search(null, null, null, null, null, null, false, false, true)
                .stream().filter(Product::isFeatured).toList(), 8)));
        m.put("bestsellers", mapProducts(preferSkus(query.search(null, null, null, null, null, null, false, false, true)
                .stream().filter(Product::isBestseller).toList(), 8)));
        m.put("specials", mapProducts(query.search(null, null, null, null, null, null, false, true, true)));
        m.put("branches", locations.findByTypeAndActiveTrueOrderByName("SHOP").stream().map(Dtos::branch).toList());
        return m;
    }

    @GetMapping("/categories")
    public List<Map<String, Object>> cats() {
        return categories.findAll().stream().map(c -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", c.getId());
            m.put("slug", c.getSlug());
            m.put("name", c.getName());
            m.put("parentSlug", c.getParent() == null ? null : c.getParent().getSlug());
            m.put("imageUrl", c.getImageUrl());
            return m;
        }).toList();
    }

    @GetMapping("/products")
    public List<Map<String, Object>> products(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Long branchId,
            @RequestParam(defaultValue = "false") boolean inStock,
            @RequestParam(defaultValue = "false") boolean promotion) {
        return mapProducts(query.search(q, category, brand, minPrice, maxPrice, branchId, inStock, promotion, true));
    }

    @GetMapping("/products/{sku}")
    public Map<String, Object> detail(@PathVariable String sku, @AuthenticationPrincipal UserPrincipal principal) {
        Product p = query.requireSku(sku);
        if (!p.isWebsiteVisible() || !p.isActive()) {
            throw new com.sng.one.common.BusinessException("Product not found", 404);
        }
        query.recordView(p.getId());
        var related = query.search(null, p.getCategory() == null ? null : p.getCategory().getSlug(),
                        null, null, null, null, false, false, true)
                .stream().filter(o -> !o.getId().equals(p.getId())).limit(4).toList();
        Map<String, Object> m = Dtos.productDetail(p, query.publicPrice(p), query.tradePrice(p, principal), availability);
        m.put("related", mapProducts(related));
        return m;
    }

    @GetMapping("/branches")
    public List<Map<String, Object>> branches() {
        return locations.findByTypeAndActiveTrueOrderByName("SHOP").stream().map(Dtos::branch).toList();
    }

    @GetMapping("/config")
    public Map<String, Object> config() {
        return Map.of("demoOneClick", demoOneClick);
    }

    public record QuoteLineIn(Long productId, @NotBlank String sku, BigDecimal quantity) {}
    public record QuoteIn(@NotBlank String customerName, String phone, String email, Long preferredLocationId,
                          @NotBlank String fulfilment, String deliveryAddress, String notes, Boolean tradeCustomer,
                          @NotEmpty List<QuoteLineIn> lines) {}

    @PostMapping("/quote-requests")
    @Transactional
    public Map<String, Object> createQuote(@Valid @RequestBody QuoteIn in, @AuthenticationPrincipal UserPrincipal principal) {
        QuoteRequest q = new QuoteRequest();
        q.setReference(sequences.next("web_quote", "QT-WEB-", 5));
        q.setCustomerName(in.customerName());
        q.setPhone(in.phone());
        q.setEmail(in.email());
        q.setFulfilment(in.fulfilment());
        q.setDeliveryAddress(in.deliveryAddress());
        String notes = in.notes() == null ? "" : in.notes();
        if (Boolean.TRUE.equals(in.tradeCustomer())) {
            notes = (notes.isBlank() ? "" : notes + "\n") + "Trade customer enquiry";
        }
        q.setNotes(notes.isBlank() ? null : notes);
        q.setStatus("NEW");
        if (in.preferredLocationId() != null) {
            locations.findById(in.preferredLocationId()).ifPresent(q::setPreferredLocation);
        }
        if (principal != null) {
            customers.findByEmailIgnoreCase(principal.getUsername()).ifPresent(q::setCustomer);
        } else if (in.email() != null) {
            customers.findByEmailIgnoreCase(in.email()).ifPresent(q::setCustomer);
        }
        for (QuoteLineIn line : in.lines()) {
            Product p = query.requireSku(line.sku());
            q.addLine(p, line.quantity(), query.publicPrice(p));
        }
        quoteRequests.save(q);
        return Dtos.quoteRequest(q);
    }

    private List<Product> preferSkus(List<Product> list, int limit) {
        List<String> order = List.of(
                "CEM-PPC-50", "CEM-LAF-50", "TIM-PINE-38-114-3600", "TIM-PINE-38-114-6000",
                "ROF-IBR-3M", "ROF-IBR-48", "PNT-WHT-20", "ELC-GEY-150", "BRK-BLK-6IN",
                "ELC-CU-25", "PLB-PVC-50", "PLB-SINK-DBL", "DOR-SEC-813", "TOL-ANG-115",
                "TOL-DRL-18", "TOL-WHEL-65", "AGG-SAND-BLD", "AGG-SAND-RIV", "AGG-STN-19");
        List<Product> ranked = new ArrayList<>();
        for (String sku : order) {
            list.stream().filter(p -> sku.equalsIgnoreCase(p.getSku())).findFirst().ifPresent(ranked::add);
        }
        for (Product p : list) {
            if (ranked.stream().noneMatch(x -> x.getId().equals(p.getId()))) ranked.add(p);
        }
        return ranked.stream().limit(limit).toList();
    }

    private List<Map<String, Object>> mapProducts(List<Product> list) {
        return list.stream().map(p -> Dtos.productCard(p, query.publicPrice(p), availability)).toList();
    }
}
