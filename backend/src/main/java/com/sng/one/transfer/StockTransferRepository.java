package com.sng.one.transfer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface StockTransferRepository extends JpaRepository<StockTransfer, Long> {
    @Query("select t from StockTransfer t left join fetch t.lines l left join fetch l.product where t.id = :id")
    Optional<StockTransfer> findDetailed(Long id);

    @Query("select t from StockTransfer t left join fetch t.fromLocation left join fetch t.toLocation left join fetch t.truck order by t.createdAt desc")
    List<StockTransfer> findAllHeader();

    long countByStatusNotIn(List<String> statuses);
}
