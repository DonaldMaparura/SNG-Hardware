package com.sng.one.seed;

import com.sng.one.accounting.AccountingService;
import com.sng.one.accounting.GlAccount;
import com.sng.one.accounting.GlAccountRepository;
import com.sng.one.audit.AuditService;
import com.sng.one.catalogue.Category;
import com.sng.one.catalogue.CategoryRepository;
import com.sng.one.catalogue.Product;
import com.sng.one.catalogue.ProductRepository;
import com.sng.one.customer.Customer;
import com.sng.one.customer.CustomerAddress;
import com.sng.one.customer.CustomerAddressRepository;
import com.sng.one.customer.CustomerRepository;
import com.sng.one.fleet.Truck;
import com.sng.one.fleet.TruckRepository;
import com.sng.one.identity.AppUser;
import com.sng.one.identity.AppUserRepository;
import com.sng.one.identity.RoleCode;
import com.sng.one.inventory.InventoryService;
import com.sng.one.location.Location;
import com.sng.one.location.LocationRepository;
import com.sng.one.purchasing.Supplier;
import com.sng.one.purchasing.SupplierRepository;
import com.sng.one.sales.QuoteRequest;
import com.sng.one.sales.QuoteRequestRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Configuration
public class SeedConfig {
    @Bean
    CommandLineRunner seed(AppUserRepository users, LocationRepository locations, CategoryRepository categories,
                           ProductRepository products, InventoryService inventory, GlAccountRepository accounts,
                           CustomerRepository customers, CustomerAddressRepository addresses, TruckRepository trucks,
                           SupplierRepository suppliers, QuoteRequestRepository enquiries, PasswordEncoder encoder,
                           AccountingService accounting, AuditService audit,
                           org.springframework.core.env.Environment env) {
        return args -> {
            if (users.count() > 0) return;
            if (!env.getProperty("sng.seed", Boolean.class, true)) return;

            Location harare = loc(locations, "HAR-01", "Harare Branch", "SHOP", "1 Simon Mazorodze Rd", "Harare", "+263 242 621000", "Mon–Sat 07:00–17:00", "POS, collection, quotes, deliveries");
            Location byo = loc(locations, "BYO-01", "Bulawayo Branch", "SHOP", "12 Khami Road", "Bulawayo", "+263 292 88011", "Mon–Sat 07:00–17:00", "POS, collection, quotes");
            Location gweru = loc(locations, "GWE-01", "Gweru Branch", "SHOP", "Main Street", "Gweru", "+263 254 22011", "Mon–Sat 07:30–16:30", "POS, collection");
            Location mutare = loc(locations, "MUT-01", "Mutare Branch", "SHOP", "Aerodrome Road", "Mutare", "+263 20 64611", "Mon–Sat 07:30–16:30", "POS, collection");
            Location masvingo = loc(locations, "MSV-01", "Masvingo Branch", "SHOP", "Hughes Street", "Masvingo", "+263 39 262011", "Mon–Sat 07:30–16:30", "POS, collection");
            Location wh1 = loc(locations, "WH-01", "Warehouse 1 — Harare DC", "WAREHOUSE", "Willowvale Industrial", "Harare", "+263 242 621100", "Mon–Sat 06:00–18:00", "Receiving, transfers, timber cutting");
            Location wh2 = loc(locations, "WH-02", "Warehouse 2 — Bulawayo DC", "WAREHOUSE", "Belmont", "Bulawayo", "+263 292 88090", "Mon–Sat 06:00–18:00", "Receiving, transfers");
            Location wh3 = loc(locations, "WH-03", "Warehouse 3 — Gweru DC", "WAREHOUSE", "Light Industrial", "Gweru", "+263 254 22090", "Mon–Fri 07:00–17:00", "Receiving");
            Location wh4 = loc(locations, "WH-04", "Warehouse 4 — Mutare DC", "WAREHOUSE", "Industrial Area", "Mutare", "+263 20 64690", "Mon–Fri 07:00–17:00", "Receiving");
            Location t1 = loc(locations, "TRK-01", "Truck SNG-01", "TRUCK", null, "Harare", null, null, "Fleet");
            Location t2 = loc(locations, "TRK-02", "Truck SNG-02", "TRUCK", null, "Bulawayo", null, null, "Fleet");
            Location t3 = loc(locations, "TRK-03", "Truck SNG-03", "TRUCK", null, "Gweru", null, null, "Fleet");
            Location t4 = loc(locations, "TRK-04", "Truck SNG-04", "TRUCK", null, "Harare", null, null, "Fleet");
            loc(locations, "TRANSIT-01", "In Transit", "IN_TRANSIT", null, null, null, null, "Stock moving");
            loc(locations, "DMG-01", "Damage / Write-off", "DAMAGE", "Warehouse 1 quarantine", "Harare", null, null, "Damaged goods");
            loc(locations, "CUST-01", "Customer locations", "CUSTOMER", null, null, null, null, "Delivered stock");

            String pw = encoder.encode("SngOne2026!");
            Set<Location> allSites = Set.of(harare, byo, gweru, mutare, masvingo, wh1, wh2, wh3, wh4);
            AppUser admin = user(users, "admin@sng.one", pw, "Nomsa Admin", RoleCode.ADMIN, harare, allSites);
            AppUser gm = user(users, "gm@sng.one", pw, "Tinashe General Manager", RoleCode.GENERAL_MANAGER, harare, allSites);
            user(users, "ops@sng.one", pw, "Rutendo Operations Manager", RoleCode.OPERATIONS_MANAGER, harare, allSites);
            user(users, "director@sng.one", pw, "Sarah Director", RoleCode.DIRECTOR, harare, allSites);
            user(users, "director2@sng.one", pw, "Joseph Director", RoleCode.DIRECTOR, harare, allSites);
            user(users, "harare.manager@sng.one", pw, "Chipo Branch Manager", RoleCode.BRANCH_MANAGER, harare, Set.of(harare));
            AppUser wm = user(users, "warehouse.manager@sng.one", pw, "Farai Warehouse Manager", RoleCode.WAREHOUSE_MANAGER, wh1, Set.of(wh1, wh2));
            user(users, "warehouse.op@sng.one", pw, "Rudo Warehouse Operator", RoleCode.WAREHOUSE_OPERATOR, wh1, Set.of(wh1));
            user(users, "cashier@sng.one", pw, "Blessing Store Operator", RoleCode.STORE_OPERATOR, harare, Set.of(harare));
            user(users, "finance@sng.one", pw, "Nyasha Finance Controller", RoleCode.FINANCE_CONTROLLER, harare, Set.of(harare, byo, gweru, mutare, masvingo, wh1));
            user(users, "auditor@sng.one", pw, "Tariro Auditor", RoleCode.AUDITOR, harare, allSites);
            AppUser tendai = user(users, "driver@sng.one", pw, "Tendai Driver", RoleCode.DRIVER, wh1, Set.of(wh1, harare, gweru));
            AppUser custUser = user(users, "abc@construction.zw", pw, "ABC Construction", RoleCode.CUSTOMER, harare, Set.of());

            gl(accounts, "1000", "Cash", "ASSET");
            gl(accounts, "1010", "Bank", "ASSET");
            gl(accounts, "1100", "Accounts Receivable", "ASSET");
            gl(accounts, "1400", "Inventory", "ASSET");
            gl(accounts, "1410", "Inventory In Transit", "ASSET");
            gl(accounts, "1600", "Vehicles", "ASSET");
            gl(accounts, "2000", "Accounts Payable", "LIABILITY");
            gl(accounts, "2100", "Tax Payable", "LIABILITY");
            gl(accounts, "3000", "Retained Earnings", "EQUITY");
            gl(accounts, "4000", "Sales Revenue", "REVENUE");
            gl(accounts, "4100", "Delivery Revenue", "REVENUE");
            gl(accounts, "5000", "Cost of Goods Sold", "EXPENSE");
            gl(accounts, "5100", "Fuel", "EXPENSE");
            gl(accounts, "5200", "Repairs & Maintenance", "EXPENSE");
            gl(accounts, "5300", "General Expenses", "EXPENSE");

            Category cement = cat(categories, "cement-concrete", "Cement & Concrete", "Bags, mix and masonry cement", 1);
            Category timber = cat(categories, "timber", "Timber", "Structural pine and treated timber", 2);
            Category roofing = cat(categories, "roofing", "Roofing", "Sheets, ridges and fasteners", 3);
            Category bricks = cat(categories, "bricks-blocks", "Bricks & Blocks", "Clay bricks and concrete blocks", 4);
            Category plumbing = cat(categories, "plumbing", "Plumbing", "Pipes, tanks, toilets and taps", 5);
            Category electrical = cat(categories, "electrical", "Electrical", "Cable, geysers and fittings", 6);
            Category paint = cat(categories, "paint", "Paint", "Interior, exterior and primers", 7);
            Category doors = cat(categories, "doors-windows", "Doors & Windows", "Doors, frames and glass", 8);
            Category tools = cat(categories, "tools", "Tools", "Hand and power tools", 9);
            Category sand = cat(categories, "sand-aggregates", "Sand & Aggregates", "River sand, stone and dust", 10);

            Product ppc = product(products, "CEM-PPC-50", "PPC Cement 50kg", "General purpose OPC for concrete, mortar and plaster.", "50kg bag · OPC", cement, "PPC", "BAG", "8.20", "10.50", "9.80", "9.95", 1001, "6001234567890", "PPC-50", 200, img("cement"), true, true);
            Product lafarge = product(products, "CEM-LAF-50", "Lafarge Cement 50kg", "High-strength cement for structural work.", "50kg bag", cement, "Lafarge", "BAG", "8.00", "10.20", "9.60", null, 1002, null, "LAF-50", 180, img("cement2"), true, true);
            Product pine36 = product(products, "TIM-PINE-38-114-3600", "Pine 38x114x3.6m", "Kiln-dried structural pine.", "38 × 114 × 3600mm", timber, "SNG Timber", "LENGTH", "4.10", "6.80", "6.20", null, 2001, null, "PINE-36114", 80, img("timber"), true, false);
            Product pine42 = product(products, "TIM-PINE-38-114-4200", "Pine 38x114x4.2m", "Kiln-dried structural pine.", "38 × 114 × 4200mm", timber, "SNG Timber", "LENGTH", "4.80", "7.90", "7.20", null, 2002, null, null, 60, img("timber"), false, false);
            Product pine60 = product(products, "TIM-PINE-38-114-6000", "Pine 38x114x6.0m", "Full length structural pine for cutting.", "38 × 114 × 6000mm", timber, "SNG Timber", "LENGTH", "6.40", "11.50", "10.40", null, 2003, null, "PINE-60114", 40, img("timber"), true, true);
            Product pine24 = product(products, "TIM-PINE-38-114-2400", "Pine 38x114x2.4m", "Cut-to-length pine.", "38 × 114 × 2400mm", timber, "SNG Timber", "LENGTH", "3.10", "5.20", "4.70", null, 2004, null, null, 20, img("timber"), false, false);
            Product offcut = product(products, "TIM-PINE-38-114-OFFCUT", "Pine 38x114 reusable offcut", "Reusable offcut sold by the metre.", "38 × 114mm · metre", timber, "SNG Timber", "METRE", "1.20", "2.10", "1.90", null, 2099, null, null, 5, img("timber"), false, false);
            pine60.setThicknessMm(new BigDecimal("38"));
            pine60.setWidthMm(new BigDecimal("114"));
            pine60.setLengthMm(new BigDecimal("6000"));
            products.save(pine60);

            Product roof = product(products, "ROF-IBR-026", "IBR Roofing Sheet 0.5mm", "Galvanised IBR roof sheet.", "0.5mm × 6m IBR", roofing, "Safintra", "LENGTH", "9.40", "14.80", "13.50", "13.90", 3001, "6009876543210", "IBR-05", 100, img("roof"), true, true);
            Product door = product(products, "DOR-EXT-813", "External Hardwood Door 813mm", "Solid hardwood exterior door.", "813 × 2032mm", doors, "SNG Doors", "EACH", "42.00", "78.00", "69.00", null, 4001, null, "DOR-813", 15, img("door"), true, false);
            Product paint20 = product(products, "PNT-WHT-20", "20L Interior Paint", "Interior PVA for walls and ceilings.", "20 litre", paint, "Plascon", "LITRE", "18.00", "32.50", "29.00", "29.90", 5001, null, "PVA-20", 40, img("paint"), true, true);
            Product pipe = product(products, "PLB-PVC-50", "PVC Pressure Pipe 50mm x 6m", "Class 9 PVC.", "50mm × 6m", plumbing, "Duraplast", "LENGTH", "6.20", "11.40", "10.20", null, 6001, null, "PVC50", 50, img("pipe"), false, true);
            Product cable = product(products, "ELC-2.5-100", "2.5mm Twin & Earth 100m", "House wiring cable.", "2.5mm² 100m", electrical, "Southwire", "EACH", "38.00", "62.00", "55.00", null, 7001, null, "TNE25", 20, img("cable"), true, false);
            Product hammer = product(products, "TOL-HAM-16", "Claw Hammer 16oz", "Steel shaft hammer.", "16oz", tools, "Stanley", "EACH", "4.50", "9.90", "8.50", null, 8001, "0050333333333", "HAM16", 10, img("tools"), false, true);
            Product brick = product(products, "BRK-CLY-STD", "Standard Clay Brick", "Burnt clay brick.", "222 × 106 × 73mm", bricks, "SNG Bricks", "EACH", "0.12", "0.28", "0.24", null, 1201, null, "BRK", 5000, img("brick"), true, true);
            Product river = product(products, "AGG-SAND-RIV", "River Sand", "Washed river sand.", "Cubic metre", sand, "SNG Aggregates", "CUBIC_METRE", "18.00", "32.00", "28.00", null, 1201, null, "SAND", 20, img("sand"), true, false);
            // PLU 1201 conflict - river should be 1202 as spec said 1201 River Sand and 1001 cement. Brick shouldn't share 1201.
            brick.setPlu(1301);
            products.save(brick);
            river.setPlu(1201);
            products.save(river);
            Product stone = product(products, "AGG-STN-19", "19mm Stone", "Crushed stone.", "Cubic metre", sand, "SNG Aggregates", "CUBIC_METRE", "22.00", "38.00", "34.00", null, 1203, null, "STN19", 15, img("stone"), false, true);
            Product geyser = product(products, "ELC-GEY-150", "150L Electric Geyser", "High-pressure geyser.", "150 litre", electrical, "Kwikot", "EACH", "145.00", "265.00", "240.00", null, 7101, null, "GEY150", 5, img("geyser"), true, false);
            Product toilet = product(products, "PLB-TOI-CLS", "Close-Coupled Toilet Suite", "Ceramic WC suite.", "P-trap", plumbing, "Vaal", "EACH", "48.00", "89.00", "79.00", null, 6101, null, "TOI", 8, img("toilet"), false, true);
            Product tap = product(products, "PLB-TAP-MIX", "Chrome Basin Mixer Tap", "Single lever mixer.", "15mm", plumbing, "Cobra", "EACH", "12.00", "24.50", "21.00", null, 6102, null, "TAP", 12, img("tap"), false, false);

            moreProducts(products, cement, timber, roofing, bricks, plumbing, electrical, paint, doors, tools, sand);

            List<Location> shops = List.of(harare, byo, gweru, mutare, masvingo);
            List<Location> whs = List.of(wh1, wh2, wh3, wh4);
            for (Product p : products.findAll()) {
                int i = 0;
                for (Location s : shops) {
                    BigDecimal qty = switch (i++) {
                        case 0 -> qtyFor(p, 183);
                        case 1 -> qtyFor(p, 221);
                        case 2 -> qtyFor(p, 94);
                        case 3 -> qtyFor(p, 202);
                        default -> qtyFor(p, 114);
                    };
                    inventory.seedBalance(p, s, qty);
                }
                i = 0;
                for (Location w : whs) {
                    BigDecimal qty = switch (i++) {
                        case 0 -> qtyFor(p, 1024);
                        case 1 -> qtyFor(p, 618);
                        case 2 -> qtyFor(p, 221);
                        default -> qtyFor(p, 165);
                    };
                    inventory.seedBalance(p, w, qty);
                }
            }
            inventory.seedBalance(ppc, t4, new BigDecimal("100"));

            Customer abc = new Customer();
            abc.setUser(custUser);
            abc.setAccountCode("TRD-ABC-001");
            abc.setName("ABC Construction");
            abc.setType("TRADE");
            abc.setEmail("abc@construction.zw");
            abc.setPhone("+263 77 212 0001");
            abc.setCreditLimit(new BigDecimal("25000"));
            abc.setOutstanding(new BigDecimal("8000"));
            customers.save(abc);
            CustomerAddress addr = new CustomerAddress();
            addr.setCustomer(abc);
            addr.setLabel("Site office");
            addr.setLine1("Stand 44, Borrowdale Brooke");
            addr.setCity("Harare");
            addr.setDefault(true);
            addresses.save(addr);

            Customer walk = new Customer();
            walk.setAccountCode("RET-0001");
            walk.setName("Walk-in Retail");
            walk.setType("RETAIL");
            walk.setEmail("walkin@sng.one");
            walk.setPhone("+263 77 000 0000");
            customers.save(walk);

            Supplier ppcSup = new Supplier();
            ppcSup.setCode("SUP-PPC");
            ppcSup.setName("PPC Zimbabwe");
            ppcSup.setEmail("orders@ppc.co.zw");
            suppliers.save(ppcSup);
            Supplier timSup = new Supplier();
            timSup.setCode("SUP-TIM");
            timSup.setName("Border Timbers");
            timSup.setEmail("sales@bordertimbers.co.zw");
            suppliers.save(timSup);

            Truck sng04 = truck(trucks, "AFQ-1404", "SNG-04", "Isuzu", "NQR", tendai, t4, 126420, 120000, 130000);
            truck(trucks, "AFQ-1401", "SNG-01", "Hino", "500", tendai, t1, 98000, 90000, 110000);
            truck(trucks, "AFQ-1402", "SNG-02", "Isuzu", "FTR", null, t2, 154000, 150000, 160000);
            truck(trucks, "AFQ-1403", "SNG-03", "UD", "Croner", null, t3, 72000, 70000, 85000);

            QuoteRequest q = new QuoteRequest();
            q.setReference("ENQ-000041");
            q.setCustomer(abc);
            q.setCustomerName("ABC Construction");
            q.setPhone(abc.getPhone());
            q.setEmail(abc.getEmail());
            q.setPreferredLocation(harare);
            q.setFulfilment("DELIVERY");
            q.setDeliveryAddress("Stand 44, Borrowdale Brooke, Harare");
            q.setNotes("House build — need delivery this week");
            q.setStatus("NEW");
            addLine(q, ppc, 100, ppc.getRetailPrice());
            addLine(q, pine60, 20, pine60.getRetailPrice());
            addLine(q, roof, 40, roof.getPromotionPrice() == null ? roof.getRetailPrice() : roof.getPromotionPrice());
            enquiries.save(q);

            accounting.post("Opening inventory capitalisation", "SEED", 0L, List.of(
                    AccountingService.Line.dr("1400", new BigDecimal("2500000.00"), "Opening stock"),
                    AccountingService.Line.cr("3000", new BigDecimal("2500000.00"), "Opening equity")
            ));
            accounting.post("Demo POS sale seed", "POS_SALE", 0L, List.of(
                    AccountingService.Line.dr("1000", new BigDecimal("105.00"), "Cash"),
                    AccountingService.Line.cr("4000", new BigDecimal("105.00"), "Sales"),
                    AccountingService.Line.dr("5000", new BigDecimal("82.00"), "COGS"),
                    AccountingService.Line.cr("1400", new BigDecimal("82.00"), "Inventory")
            ));

            audit.record(admin.getId(), "SEED", "System", "0", null, "Demo environment seeded", harare.getId(), "Initial load");
            audit.record(gm.getId(), "PRICE_CHANGE", "Product", "CEM-PPC-50", "10.00", "10.50", harare.getId(), "Quarterly price review");
            audit.record(wm.getId(), "DAMAGE", "Product", "CEM-PPC-50", "504", "492", wh1.getId(), "Damaged bags");
        };
    }

