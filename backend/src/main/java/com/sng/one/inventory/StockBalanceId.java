package com.sng.one.inventory;

import java.io.Serializable;
import java.util.Objects;

public class StockBalanceId implements Serializable {
    private Long product;
    private Long location;

    public StockBalanceId() {}

    public StockBalanceId(Long product, Long location) {
        this.product = product;
        this.location = location;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof StockBalanceId that)) return false;
        return Objects.equals(product, that.product) && Objects.equals(location, that.location);
    }

    @Override
    public int hashCode() {
        return Objects.hash(product, location);
    }
}
