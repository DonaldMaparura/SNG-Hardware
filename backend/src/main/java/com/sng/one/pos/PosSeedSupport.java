package com.sng.one.pos;

import com.sng.one.catalogue.Product;
import com.sng.one.identity.AppUser;
import com.sng.one.location.Location;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;

/** Presentation seed helpers — creates completed sales without live auth. */
@Service
public class PosSeedSupport {
    private final TillSessionRepository tills;
    private final PosSaleRepository sales;

    public PosSeedSupport(TillSessionRepository tills, PosSaleRepository sales) {
        this.tills = tills;
        this.sales = sales;
    }

    @Transactional
    public TillSession openTill(AppUser cashier, Location location, BigDecimal openingFloat, Instant openedAt) {
        TillSession t = new TillSession();
        t.setCashier(cashier);
        t.setLocation(location);
        t.setOpeningFloat(openingFloat);
        t.setOpenedAt(openedAt);
        t.setStatus("OPEN");
        return tills.save(t);
    }

    @Transactional
    public void completeSale(TillSession till, AppUser cashier, Location location, String receiptNo,
                             Instant at, String paymentMethod, List<Line> lines) {
        BigDecimal sub = BigDecimal.ZERO;
        PosSale sale = new PosSale();
        sale.setReceiptNo(receiptNo);
        sale.setTillSession(till);
        sale.setLocation(location);
        sale.setCashier(cashier);
        sale.setStatus("COMPLETED");
        sale.setCreatedAt(at);
        sale.setDiscount(BigDecimal.ZERO);
        sale.setTax(BigDecimal.ZERO);
        for (Line line : lines) {
            PosSaleLine sl = new PosSaleLine();
            sl.setSale(sale);
            sl.setProduct(line.product());
            sl.setQuantity(line.qty());
            sl.setUnitPrice(line.unitPrice());
            BigDecimal lt = line.unitPrice().multiply(line.qty()).setScale(2, RoundingMode.HALF_UP);
            sl.setLineTotal(lt);
            sale.getLines().add(sl);
            sub = sub.add(lt);
        }
        sale.setSubtotal(sub);
        sale.setTotal(sub);
        PosPayment pay = new PosPayment();
        pay.setSale(sale);
        pay.setMethod(paymentMethod);
        pay.setAmount(sub);
        sale.getPayments().add(pay);
        sales.save(sale);
    }

    public record Line(Product product, BigDecimal qty, BigDecimal unitPrice) {}
}