    private static void addLine(QuoteRequest q, Product p, int qty, BigDecimal price) {
        q.addLine(p, BigDecimal.valueOf(qty), price);
    }

    private static BigDecimal qtyFor(Product p, int base) {
        if ("CEM-PPC-50".equals(p.getSku())) return BigDecimal.valueOf(base);
        if ("BAG".equals(p.getUnitOfMeasure()) || "EACH".equals(p.getUnitOfMeasure())) return BigDecimal.valueOf(Math.max(8, base / 4));
        if ("CUBIC_METRE".equals(p.getUnitOfMeasure())) return BigDecimal.valueOf(Math.max(12, base / 10));
        return BigDecimal.valueOf(Math.max(10, base / 6));
    }

    private static void moreProducts(ProductRepository products, Category cement, Category timber, Category roofing,
                                     Category bricks, Category plumbing, Category electrical, Category paint,
                                     Category doors, Category tools, Category sand) {
        String[][] extra = {
                {"CEM-PPC-42.5", "PPC 42.5N Cement 50kg", "BAG", "PPC", "cement"},
                {"CEM-MASON-25", "Masonry Cement 25kg", "BAG", "PPC", "cement"},
                {"CEM-BOND-20", "Concrete Bonding Agent 20L", "LITRE", "Sika", "cement"},
                {"TIM-PINE-50-152-3600", "Pine 50x152x3.6m", "LENGTH", "SNG Timber", "timber"},
                {"TIM-PINE-38-38-3000", "Pine 38x38x3.0m", "LENGTH", "SNG Timber", "timber"},
                {"TIM-TREAT-76-76", "Treated Pole 76-100mm", "LENGTH", "SNG Timber", "timber"},
                {"ROF-IBR-3M", "IBR Roofing Sheet 3m", "LENGTH", "Safintra", "roof"},
                {"ROF-IBR-48", "IBR Roofing Sheet 4.8m", "LENGTH", "Safintra", "roof"},
                {"ROF-CORR-026", "Corrugated Sheet 0.4mm", "LENGTH", "Safintra", "roof"},
                {"ROF-RID-IBR", "IBR Ridge Cap", "EACH", "Safintra", "roof"},
                {"ROF-SCREW-65", "Roofing Screws 65mm (100)", "BOX", "Hilti", "roof"},
                {"BRK-BLK-6IN", "6 Inch Concrete Block", "EACH", "SNG Bricks", "brick"},
                {"BRK-PAVE-60", "60mm Paving Brick", "EACH", "SNG Bricks", "brick"},
                {"PLB-SINK-DBL", "Double Kitchen Sink", "EACH", "SNG Plumbing", "pipe"},
                {"PLB-PVC-110", "PVC Sewer 110mm x 6m", "LENGTH", "Duraplast", "pipe"},
                {"PLB-TANK-2500", "2500L Water Tank", "EACH", "JoJo", "pipe"},
                {"PLB-ELB-50", "PVC Elbow 50mm", "EACH", "Duraplast", "pipe"},
                {"ELC-1.5-100", "1.5mm Twin & Earth 100m", "EACH", "Southwire", "cable"},
                {"ELC-DB-12", "12-Way Distribution Board", "EACH", "Crabtree", "cable"},
                {"ELC-SW-1G", "1 Gang Light Switch", "EACH", "Crabtree", "cable"},
                {"PNT-PRM-5", "Plaster Primer 5L", "LITRE", "Plascon", "paint"},
                {"PNT-EXT-20", "Exterior WeatherGuard 20L", "LITRE", "Dulux", "paint"},
                {"PNT-THN-5", "Mineral Turpentine 5L", "LITRE", "SNG", "paint"},
                {"DOR-SEC-813", "Security Door 813mm", "EACH", "SNG Doors", "door"},
                {"DOR-INT-726", "Internal Hollow Core 726mm", "EACH", "SNG Doors", "door"},
                {"DOR-FRM-813", "Door Frame 813mm", "EACH", "SNG Doors", "door"},
                {"WIN-AL-1200", "Aluminium Window 1.2m", "EACH", "SNG Aluminium", "door"},
                {"TOL-WL-5M", "Tape Measure 5m", "EACH", "Stanley", "tools"},
                {"TOL-TWL-24", "Adjustable Spanner 24\"", "EACH", "Stanley", "tools"},
                {"TOL-ANG-115", "Angle Grinder 115mm", "EACH", "Bosch", "tools"},
                {"TOL-DRL-18", "Cordless Drill 18V", "EACH", "Bosch", "tools"},
                {"ELC-CU-25", "Copper Cable 2.5mm 100m", "EACH", "Southwire", "cable"},
                {"AGG-SAND-BLD", "Builders Sand", "CUBIC_METRE", "SNG Aggregates", "sand"},
                {"AGG-DUST", "Crusher Dust", "CUBIC_METRE", "SNG Aggregates", "sand"},
                {"AGG-PIT", "Pit Sand", "CUBIC_METRE", "SNG Aggregates", "sand"},
                {"CEM-LIME-25", "Building Lime 25kg", "BAG", "PPC", "cement"},
                {"ROF-FLSH", "Wall Flashing 3m", "LENGTH", "Safintra", "roof"},
                {"PLB-GUT-110", "PVC Gutter 110mm 4m", "LENGTH", "Duraplast", "pipe"},
                {"ELC-CON-20", "20mm Conduit 4m", "LENGTH", "SNG Electrical", "cable"},
                {"PNT-BRS-100", "Paint Brush 100mm", "EACH", "SNG", "paint"},
                {"DOR-LOCK-ENT", "Entrance Lockset", "EACH", "Yale", "door"},
                {"TOL-WHEL-65", "Wheelbarrow 65L", "EACH", "SNG Tools", "tools"},
                {"BRK-MAXI", "Maxi Brick", "EACH", "SNG Bricks", "brick"},
                {"TIM-SHUT", "Shutterboard 18mm 2.4x1.2", "EACH", "SNG Timber", "timber"},
                {"CEM-PLAS-40", "Plaster Sand Mix 40kg", "BAG", "SNG", "cement"},
                {"ROF-INS-50", "Roof Insulation 50mm", "EACH", "Isover", "roof"}
        };
        int plu = 9000;
        for (String[] row : extra) {
            product(products, row[0], row[1], row[1] + " — SNG stocked line.", row[1], switch (row[4]) {
                case "cement" -> cement;
                case "timber" -> timber;
                case "roof" -> roofing;
                case "brick" -> bricks;
                case "pipe" -> plumbing;
                case "cable" -> electrical;
                case "paint" -> paint;
                case "door" -> doors;
                case "tools" -> tools;
                default -> sand;
            }, row[3], row[2], "5.00", "9.50", "8.40", null, plu++, null, null, 25, img(row[4]), plu % 5 == 0, plu % 7 == 0);
        }
    }

