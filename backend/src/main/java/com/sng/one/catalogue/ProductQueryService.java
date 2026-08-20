package com.sng.one.catalogue;

import com.sng.one.common.BusinessException;
import com.sng.one.inventory.AvailabilityService;
import com.sng.one.inventory.StockBalance;
import com.sng.one.inventory.StockBalanceRepository;
import com.sng.one.location.Location;
import com.sng.one.location.LocationRepository;
import com.sng.one.security.UserPrincipal;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
public class ProductQueryService {
    private final EntityManager em;
    private final ProductRepository products;
    private final CategoryRepository categories;
    private final AvailabilityService availability;
    private final StockBalanceRepository balances;
    private final LocationRepository locations;
    private final ProductSearchEventRepository searches;
    private final ProductViewEventRepository views;

    public ProductQueryService(EntityManager em, ProductRepository products, CategoryRepository categories,
                               AvailabilityService availability, StockBalanceRepository balances,
                               LocationRepository locations, ProductSearchEventRepository searches,
                               ProductViewEventRepository views) {
        this.em = em;
        this.products = products;
        this.categories = categories;
        this.availability = availability;
        this.balances = balances;
        this.locations = locations;
        this.searches = searches;
        this.views = views;
    }

    @Transactional
    public List<Product> search(String q, String categorySlug, String brand, BigDecimal minPrice, BigDecimal maxPrice,
                                Long branchId, boolean inStock, boolean promotion, boolean websiteOnly) {
        StringBuilder jpql = new StringBuilder("select distinct p from Product p left join p.category c left join p.subcategory sc where 1=1 ");
        Map<String, Object> params = new HashMap<>();
        if (websiteOnly) {
            jpql.append("and p.active = true and p.websiteVisible = true ");
        }
        if (q != null && !q.isBlank()) {
            jpql.append("""
                    and (lower(p.name) like :q or lower(p.sku) like :q or lower(coalesce(p.brand,'')) like :q
                    or lower(coalesce(p.keywords,'')) like :q or lower(coalesce(p.barcode,'')) like :q
                    or lower(coalesce(p.supplierCode,'')) like :q or cast(p.plu as string) like :q) 
                    """);
            params.put("q", "%" + q.toLowerCase().trim() + "%");
            ProductSearchEvent ev = new ProductSearchEvent();
            ev.setQuery(q.trim().toLowerCase());
            searches.save(ev);
        }
        if (categorySlug != null && !categorySlug.isBlank()) {
            jpql.append("and (c.slug = :cat or sc.slug = :cat) ");
            params.put("cat", categorySlug);
        }
        if (brand != null && !brand.isBlank()) {
            jpql.append("and lower(p.brand) = :brand ");
            params.put("brand", brand.toLowerCase());
        }
        if (minPrice != null) {
            jpql.append("and coalesce(p.promotionPrice, p.retailPrice) >= :minP ");
            params.put("minP", minPrice);
        }
        if (maxPrice != null) {
            jpql.append("and coalesce(p.promotionPrice, p.retailPrice) <= :maxP ");
            params.put("maxP", maxPrice);
        }
        if (promotion) {
            jpql.append("and p.promotionPrice is not null ");
        }
        jpql.append("order by p.name");
        TypedQuery<Product> query = em.createQuery(jpql.toString(), Product.class);
        params.forEach(query::setParameter);
        List<Product> list = query.getResultList();
        if (branchId != null || inStock) {
            Location loc = branchId == null ? null : locations.findById(branchId).orElse(null);
            list = list.stream().filter(p -> {
                if (loc != null) {
                    BigDecimal qty = balances.findByProductAndLocation(p, loc)
                            .map(StockBalance::getQuantity).orElse(BigDecimal.ZERO);
                    if (qty.compareTo(BigDecimal.ZERO) <= 0) return false;
                }
                return !inStock || availability.anyInStock(p);
            }).toList();
        }
        return list;
    }

    @Transactional
    public Product requireSku(String sku) {
        return products.findDetailedBySku(sku).orElseThrow(() -> new BusinessException("Product not found", 404));
    }

    @Transactional
    public void recordView(Long productId) {
        ProductViewEvent ev = new ProductViewEvent();
        ev.setProductId(productId);
        views.save(ev);
    }

    public BigDecimal publicPrice(Product p) {
        return p.getPromotionPrice() != null ? p.getPromotionPrice() : p.getRetailPrice();
    }

    public BigDecimal tradePrice(Product p, UserPrincipal user) {
        if (user != null && "CUSTOMER".equals(user.getRole()) && p.getTradePrice() != null) {
            return p.getTradePrice();
        }
        return null;
    }

    public List<Category> rootCategories() {
        return categories.findByParentIsNullOrderBySortOrder();
    }
}
