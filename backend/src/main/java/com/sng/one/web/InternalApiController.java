package com.sng.one.web;

import com.sng.one.accounting.AccountingService;
import com.sng.one.audit.AuditLogRepository;
import com.sng.one.catalogue.*;
import com.sng.one.common.BusinessException;
import com.sng.one.customer.Customer;
import com.sng.one.customer.CustomerAddressRepository;
import com.sng.one.customer.CustomerRepository;
import com.sng.one.fleet.FleetService;
import com.sng.one.fleet.TruckRepository;
import com.sng.one.inventory.AvailabilityService;
import com.sng.one.inventory.StockBalanceRepository;
import com.sng.one.inventory.StockMovementRepository;
import com.sng.one.location.LocationRepository;
import com.sng.one.pos.PosService;
import com.sng.one.pos.TillSession;
import com.sng.one.purchasing.PurchasingService;
import com.sng.one.purchasing.SupplierRepository;
import com.sng.one.sales.QuoteRequestRepository;
import com.sng.one.sales.SalesWorkflowService;
import com.sng.one.security.CurrentUser;
import com.sng.one.security.UserPrincipal;
import com.sng.one.timber.TimberService;
import com.sng.one.transfer.StockTransferRepository;
import com.sng.one.transfer.TransferService;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.*;

@RestController
@RequestMapping("/api")
@Transactional
public class InternalApiController {
    private final ProductQueryService query;
    private final ProductRepository products;
    private final AvailabilityService availability;
    private final StockBalanceRepository balances;
    private final StockMovementRepository movements;
    private final LocationRepository locations;
    private final PosService pos;
    private final QuoteRequestRepository quoteRequests;
    private final SalesWorkflowService sales;
    private final TransferService transfers;
    private final StockTransferRepository transferRepo;
    private final TimberService timber;
    private final FleetService fleet;
    private final TruckRepository trucks;
    private final PurchasingService purchasing;
    private final SupplierRepository suppliers;
    private final CustomerRepository customers;
    private final CustomerAddressRepository addresses;
    private final CurrentUser currentUser;
    private final AuditLogRepository auditLogs;
    private final AccountingService accounting;
    private final ProductSearchEventRepository searches;
    private final com.sng.one.audit.AuditService auditService;

    public InternalApiController(ProductQueryService query, ProductRepository products, AvailabilityService availability,
                                 StockBalanceRepository balances, StockMovementRepository movements,
                                 LocationRepository locations, PosService pos, QuoteRequestRepository quoteRequests,
                                 SalesWorkflowService sales, TransferService transfers, StockTransferRepository transferRepo,
                                 TimberService timber, FleetService fleet, TruckRepository trucks,
                                 PurchasingService purchasing, SupplierRepository suppliers, CustomerRepository customers,
                                 CustomerAddressRepository addresses, CurrentUser currentUser, AuditLogRepository auditLogs,
                                 AccountingService accounting, ProductSearchEventRepository searches,
                                 com.sng.one.audit.AuditService auditService) {
        this.query = query;
        this.products = products;
        this.availability = availability;
        this.balances = balances;
        this.movements = movements;
        this.locations = locations;
        this.pos = pos;
        this.quoteRequests = quoteRequests;
        this.sales = sales;
        this.transfers = transfers;
        this.transferRepo = transferRepo;
        this.timber = timber;
        this.fleet = fleet;
        this.trucks = trucks;
        this.purchasing = purchasing;
        this.suppliers = suppliers;
        this.customers = customers;
        this.addresses = addresses;
        this.currentUser = currentUser;
        this.auditLogs = auditLogs;
        this.accounting = accounting;
        this.searches = searches;
        this.auditService = auditService;
    }

    @GetMapping("/locations")
    public List<Map<String, Object>> locs(@RequestParam(required = false) String type) {
        var list = type == null ? locations.findAll() : locations.findByType(type);
        return list.stream().map(Dtos::branch).toList();
    }

