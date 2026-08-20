package com.sng.one.sales;

import com.sng.one.customer.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface QuoteRepository extends JpaRepository<Quote, Long> {
    List<Quote> findByCustomerOrderByCreatedAtDesc(Customer customer);

    @Query("select q from Quote q left join fetch q.lines l left join fetch l.product where q.id = :id")
    Optional<Quote> findDetailed(Long id);

    @Query("select q from Quote q left join fetch q.customer left join fetch q.location order by q.createdAt desc")
    List<Quote> findAllHeader();
}

interface SalesOrderRepository extends JpaRepository<SalesOrder, Long> {
    List<SalesOrder> findByCustomerOrderByCreatedAtDesc(Customer customer);

    @Query("select o from SalesOrder o left join fetch o.lines l left join fetch l.product where o.id = :id")
    Optional<SalesOrder> findDetailed(Long id);

    @Query("select o from SalesOrder o left join fetch o.customer left join fetch o.location order by o.createdAt desc")
    List<SalesOrder> findAllHeader();

    long countByStatusIn(List<String> statuses);
}

interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByCustomerOrderByCreatedAtDesc(Customer customer);

    @Query("select i from Invoice i left join fetch i.lines l left join fetch l.product where i.id = :id")
    Optional<Invoice> findDetailed(Long id);
}