    private static String img(String key) {
        return switch (key) {
            case "cement" -> "/img/cement.jpg";
            case "cement2" -> "/img/cement2.jpg";
            case "timber" -> "/img/timber.jpg";
            case "roof" -> "/img/roof.jpg";
            case "door" -> "/img/door.jpg";
            case "paint" -> "/img/paint.jpg";
            case "pipe" -> "/img/pipe.jpg";
            case "cable" -> "/img/cable.jpg";
            case "tools" -> "/img/tools.jpg";
            case "brick" -> "/img/brick.jpg";
            case "sand", "stone" -> "/img/sand.jpg";
            case "geyser" -> "/img/geyser.jpg";
            case "toilet" -> "/img/toilet.jpg";
            case "tap" -> "/img/tap.jpg";
            default -> "/img/tools.jpg";
        };
    }

    private static Location loc(LocationRepository repo, String code, String name, String type, String address, String city, String phone, String hours, String services) {
        Location l = new Location();
        l.setCode(code); l.setName(name); l.setType(type); l.setAddress(address); l.setCity(city);
        l.setPhone(phone); l.setOpeningHours(hours); l.setServices(services);
        return repo.save(l);
    }

    private static AppUser user(AppUserRepository repo, String email, String hash, String name, RoleCode role, Location home, Set<Location> locs) {
        AppUser u = new AppUser();
        u.setEmail(email); u.setPasswordHash(hash); u.setFullName(name); u.setRoleCode(role.name());
        u.setHomeLocation(home); u.setLocations(locs); u.setPhone("+263 77 100 0000");
        return repo.save(u);
    }

