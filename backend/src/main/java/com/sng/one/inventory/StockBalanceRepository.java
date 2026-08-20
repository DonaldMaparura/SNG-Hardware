package com.sng.one.inventory;

import com.sng.one.catalogue.Product;
import com.sng.one.location.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import jakarta.persistence.LockModeType;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface StockBalanceRepository extends JpaRepository<StockBalance, StockBalanceId> {
    Optional<StockBalance> findByProductAndLocation(Product product, Location location);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select b from StockBalance b where b.product = :product and b.location = :location")
    Optional<StockBalance> findForUpdate(Product product, Location location);

    List<StockBalance> findByProduct(Product product);

    @Query("select coalesce(sum(b.quantity),0) from StockBalance b where b.product = :product")
    BigDecimal totalForProduct(Product product);

    @Query("""
            select coalesce(sum(b.quantity * p.costPrice),0) from StockBalance b
            join b.product p join b.location l
            where l.type <> 'CUSTOMER'
            """)
    BigDecimal totalInventoryValue();
}
