package com.sng.one.transfer;

import com.sng.one.catalogue.Product;
import com.sng.one.fleet.Truck;
import com.sng.one.identity.AppUser;
import com.sng.one.location.Location;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;

@Service
public class TransferSeedSupport {
    private final StockTransferRepository transfers;

    public TransferSeedSupport(StockTransferRepository transfers) {
        this.transfers = transfers;
    }

    @Transactional
    public StockTransfer inTransit(String ref, Location from, Location to, Truck truck, AppUser driver,
                                   AppUser createdBy, Product product, BigDecimal qty) {
        StockTransfer t = new StockTransfer();
        t.setReference(ref);
        t.setFromLocation(from);
        t.setToLocation(to);
        t.setTruck(truck);
        t.setDriver(driver);
        t.setCreatedBy(createdBy);
        t.setStatus("IN_TRANSIT");
        t.setLoadedAt(Instant.now().minusSeconds(3600));
        t.setNotes("Stock rebalance");
        StockTransferLine line = new StockTransferLine();
        line.setTransfer(t);
        line.setProduct(product);
        line.setRequestedQty(qty);
        line.setLoadedQty(qty);
        t.getLines().add(line);
        return transfers.save(t);
    }
}
