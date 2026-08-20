package com.sng.one.identity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByEmailIgnoreCase(String email);

    @Query("select u from AppUser u left join fetch u.locations left join fetch u.homeLocation where lower(u.email) = lower(:email)")
    Optional<AppUser> findWithLocationsByEmail(String email);

    @Query("select u from AppUser u left join fetch u.locations left join fetch u.homeLocation where u.id = :id")
    Optional<AppUser> findWithLocationsById(Long id);
}
