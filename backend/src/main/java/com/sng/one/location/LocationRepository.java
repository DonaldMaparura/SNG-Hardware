package com.sng.one.location;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LocationRepository extends JpaRepository<Location, Long> {
    Optional<Location> findByCode(String code);
    List<Location> findByTypeAndActiveTrueOrderByName(String type);
    List<Location> findByType(String type);
}
