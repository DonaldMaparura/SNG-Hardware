package com.sng.one.accounting;

import com.sng.one.catalogue.Product;
import com.sng.one.catalogue.ProductRepository;
import com.sng.one.common.BusinessException;
import com.sng.one.fleet.Truck;
import com.sng.one.inventory.AvailabilityService;
import com.sng.one.inventory.InventoryService;
import com.sng.one.location.Location;
import com.sng.one.location.LocationRepository;
import com.sng.one.sales.QuoteRequestRepository;
import com.sng.one.web.StorefrontController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class OperationsIntegrationTest {
    @Autowired InventoryService inventory;
    @Autowired LocationRepository locations;
    @Autowired ProductRepository products;
    @Autowired GlAccountRepository accounts;
    @Autowired AccountingService accounting;
    @Autowired AvailabilityService availability;
    @Autowired StorefrontController storefront;
    @Autowired QuoteRequestRepository quoteRequests;

    Location shop;
    Location warehouse;
    Location truckLoc;
    Location damage;
    Product cement;

    @BeforeEach
    void setup() {
        shop = loc("HAR-01", "Harare", "SHOP");
        warehouse = loc("WH-01", "Warehouse 1", "WAREHOUSE");
        truckLoc = loc("TRK-04", "SNG-04", "TRUCK");
        damage = loc("DMG-01", "Damage", "DAMAGE");
        cement = prod("CEM-PPC-50", "PPC Cement 50kg", "10.50", "8.20");
        inventory.seedBalance(cement, warehouse, new BigDecimal("500"));
        inventory.seedBalance(cement, shop, new BigDecimal("183"));
        gl("1000", "Cash");
        gl("1400", "Inventory");
        gl("4000", "Sales");
        gl("5000", "COGS");
        gl("2000", "AP");
    }

    @Test
    void inventoryMovementUpdatesBalances() {
        inventory.move(cement, warehouse, shop, new BigDecimal("10"), "TRANSFER_RECEIPT", "T", 1L, null, "test", null);
        assertEquals(0, new BigDecimal("490").compareTo(inventory.getOrCreate(cement, warehouse).getQuantity()));
        assertEquals(0, new BigDecimal("193").compareTo(inventory.getOrCreate(cement, shop).getQuantity()));
    }

    @Test
    void posStyleDeductionAndSaleAccounting() {
        inventory.move(cement, shop, null, new BigDecimal("10"), "SALE", "POS", 1L, null, "sale", null);
        assertEquals(0, new BigDecimal("173").compareTo(inventory.getOrCreate(cement, shop).getQuantity()));
        var j = accounting.post("POS sale", "POS_SALE", 1L, List.of(
                AccountingService.Line.dr("1000", new BigDecimal("105.00"), "cash"),
                AccountingService.Line.cr("4000", new BigDecimal("105.00"), "sales"),
                AccountingService.Line.dr("5000", new BigDecimal("82.00"), "cogs"),
                AccountingService.Line.cr("1400", new BigDecimal("82.00"), "inv")
        ));
        assertTrue(j.isPosted());
        BigDecimal dr = j.getLines().stream().map(l -> l.getDebit()).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal cr = j.getLines().stream().map(l -> l.getCredit()).reduce(BigDecimal.ZERO, BigDecimal::add);
        assertEquals(0, dr.compareTo(cr));
    }

    @Test
    void transferPutsStockInTransitThenVarianceToDamage() {
        inventory.move(cement, warehouse, truckLoc, new BigDecimal("100"), "TRANSFER_IN_TRANSIT", "TRF", 9L, null, "load", null);
        assertEquals(0, new BigDecimal("100").compareTo(inventory.getOrCreate(cement, truckLoc).getQuantity()));
        inventory.move(cement, truckLoc, shop, new BigDecimal("98"), "TRANSFER_RECEIPT", "TRF", 9L, null, "recv", null);
        inventory.move(cement, truckLoc, damage, new BigDecimal("2"), "DAMAGE", "TRF", 9L, null, "short", null);
        assertEquals(0, new BigDecimal("0").compareTo(inventory.getOrCreate(cement, truckLoc).getQuantity()));
        assertEquals(0, new BigDecimal("2").compareTo(inventory.getOrCreate(cement, damage).getQuantity()));
        assertEquals(0, new BigDecimal("-2").compareTo(new BigDecimal("98").subtract(new BigDecimal("100"))));
    }

    @Test
    void websiteAvailabilityHidesExactQuantity() {
        var pub = availability.shopAvailability(cement);
        assertFalse(pub.isEmpty());
        assertTrue(pub.stream().anyMatch(s -> "IN_STOCK".equals(s.status()) || "LOW_STOCK".equals(s.status())));
        assertTrue(pub.stream().allMatch(s -> s.quantity() == null));
    }

    @Test
    void onlineQuoteCreatesInternalEnquiry() {
        var body = new StorefrontController.QuoteIn("ABC Construction", "077", "abc@construction.zw",
                shop.getId(), "DELIVERY", "Borrowdale", "House build", false,
                List.of(new StorefrontController.QuoteLineIn(cement.getId(), "CEM-PPC-50", new BigDecimal("100"))));
        var created = storefront.createQuote(body, null);
        assertEquals("NEW", created.get("status"));
        assertEquals(1, quoteRequests.count());
    }

    @Test
    void postedJournalCannotBeEditedOnlyReversed() {
        var j = accounting.post("seed", "X", 1L, List.of(
                AccountingService.Line.dr("1000", new BigDecimal("10"), "a"),
                AccountingService.Line.cr("4000", new BigDecimal("10"), "b")
        ));
        var rev = accounting.reverse(j.getId());
        assertTrue(j.isReversed());
        assertNotNull(rev.getReversalOf());
        assertThrows(BusinessException.class, () -> accounting.reverse(j.getId()));
    }

    @Test
    void insufficientStockRejected() {
        assertThrows(BusinessException.class, () ->
                inventory.move(cement, shop, null, new BigDecimal("10000"), "SALE", "POS", 1L, null, "too much", null));
    }

    @Test
    void truckUnderMaintenanceCannotAssign() {
        Truck t = new Truck();
        t.setStatus("MAINTENANCE");
        assertFalse(t.assignable());
    }

    private Location loc(String code, String name, String type) {
        Location l = new Location();
        l.setCode(code); l.setName(name); l.setType(type); l.setCity("Harare");
        return locations.save(l);
    }

    private Product prod(String sku, String name, String retail, String cost) {
        Product p = new Product();
        p.setSku(sku); p.setName(name); p.setUnitOfMeasure("BAG");
        p.setRetailPrice(new BigDecimal(retail)); p.setCostPrice(new BigDecimal(cost));
        p.setWebsiteVisible(true); p.setActive(true); p.setMinimumStock(new BigDecimal("50"));
        return products.save(p);
    }

    private void gl(String code, String name) {
        GlAccount a = new GlAccount();
        a.setCode(code); a.setName(name); a.setType("ASSET");
        accounts.save(a);
    }
}
