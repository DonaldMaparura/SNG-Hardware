package com.sng.one.catalogue;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySkuIgnoreCase(String sku);
    Optional<Product> findByPlu(Integer plu);
    Optional<Product> findByBarcode(String barcode);

    @Query("""
            select p from Product p
            left join fetch p.category
            left join fetch p.subcategory
            where p.id = :id
            """)
    Optional<Product> findDetailedById(Long id);

    @Query("""
            select p from Product p
            left join fetch p.category
            where lower(p.sku) = lower(:sku)
            """)
    Optional<Product> findDetailedBySku(String sku);

    List<Product> findByActiveTrueAndWebsiteVisibleTrue();
}
