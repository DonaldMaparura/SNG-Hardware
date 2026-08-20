# SNG ONE

Hardware retail, online store, POS, inventory, warehouse, fleet and management platform.

SNG ONE is a **functional proof of concept** for a multi-branch hardware / building-materials retailer. The customer website and the internal operations system share one catalogue, one inventory ledger, one customer file and one set of orders.

Customers shop from SNG online. Staff sell from SNG ONE. Warehouses manage stock in SNG ONE. Timber is measured and cut in SNG ONE. Trucks and deliveries are controlled in SNG ONE. Accounts are generated from operations. Managers see the whole business. Everything is auditable.

## Quick start

```bash
docker compose up --build
```

- Storefront: http://localhost/
- API: http://localhost:8080/api
- Internal app: http://localhost/login then `/app`

Local development (PostgreSQL must be running, see `docker compose up postgres`):

```bash
cd backend && mvn spring-boot:run
cd frontend && npm install && npm run dev
```

Frontend dev server: http://localhost:5173 (proxies `/api` to `:8080`).

**Demo password for every seeded user:** `SngOne2026!`

## Demo credentials

| Role | Email | Lands on |
|---|---|---|
| Admin | admin@sng.one | Executive dashboard |
| General Manager | gm@sng.one | Executive dashboard |
| Branch Manager (Harare) | harare.manager@sng.one | Branch dashboard |
| Warehouse Manager | warehouse.manager@sng.one | Inventory |
| Warehouse Operator | warehouse.op@sng.one | Warehouse tasks |
| Cashier | cashier@sng.one | POS |
| Finance Controller | finance@sng.one | Accounting |
| Auditor (read-only) | auditor@sng.one | Audit trail |
| Driver (Tendai) | driver@sng.one | Mobile trips |
| Trade customer | abc@construction.zw | Online account |

There are no shared generic users. Location access is enforced on the server.

## Management demo walkthrough

1. Open the public site. Show the SNG Builder One Stop homepage, categories and featured products.
2. Search **PPC Cement 50kg**. Confirm live price and branch availability (IN STOCK / LOW STOCK — not a fake dataset).
3. Add 100 cement, 20 × Pine 38x114x6.0m, 40 roofing sheets to the enquiry cart.
4. Submit **Request a quote** (ABC Construction, Harare, delivery).
5. Sign in as `gm@sng.one`. Open **Online requests**. The enquiry is there.
6. Convert it to a quote, then accept to create a sales order (stock reserved at the branch).
7. Open **Inventory**, search PPC Cement. Totals span 5 shops, 4 warehouses and in-transit/truck stock.
8. Sign in as `cashier@sng.one`. Open till ($200). Sell 10 bags (search SKU `CEM-PPC-50` or PLU `1001` — barcode is optional). Print-style receipt appears.
9. Return to inventory: Harare quantity reduced. Open **Accounting**: POS journal DR cash / CR sales, DR COGS / CR inventory.
10. As warehouse manager, **Transfers**: create Warehouse 1 → Gweru, 100 cement, truck **SNG-04**, driver Tendai. Load: warehouse −100, truck/in-transit +100.
11. As `driver@sng.one`, start the trip.
12. Receive 98 at Gweru. Variance −2 is visible (shortage to damage location).
13. **Timber cutting**: Pine 38×114×6.0m, cuts 2.4m + 2.4m, kerf 3mm. Offcut 1.194m is reusable. Complete the job and confirm inventory consume/output.
14. **Fleet**: SNG-04 at 126,420 km, next service 130,000 km, SERVICE DUE SOON. Record maintenance → truck unavailable for new assignments.
15. Return to the executive dashboard (sales, inventory, online requests, transfers, fleet).
16. **Audit trail**: price change, POS sale, transfer, timber cut, maintenance, journals.

## Architecture

Modular Spring Boot monolith + React SPA.

```
frontend (React / Vite / PWA manifest)
        |
        | REST /api
        v
backend (Java 21, Spring Boot, Security, Data JPA)
        |
        | Flyway
        v
PostgreSQL
```

Bounded modules: identity, location, catalogue, inventory, sales, POS, transfer, timber, fleet, purchasing, accounting, audit, storefront API.

**Non-negotiable inventory rule:** quantity is never edited in place. `InventoryService.move` writes a `stock_movements` row and updates `stock_balances`.

Transfers do not post sales revenue. POS sales post cash/AR + revenue and COGS + inventory. Purchase receipts DR inventory CR AP. Truck maintenance DR repairs CR cash. Posted journals are immutable; corrections reverse.

## Role matrix

| Capability | Admin/GM | Branch mgr | Warehouse | Cashier | Finance | Auditor | Driver | Customer |
|---|---|---|---|---|---|---|---|---|
| Public store | yes | yes | yes | yes | yes | yes | yes | yes |
| POS | yes | yes | | yes | | | | |
| Inventory | yes | yes | yes | | | view | | |
| Transfers / timber | yes | | yes | | | view | | |
| Fleet assign | yes | | mgr | | | view | trips | |
| Accounting | yes | | | | yes | view | | |
| Write operations | yes | yes | yes | yes | yes | **no** | trips | quotes |

## Sample catalogue (excerpt)

| SKU | Product | Unit | PLU |
|---|---|---|---|
| CEM-PPC-50 | PPC Cement 50kg | BAG | 1001 |
| CEM-LAF-50 | Lafarge Cement 50kg | BAG | 1002 |
| TIM-PINE-38-114-3600 | Pine 38x114x3.6m | LENGTH | 2001 |
| TIM-PINE-38-114-6000 | Pine 38x114x6.0m | LENGTH | 2003 |
| ROF-IBR-026 | IBR Roofing Sheet | LENGTH | 3001 |
| AGG-SAND-RIV | River Sand | CUBIC_METRE | 1201 |

Barcode is optional. Cashiers can search name, SKU, supplier code or PLU.

## Locations seeded

5 shops: Harare, Bulawayo, Gweru, Mutare, Masvingo  
4 warehouses: WH-01–WH-04  
4 trucks: SNG-01–SNG-04 (SNG-04 / Tendai is the demo truck)  
Plus IN_TRANSIT, DAMAGE, CUSTOMER location types.

## Hardware philosophy

Works on ordinary Windows PCs, existing tills, keyboards, receipt printers and phones. Barcode scanners are an accelerator, not a requirement. No GPS trackers.

## Tests

```bash
cd backend && mvn test
cd frontend && npm test && npm run build
```

Backend coverage includes timber kerf/offcut/waste math, POS-style stock deduction, sale journals that balance, in-transit transfer + variance, website availability without exact qty, online quote creation, journal reversal, insufficient stock, truck service-due and maintenance assignment rules, till variance arithmetic.

## Project layout

- `backend/` Spring Boot API, Flyway `V1__init.sql`, seed on empty database
- `frontend/` React storefront + role-based operations console
- `docker-compose.yml` PostgreSQL + API + nginx UI
