package com.sng.one.inventory;

import com.sng.one.catalogue.Product;
import com.sng.one.location.Location;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AvailabilityService {
    private final StockBalanceRepository balances;

    @Value("${sng.public.expose-exact-quantities:false}")
    private boolean exposeExact;

    public AvailabilityService(StockBalanceRepository balances) {
        this.balances = balances;
    }

    public record PublicStock(Long locationId, String locationCode, String locationName, String city, String status, BigDecimal quantity) {}

    public String statusFor(Product product, BigDecimal qty) {
        if (qty == null || qty.compareTo(BigDecimal.ZERO) <= 0) return "OUT_OF_STOCK";
        BigDecimal min = product.getMinimumStock() == null ? BigDecimal.ZERO : product.getMinimumStock();
        if (min.compareTo(BigDecimal.ZERO) > 0 && qty.compareTo(min) <= 0) return "LOW_STOCK";
        if (qty.compareTo(new BigDecimal("10")) < 0 && min.compareTo(BigDecimal.ZERO) == 0) return "LOW_STOCK";
        return "IN_STOCK";
    }

    public List<PublicStock> shopAvailability(Product product) {
        return balances.findByProduct(product).stream()
                .filter(b -> "SHOP".equals(b.getLocation().getType()))
                .map(b -> {
                    Location loc = b.getLocation();
                    String status = statusFor(product, available(b));
                    BigDecimal shown = exposeExact ? available(b) : null;
                    return new PublicStock(loc.getId(), loc.getCode(), loc.getName(), loc.getCity(), status, shown);
                })
                .toList();
    }

    public long inStockShopCount(Product product) {
        return shopAvailability(product).stream().filter(s -> !"OUT_OF_STOCK".equals(s.status())).count();
    }

    public boolean anyInStock(Product product) {
        return balances.findByProduct(product).stream()
                .anyMatch(b -> available(b).compareTo(BigDecimal.ZERO) > 0
                        && ("SHOP".equals(b.getLocation().getType()) || "WAREHOUSE".equals(b.getLocation().getType())));
    }

    public Map<String, Object> inventoryBreakdown(Product product) {
        Map<String, Object> map = new LinkedHashMap<>();
        BigDecimal total = BigDecimal.ZERO;
        BigDecimal transit = BigDecimal.ZERO;
        for (StockBalance b : balances.findByProduct(product)) {
            Location loc = b.getLocation();
            map.put(loc.getCode(), Map.of(
                    "name", loc.getName(),
                    "type", loc.getType(),
                    "quantity", b.getQuantity(),
                    "reserved", b.getReserved(),
                    "available", available(b)
            ));
            total = total.add(b.getQuantity());
            if ("IN_TRANSIT".equals(loc.getType()) || "TRUCK".equals(loc.getType())) {
                transit = transit.add(b.getQuantity());
            }
        }
        map.put("TOTAL", total);
        map.put("IN_TRANSIT_TOTAL", transit);
        return map;
    }

    public BigDecimal available(StockBalance b) {
        return b.getQuantity().subtract(b.getReserved());
    }
}
