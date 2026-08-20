package com.sng.one.inventory;

import com.sng.one.catalogue.Product;
import com.sng.one.common.BusinessException;
import com.sng.one.identity.AppUser;
import com.sng.one.identity.AppUserRepository;
import com.sng.one.location.Location;
import com.sng.one.location.LocationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class InventoryService {
    private final StockBalanceRepository balances;
    private final StockMovementRepository movements;
    private final LocationRepository locations;
    private final AppUserRepository users;

    public InventoryService(StockBalanceRepository balances, StockMovementRepository movements,
                            LocationRepository locations, AppUserRepository users) {
        this.balances = balances;
        this.movements = movements;
        this.locations = locations;
        this.users = users;
    }

    @Transactional
    public StockMovement move(Product product, Location from, Location to, BigDecimal qty,
                              String type, String referenceType, Long referenceId,
                              Long userId, String reason, String notes) {
        if (qty == null || qty.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Quantity must be positive");
        }
        if (from == null && to == null) {
            throw new BusinessException("A stock movement needs a source or destination location");
        }
        if (from != null) {
            StockBalance src = getOrCreate(product, from);
            if (src.getQuantity().subtract(src.getReserved()).compareTo(qty) < 0
                    && !allowsNegativeSource(type)) {
                // Allow reserved to be consumed on SALE after reservation release
                if (src.getQuantity().compareTo(qty) < 0) {
                    throw new BusinessException("Insufficient stock of " + product.getSku() + " at " + from.getName());
                }
            }
            src.setQuantity(src.getQuantity().subtract(qty));
            balances.save(src);
        }
        if (to != null) {
            StockBalance dest = getOrCreate(product, to);
            dest.setQuantity(dest.getQuantity().add(qty));
            balances.save(dest);
        }
        StockMovement m = new StockMovement();
        m.setProduct(product);
        m.setFromLocation(from);
        m.setToLocation(to);
        m.setQuantity(qty);
        m.setMovementType(type);
        m.setReferenceType(referenceType);
        m.setReferenceId(referenceId);
        if (userId != null) {
            users.findById(userId).ifPresent(m::setUser);
        }
        m.setReason(reason);
        m.setNotes(notes);
        return movements.save(m);
    }

    @Transactional
    public void reserve(Product product, Location location, BigDecimal qty) {
        StockBalance b = getOrCreate(product, location);
        if (b.getQuantity().subtract(b.getReserved()).compareTo(qty) < 0) {
            throw new BusinessException("Cannot reserve " + qty + " of " + product.getSku() + " at " + location.getName());
        }
        b.setReserved(b.getReserved().add(qty));
        balances.save(b);
    }

    @Transactional
    public void releaseReserve(Product product, Location location, BigDecimal qty) {
        StockBalance b = getOrCreate(product, location);
        BigDecimal next = b.getReserved().subtract(qty);
        if (next.compareTo(BigDecimal.ZERO) < 0) next = BigDecimal.ZERO;
        b.setReserved(next);
        balances.save(b);
    }

    @Transactional
    public void seedBalance(Product product, Location location, BigDecimal qty) {
        StockBalance b = getOrCreate(product, location);
        b.setQuantity(qty);
        balances.save(b);
    }

    public StockBalance getOrCreate(Product product, Location location) {
        return balances.findByProductAndLocation(product, location).orElseGet(() -> {
            StockBalance b = new StockBalance();
            b.setProduct(product);
            b.setLocation(location);
            b.setQuantity(BigDecimal.ZERO);
            b.setReserved(BigDecimal.ZERO);
            return balances.save(b);
        });
    }

    public Location requireLocation(String code) {
        return locations.findByCode(code).orElseThrow(() -> new BusinessException("Location not found: " + code, 404));
    }

    public Location requireLocation(Long id) {
        return locations.findById(id).orElseThrow(() -> new BusinessException("Location not found", 404));
    }

    public AppUser requireUser(Long id) {
        return users.findById(id).orElseThrow(() -> new BusinessException("User not found", 404));
    }

    private boolean allowsNegativeSource(String type) {
        return "STOCKTAKE_VARIANCE".equals(type) || "ADJUSTMENT".equals(type);
    }
}