    @GetMapping("/products/search")
    public List<Map<String, Object>> search(@RequestParam(required = false) String q) {
        return query.search(q, null, null, null, null, null, false, false, false)
                .stream().map(p -> Dtos.productCard(p, query.publicPrice(p), availability)).toList();
    }

    public record PriceUpdate(BigDecimal retailPrice, BigDecimal tradePrice, BigDecimal promotionPrice, String reason) {}

    @PutMapping("/products/{id}/prices")
    @Transactional
    public Map<String, Object> updatePrice(@PathVariable Long id, @RequestBody PriceUpdate in) {
        currentUser.assertWritable();
        Product p = products.findById(id).orElseThrow(() -> new BusinessException("Product not found", 404));
        String before = String.valueOf(p.getRetailPrice());
        if (in.retailPrice() != null) p.setRetailPrice(in.retailPrice());
        if (in.tradePrice() != null) p.setTradePrice(in.tradePrice());
        p.setPromotionPrice(in.promotionPrice());
        p.setUpdatedAt(Instant.now());
        products.save(p);
        auditService.record(currentUser.require(), "PRICE_CHANGE", "Product", p.getSku(), before,
                String.valueOf(p.getRetailPrice()), null, in.reason(), "APP");
        return Dtos.productDetail(p, query.publicPrice(p), p.getTradePrice(), availability);
    }

    @GetMapping("/inventory/{sku}")
    public Map<String, Object> inventory(@PathVariable String sku) {
        Product p = query.requireSku(sku);
        Map<String, Object> m = new LinkedHashMap<>();
        Map<String, Object> product = Dtos.productDetail(p, query.publicPrice(p), p.getTradePrice(), availability);
        product.put("costPrice", p.getCostPrice());
        m.put("product", product);
        m.put("breakdown", availability.inventoryBreakdown(p));
        m.put("value", balances.totalForProduct(p).multiply(p.getCostPrice()));
        m.put("movements", movements.findTop20ByProductOrderByCreatedAtDesc(p).stream().map(mv -> Map.of(
                "id", mv.getId(),
                "type", mv.getMovementType(),
                "qty", mv.getQuantity(),
                "from", mv.getFromLocation() == null ? "" : mv.getFromLocation().getName(),
                "to", mv.getToLocation() == null ? "" : mv.getToLocation().getName(),
                "reason", mv.getReason() == null ? "" : mv.getReason(),
                "at", mv.getCreatedAt(),
                "user", mv.getUser() == null ? "" : mv.getUser().getFullName()
        )).toList());
        return m;
    }

    @GetMapping("/inventory/low-stock")
    public List<Map<String, Object>> lowStock() {
        List<Map<String, Object>> out = new ArrayList<>();
        for (Product p : products.findAll()) {
            BigDecimal total = balances.totalForProduct(p);
            if (p.getMinimumStock() != null && total.compareTo(p.getMinimumStock()) <= 0) {
                out.add(Map.of("sku", p.getSku(), "name", p.getName(), "total", total, "minimum", p.getMinimumStock()));
            }
        }
        return out;
    }

    @PostMapping("/pos/till/open")
    public Map<String, Object> openTill(@RequestBody Map<String, Object> body) {
        Long loc = ((Number) body.get("locationId")).longValue();
        BigDecimal flt = new BigDecimal(body.get("openingFloat").toString());
        TillSession t = pos.open(flt, loc);
        return Map.of("id", t.getId(), "status", t.getStatus(), "openingFloat", t.getOpeningFloat(),
                "location", t.getLocation().getName());
    }

    @GetMapping("/pos/till/current")
    public Object currentTill() {
        TillSession t = pos.current();
        if (t == null) return Map.of("open", false);
        return Map.of("open", true, "id", t.getId(), "openingFloat", t.getOpeningFloat(),
                "locationId", t.getLocation().getId(), "location", t.getLocation().getName());
    }

