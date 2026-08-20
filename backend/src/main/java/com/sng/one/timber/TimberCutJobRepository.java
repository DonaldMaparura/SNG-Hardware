package com.sng.one.timber;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface TimberCutJobRepository extends JpaRepository<TimberCutJob, Long> {
    @Query("select j from TimberCutJob j left join fetch j.pieces left join fetch j.sourceProduct where j.id = :id")
    Optional<TimberCutJob> findDetailed(Long id);

    @Query("select j from TimberCutJob j left join fetch j.sourceProduct left join fetch j.location order by j.createdAt desc")
    List<TimberCutJob> findAllHeader();
}
