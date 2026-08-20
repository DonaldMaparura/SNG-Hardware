package com.sng.one.inventory;

import com.sng.one.catalogue.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
    List<StockMovement> findTop20ByProductOrderByCreatedAtDesc(Product product);
    List<StockMovement> findByReferenceTypeAndReferenceId(String referenceType, Long referenceId);
}
