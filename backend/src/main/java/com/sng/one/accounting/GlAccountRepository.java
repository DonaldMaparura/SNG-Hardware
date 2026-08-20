package com.sng.one.accounting;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface GlAccountRepository extends JpaRepository<GlAccount, Long> {
    Optional<GlAccount> findByCode(String code);
}

interface JournalRepository extends JpaRepository<Journal, Long> {
    @Query("select j from Journal j left join fetch j.lines l left join fetch l.account where j.id = :id")
    Optional<Journal> findDetailed(Long id);

    @Query("select j from Journal j left join fetch j.lines l left join fetch l.account order by j.createdAt desc")
    List<Journal> findAllDetailed();

    List<Journal> findBySourceTypeAndSourceId(String sourceType, Long sourceId);
}
