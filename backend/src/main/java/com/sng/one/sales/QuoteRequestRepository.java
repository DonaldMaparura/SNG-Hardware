package com.sng.one.sales;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface QuoteRequestRepository extends JpaRepository<QuoteRequest, Long> {
    @Query("select q from QuoteRequest q left join fetch q.lines l left join fetch l.product order by q.createdAt desc")
    List<QuoteRequest> findAllDetailed();

    @Query("select q from QuoteRequest q left join fetch q.lines l left join fetch l.product where q.id = :id")
    Optional<QuoteRequest> findDetailed(Long id);

    List<QuoteRequest> findByEmailIgnoreCaseOrderByCreatedAtDesc(String email);

    long countByCreatedAtAfter(Instant after);

    long countByStatus(String status);
}
