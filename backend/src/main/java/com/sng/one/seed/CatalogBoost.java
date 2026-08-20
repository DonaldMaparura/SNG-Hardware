package com.sng.one.seed;

import com.sng.one.catalogue.Category;
import com.sng.one.catalogue.CategoryRepository;
import com.sng.one.catalogue.Product;
import com.sng.one.catalogue.ProductRepository;
import com.sng.one.inventory.InventoryService;
import com.sng.one.location.Location;
import com.sng.one.location.LocationRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Component
@Order(200)
public class CatalogBoost implements CommandLineRunner {
    private final ProductRepository products;
    private final CategoryRepository categories;
    private final LocationRepository locations;
    private final InventoryService inventory;
    private final boolean enabled;

    public CatalogBoost(ProductRepository products, CategoryRepository categories,
                        LocationRepository locations, InventoryService inventory,
                        @Value("${sng.storefront-boost:false}") boolean enabled) {
        this.products = products;
        this.categories = categories;
        this.locations = locations;
        this.inventory = inventory;
        this.enabled = enabled;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!enabled || products.count() == 0) return;
        refreshImages();
        rename("PNT-WHT-20", "20L Interior Paint");
        rename("ROF-IBR-026", "IBR Roofing Sheet 6m");
        add("ROF-IBR-3M", "IBR Roofing Sheet 3m", "Galvanised IBR roof sheet, 3 metre.", "0.5mm × 3m IBR",
                "roofing", "Safintra", "LENGTH", "7.20", "11.80", "10.60", "10.90", 9301, "/img/roof.jpg", true, true);
        add("ROF-IBR-48", "IBR Roofing Sheet 4.8m", "Galvanised IBR roof sheet, 4.8 metre.", "0.5mm × 4.8m IBR",
                "roofing", "Safintra", "LENGTH", "8.60", "13.40", "12.10", null, 9302, "/img/roof.jpg", true, false);
        add("TOL-DRL-18", "Cordless Drill 18V", "18V cordless drill for site work.", "18V kit",
                "tools", "Bosch", "EACH", "48.00", "89.00", "79.00", "82.00", 9303, "/img/tools.jpg", true, true);
        add("PLB-SINK-DBL", "Double Kitchen Sink", "Stainless double bowl kitchen sink.", "1440mm",
                "plumbing", "SNG Plumbing", "EACH", "62.00", "118.00", "104.00", null, 9304, "/img/pipe.jpg", true, false);
        add("DOR-SEC-813", "Security Door 813mm", "Steel security door with frame.", "813 × 2032mm",
                "doors-windows", "SNG Doors", "EACH", "95.00", "185.00", "168.00", "174.00", 9305, "/img/door.jpg", true, true);
        add("ELC-CU-25", "Copper Cable 2.5mm 100m", "2.5mm copper building wire.", "2.5mm² 100m",
                "electrical", "Southwire", "EACH", "42.00", "68.00", "61.00", null, 9306, "/img/cable.jpg", true, false);
        add("AGG-SAND-BLD", "Builders Sand", "Plaster and mortar sand.", "Cubic metre",
                "sand-aggregates", "SNG Aggregates", "CUBIC_METRE", "16.00", "28.00", "25.00", null, 9307, "/img/sand.jpg", true, true);
    }

    private void rename(String sku, String name) {
        products.findBySkuIgnoreCase(sku).ifPresent(p -> {
            p.setName(name);
            products.save(p);
        });
    }

    private void refreshImages() {
        for (Product p : products.findAll()) {
            String slug = p.getCategory() == null ? "" : p.getCategory().getSlug();
            p.setImageUrl(imageFor(slug, p.getSku()));
            products.save(p);
        }
        for (Category c : categories.findAll()) {
            c.setImageUrl(imageFor(c.getSlug(), null));
            categories.save(c);
        }
    }

    private void add(String sku, String name, String desc, String spec, String catSlug, String brand, String uom,
                     String cost, String retail, String trade, String promo, int plu, String image,
                     boolean featured, boolean best) {
        if (products.findBySkuIgnoreCase(sku).isPresent()) return;
        Category cat = categories.findBySlug(catSlug).orElse(null);
        if (cat == null) return;
        Product p = new Product();
        p.setSku(sku);
        p.setName(name);
        p.setDescription(desc);
        p.setSpecification(spec);
        p.setCategory(cat);
        p.setBrand(brand);
        p.setUnitOfMeasure(uom);
        p.setCostPrice(new BigDecimal(cost));
        p.setRetailPrice(new BigDecimal(retail));
        p.setTradePrice(new BigDecimal(trade));
        if (promo != null) p.setPromotionPrice(new BigDecimal(promo));
        p.setPlu(plu);
        p.setMinimumStock(BigDecimal.valueOf(20));
        p.setReorderQuantity(BigDecimal.valueOf(20));
        p.setImageUrl(image);
        p.setFeatured(featured);
        p.setBestseller(best);
        p.setKeywords(name + " " + brand + " " + sku);
        p.setWebsiteVisible(true);
        p.setActive(true);
        products.save(p);
        List<Location> shops = locations.findByTypeAndActiveTrueOrderByName("SHOP");
        List<Location> warehouses = locations.findByType("WAREHOUSE");
        int i = 0;
        for (Location s : shops) {
            inventory.seedBalance(p, s, BigDecimal.valueOf(40 + (i++ * 18L)));
        }
        i = 0;
        for (Location w : warehouses) {
            inventory.seedBalance(p, w, BigDecimal.valueOf(120 + (i++ * 40L)));
        }
    }

    static String imageFor(String slug, String sku) {
        if (sku != null) {
            if (sku.startsWith("CEM-LAF")) return "/img/cement2.jpg";
            if (sku.startsWith("CEM-")) return "/img/cement.jpg";
            if (sku.startsWith("TIM-")) return "/img/timber.jpg";
            if (sku.startsWith("ROF-")) return "/img/roof.jpg";
            if (sku.startsWith("BRK-")) return "/img/brick.jpg";
            if (sku.startsWith("PLB-TOI")) return "/img/toilet.jpg";
            if (sku.startsWith("PLB-TAP")) return "/img/tap.jpg";
            if (sku.startsWith("PLB-")) return "/img/pipe.jpg";
            if (sku.startsWith("ELC-GEY")) return "/img/geyser.jpg";
            if (sku.startsWith("ELC-")) return "/img/cable.jpg";
            if (sku.startsWith("PNT-")) return "/img/paint.jpg";
            if (sku.startsWith("DOR-") || sku.startsWith("WIN-")) return "/img/door.jpg";
            if (sku.startsWith("TOL-")) return "/img/tools.jpg";
            if (sku.startsWith("AGG-")) return "/img/sand.jpg";
        }
        if (slug == null) return "/img/tools.jpg";
        if (slug.contains("timber")) return "/img/timber.jpg";
        if (slug.contains("cement")) return "/img/cement.jpg";
        if (slug.contains("roof")) return "/img/roof.jpg";
        if (slug.contains("brick")) return "/img/brick.jpg";
        if (slug.contains("plumb")) return "/img/pipe.jpg";
        if (slug.contains("elec")) return "/img/cable.jpg";
        if (slug.contains("paint")) return "/img/paint.jpg";
        if (slug.contains("door")) return "/img/door.jpg";
        if (slug.contains("tool")) return "/img/tools.jpg";
        return "/img/sand.jpg";
    }
}
