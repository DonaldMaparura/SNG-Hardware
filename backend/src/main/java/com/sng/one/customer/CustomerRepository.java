package com.sng.one.customer;

import com.sng.one.identity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByUser(AppUser user);
    Optional<Customer> findByEmailIgnoreCase(String email);
}
