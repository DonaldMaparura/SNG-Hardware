package com.sng.one.pos;

import com.sng.one.identity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface TillSessionRepository extends JpaRepository<TillSession, Long> {
    Optional<TillSession> findFirstByCashierAndStatus(AppUser cashier, String status);
    List<TillSession> findByStatusOrderByOpenedAtDesc(String status);
}

interface PosSaleRepository extends JpaRepository<PosSale, Long> {
    @Query("select s from PosSale s left join fetch s.lines l left join fetch l.product left join fetch s.payments where s.id = :id")
    Optional<PosSale> findDetailed(Long id);

    List<PosSale> findByTillSession(TillSession session);

    @Query("select coalesce(sum(s.total),0) from PosSale s where s.createdAt >= :from and s.status = 'COMPLETED'")
    java.math.BigDecimal salesSince(Instant from);
}