    private static Category cat(CategoryRepository repo, String slug, String name, String desc, int order) {
        Category c = new Category();
        c.setSlug(slug); c.setName(name); c.setDescription(desc); c.setSortOrder(order);
        c.setImageUrl(img(slug.contains("timber") ? "timber" : slug.contains("cement") ? "cement" : slug.contains("roof") ? "roof" : slug.contains("brick") ? "brick" : slug.contains("plumb") ? "pipe" : slug.contains("elec") ? "cable" : slug.contains("paint") ? "paint" : slug.contains("door") ? "door" : slug.contains("tool") ? "tools" : "sand"));
        return repo.save(c);
    }

    private static Product product(ProductRepository repo, String sku, String name, String desc, String spec, Category cat, String brand, String uom,
                                   String cost, String retail, String trade, String promo, Integer plu, String barcode, String supplier, int min, String image, boolean featured, boolean best) {
        Product p = new Product();
        p.setSku(sku); p.setName(name); p.setDescription(desc); p.setSpecification(spec); p.setCategory(cat);
        p.setBrand(brand); p.setUnitOfMeasure(uom);
        p.setCostPrice(new BigDecimal(cost)); p.setRetailPrice(new BigDecimal(retail)); p.setTradePrice(new BigDecimal(trade));
        if (promo != null) p.setPromotionPrice(new BigDecimal(promo));
        p.setPlu(plu); p.setBarcode(barcode); p.setSupplierCode(supplier);
        p.setMinimumStock(BigDecimal.valueOf(min)); p.setReorderQuantity(BigDecimal.valueOf(min));
        p.setImageUrl(image); p.setFeatured(featured); p.setBestseller(best);
        p.setKeywords(name + " " + brand + " " + sku);
        p.setWebsiteVisible(true); p.setActive(true);
        return repo.save(p);
    }

    private static void gl(GlAccountRepository repo, String code, String name, String type) {
        GlAccount a = new GlAccount();
        a.setCode(code); a.setName(name); a.setType(type);
        repo.save(a);
    }

    private static Truck truck(TruckRepository repo, String reg, String code, String make, String model, AppUser driver, Location loc, int odo, int last, int next) {
        Truck t = new Truck();
        t.setRegistration(reg); t.setVehicleCode(code); t.setMake(make); t.setModel(model);
        t.setDriver(driver); t.setLocation(loc); t.setOdometerKm(odo);
        t.setLastServiceKm(last); t.setNextServiceKm(next);
        t.setLastServiceDate(LocalDate.now().minusMonths(4));
        t.setNextServiceDate(LocalDate.now().plusMonths(2));
        t.setLicenceExpiry(LocalDate.now().plusMonths(8));
        t.setInsuranceExpiry(LocalDate.now().plusMonths(5));
        t.setCapacityKg(new BigDecimal("8000"));
        t.setStatus("AVAILABLE");
        return repo.save(t);
    }
}