    @PostMapping("/pos/checkout")
    public Map<String, Object> checkout(@RequestBody PosService.SaleIn in) {
        return pos.checkout(in);
    }

    @PostMapping("/pos/till/close")
    public Map<String, Object> closeTill(@RequestBody Map<String, String> body) {
        TillSession t = pos.close(new BigDecimal(body.get("countedCash")), body.get("reason"));
        return Map.of("expected", t.getExpectedCash(), "counted", t.getCountedCash(),
                "variance", t.getVariance(), "reason", t.getVarianceReason() == null ? "" : t.getVarianceReason());
    }

    @GetMapping("/enquiries")
    public List<Map<String, Object>> enquiries() {
        return quoteRequests.findAllDetailed().stream().map(Dtos::quoteRequest).toList();
    }

    @GetMapping("/enquiries/{id}")
    public Map<String, Object> enquiry(@PathVariable Long id) {
        return Dtos.quoteRequest(quoteRequests.findDetailed(id)
                .orElseThrow(() -> new com.sng.one.common.BusinessException("Request not found", 404)));
    }

    public record StatusIn(String status) {}

    @PostMapping("/enquiries/{id}/status")
    public Map<String, Object> enquiryStatus(@PathVariable Long id, @RequestBody StatusIn in) {
        return sales.updateEnquiryStatus(id, in == null ? null : in.status());
    }

    @PostMapping("/enquiries/{id}/convert")
    public Map<String, Object> convert(@PathVariable Long id) {
        return sales.convertEnquiry(id);
    }

    @GetMapping("/quotes")
    public List<Map<String, Object>> quotes() {
        return sales.quoteDtoList();
    }

    @PostMapping("/quotes/{id}/accept")
    public Map<String, Object> accept(@PathVariable Long id) {
        return sales.acceptQuote(id);
    }

    @GetMapping("/orders")
    public List<Map<String, Object>> orderList() {
        return sales.listOrders();
    }

    @PostMapping("/orders/{id}/invoice")
    public Map<String, Object> invoice(@PathVariable Long id) {
        return sales.invoiceOrder(id);
    }

    @PostMapping("/transfers")
    public Map<String, Object> createTransfer(@RequestBody TransferService.CreateIn in) {
        return transfers.dto(transfers.create(in));
    }

    @GetMapping("/transfers")
    public List<Map<String, Object>> listTransfers() {
        return transferRepo.findAllHeader().stream().map(transfers::dto).toList();
    }

    @GetMapping("/transfers/{id}")
    public Map<String, Object> getTransfer(@PathVariable Long id) {
        return transfers.dto(transferRepo.findDetailed(id).orElseThrow(() -> new BusinessException("Not found", 404)));
    }

    @PostMapping("/transfers/{id}/status/{status}")
    public Map<String, Object> trStatus(@PathVariable Long id, @PathVariable String status) {
        return transfers.dto(transfers.transition(id, status));
    }

    @PostMapping("/transfers/{id}/load")
    public Map<String, Object> load(@PathVariable Long id) {
        return transfers.dto(transfers.load(id));
    }

    @PostMapping("/transfers/{id}/receive")
    public Map<String, Object> receive(@PathVariable Long id, @RequestBody TransferService.ReceiveIn in) {
        return transfers.dto(transfers.receive(id, in));
    }

    @PostMapping("/timber/preview")
    public Map<String, Object> timberPreview(@RequestBody TimberService.CreateIn in) {
        return timber.preview(in);
    }

    @PostMapping("/timber")
    public Map<String, Object> timberCreate(@RequestBody TimberService.CreateIn in) {
        return timber.dto(timber.create(in));
    }

    @GetMapping("/timber")
    public List<Map<String, Object>> timberList() {
        return timber.list();
    }

    @GetMapping("/timber/{id}")
    public Map<String, Object> timberGet(@PathVariable Long id) {
        return timber.get(id);
    }

