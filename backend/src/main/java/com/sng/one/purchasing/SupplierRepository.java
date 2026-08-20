package com.sng.one.purchasing;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {}

interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    @Query("select p from PurchaseOrder p left join fetch p.lines l left join fetch l.product where p.id = :id")
    Optional<PurchaseOrder> findDetailed(Long id);

    @Query("select p from PurchaseOrder p left join fetch p.supplier left join fetch p.location order by p.createdAt desc")
    List<PurchaseOrder> findAllHeader();
}

interface GoodsReceiptRepository extends JpaRepository<GoodsReceipt, Long> {
    @Query("select g from GoodsReceipt g left join fetch g.lines l left join fetch l.product order by g.receivedAt desc")
    List<GoodsReceipt> findAllDetailed();
}
