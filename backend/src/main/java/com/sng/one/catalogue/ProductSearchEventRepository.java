package com.sng.one.catalogue;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProductSearchEventRepository extends JpaRepository<ProductSearchEvent, Long> {
    @Query(value = "select query, count(*) as c from product_search_events group by query order by c desc limit 8", nativeQuery = true)
    List<Object[]> topSearches();
}

interface ProductViewEventRepository extends JpaRepository<ProductViewEvent, Long> {
    @Query(value = "select product_id, count(*) as c from product_view_events group by product_id order by c desc limit 8", nativeQuery = true)
    List<Object[]> topViews();
}