    @PostMapping("/timber/{id}/status/{status}")
    public Map<String, Object> timberStatus(@PathVariable Long id, @PathVariable String status) {
        return timber.dto(timber.setStatus(id, status));
    }

    @PostMapping("/timber/{id}/complete")
    public Map<String, Object> timberComplete(@PathVariable Long id) {
        return timber.dto(timber.complete(id));
    }

    @GetMapping("/fleet/trucks")
    public List<Map<String, Object>> truckList() {
        return fleet.listTrucks();
    }

    @GetMapping("/fleet/trucks/{id}")
    public Map<String, Object> truck(@PathVariable Long id) {
        var t = trucks.findById(id).orElseThrow(() -> new BusinessException("Not found", 404));
        Map<String, Object> m = fleet.truckDto(t);
        m.put("maintenance", fleet.maintenanceFor(t));
        return m;
    }

    @PostMapping("/fleet/trucks/{id}/maintenance")
    public Map<String, Object> maint(@PathVariable Long id, @RequestBody FleetService.MaintenanceIn in) {
        return fleet.recordMaintenance(id, in);
    }

    @GetMapping("/fleet/trips")
    public List<Map<String, Object>> tripList(@AuthenticationPrincipal UserPrincipal p) {
        if ("DRIVER".equals(p.getRole())) {
            return fleet.listTripDtos(p.getId());
        }
        return fleet.listTripDtos(null);
    }

    @PostMapping("/fleet/trips/{id}/{action}")
    public Map<String, Object> tripAction(@PathVariable Long id, @PathVariable String action) {
        return fleet.driverAction(id, action.toUpperCase());
    }

    @PostMapping("/fleet/trips/{id}/pod")
    public Map<String, Object> pod(@PathVariable Long id, @RequestBody FleetService.PodIn in) {
        return fleet.pod(id, in);
    }

    @GetMapping("/purchasing/suppliers")
    public Object supplierList() {
        return suppliers.findAll();
    }

    @PostMapping("/purchasing/orders")
    public Map<String, Object> poCreate(@RequestBody PurchasingService.CreatePo in) {
        return purchasing.create(in);
    }

    @GetMapping("/purchasing/orders")
    public List<Map<String, Object>> poList() {
        return purchasing.list();
    }

    @PostMapping("/purchasing/orders/{id}/status/{status}")
    public Map<String, Object> poStatus(@PathVariable Long id, @PathVariable String status) {
        return purchasing.setStatus(id, status);
    }

    @PostMapping("/purchasing/orders/{id}/receive")
    public Map<String, Object> poReceive(@PathVariable Long id, @RequestBody PurchasingService.ReceiveIn in) {
        return purchasing.receive(id, in);
    }

    @GetMapping("/customers")
    public List<Map<String, Object>> customerList() {
        return customers.findAll().stream().map(this::custDto).toList();
    }

    @GetMapping("/account/me")
    public Map<String, Object> accountMe(@AuthenticationPrincipal UserPrincipal p) {
        Customer c = customers.findByEmailIgnoreCase(p.getUsername())
                .orElseThrow(() -> new BusinessException("Customer profile not found", 404));
        Map<String, Object> m = custDto(c);
        m.put("addresses", addresses.findByCustomer(c).stream().map(a -> Map.of(
                "id", a.getId(), "label", a.getLabel(), "line1", a.getLine1(), "city", a.getCity()
        )).toList());
        m.put("quotes", quoteRequests.findByEmailIgnoreCaseOrderByCreatedAtDesc(c.getEmail()).stream().map(Dtos::quoteRequest).toList());
        return m;
    }

    @GetMapping("/journals")
    public List<Map<String, Object>> journalList() {
        return accounting.listMaps();
    }

    @PostMapping("/journals/{id}/reverse")
    public Map<String, Object> reverse(@PathVariable Long id) {
        currentUser.assertWritable();
        return accounting.reverseMap(id);
    }

    @GetMapping("/audit")
    public Object audit(@RequestParam(defaultValue = "0") int page,
                        @RequestParam(required = false) String entity) {
        var p = entity == null || entity.isBlank()
                ? auditLogs.findAllByOrderByCreatedAtDesc(PageRequest.of(page, 50))
                : auditLogs.findByEntityIgnoreCase(entity, PageRequest.of(page, 50));
        return Map.of("total", p.getTotalElements(), "items", p.getContent().stream().map(a -> Map.of(
                "id", a.getId(),
                "action", a.getAction(),
                "entity", a.getEntity(),
                "entityId", a.getEntityId() == null ? "" : a.getEntityId(),
                "before", a.getBeforeJson() == null ? "" : a.getBeforeJson(),
                "after", a.getAfterJson() == null ? "" : a.getAfterJson(),
                "user", a.getUser() == null ? "" : a.getUser().getFullName(),
                "reason", a.getReason() == null ? "" : a.getReason(),
                "at", a.getCreatedAt()
        )).toList());
    }

    @GetMapping("/reports/{name}")
    public Object reports(@PathVariable String name) {
        Instant startMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay().toInstant(ZoneOffset.UTC);
        return switch (name) {
            case "sales-by-branch" -> pos.salesByBranch();
            case "low-stock" -> lowStock();
            case "trial-balance" -> accounting.trialBalance();
            case "top-searches" -> searches.topSearches();
            default -> Map.of("error", "Unknown report");
        };
    }

    @GetMapping("/reports/{name}.csv")
    public String csv(@PathVariable String name) {
        Object data = reports(name);
        return "report," + name + "\n" + data.toString();
    }

    @GetMapping("/dashboard")
    public Map<String, Object> dashboard() {
        Instant startDay = LocalDate.now().atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant startMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay().toInstant(ZoneOffset.UTC);
        Map<String, Object> m = new LinkedHashMap<>();
        List<Map<String, Object>> low = lowStock();
        long outOfStock = low.stream()
                .filter(row -> {
                    Object total = row.get("total");
                    if (total instanceof BigDecimal bd) return bd.compareTo(BigDecimal.ZERO) <= 0;
                    if (total instanceof Number n) return n.doubleValue() <= 0;
                    return false;
                })
                .count();
        m.put("salesToday", pos.salesSince(startDay));
        m.put("salesMonth", pos.salesSince(startMonth));
        m.put("onlineEnquiriesToday", quoteRequests.countByCreatedAtAfter(startDay));
        m.put("openCustomerRequests", quoteRequests.countByStatus("NEW"));
        m.put("outOfStockCount", outOfStock);
        m.put("openOrders", sales.countOpen());
        m.put("inventoryValue", balances.totalInventoryValue());
        m.put("lowStockCount", low.size());
        m.put("openTransfers", transferRepo.countByStatusNotIn(List.of("COMPLETED", "CANCELLED")));
        m.put("fleet", fleet.statusCounts());
        m.put("trucksDueService", fleet.dueServiceCount());
        m.put("creditOutstanding", customers.findAll().stream().map(Customer::getOutstanding)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        m.put("topSearches", searches.topSearches());
        m.put("branchPerformance", pos.salesByBranch());
        m.put("enquiries", quoteRequests.findAllDetailed().stream().limit(8).map(Dtos::quoteRequest).toList());
        return m;
    }

    private Map<String, Object> custDto(Customer c) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", c.getId());
        m.put("accountCode", c.getAccountCode());
        m.put("name", c.getName());
        m.put("type", c.getType());
        m.put("email", c.getEmail());
        m.put("phone", c.getPhone());
        m.put("creditLimit", c.getCreditLimit());
        m.put("outstanding", c.getOutstanding());
        m.put("available", c.availableCredit());
        return m;
    }
}
