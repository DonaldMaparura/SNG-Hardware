import { Navigate, Route, Routes, Link, useNavigate } from "react-router-dom";
import React, { useEffect, useMemo, useState } from "react";
import { api, CartLine, currentUser, logout, token } from "./api";
import {
  AccountPage, AboutPage, Branches, CartPage, CategoriesPage, Contact, DeliveryPage,
  Home, ProductPage, QuotePage, Shop, StaffLogin, StoreLayout, TimberCutPage, TradePage
} from "./Storefront";
import type { Product } from "./Storefront";

function money(n?: number) {
  return `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<StaffLogin />} />
      <Route path="/app/*" element={<RequireAuth><Console /></RequireAuth>} />
      <Route path="/*" element={<Store />} />
    </Routes>
  );
}

function RequireAuth({ children }: { children: React.ReactElement }) {
  if (!token()) return <Navigate to="/login" replace />;
  return children;
}

function Store() {
  return (
    <StoreLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:category" element={<Shop />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/product/:sku" element={<ProductPage />} />
        <Route path="/specials" element={<Shop promotion />} />
        <Route path="/branches" element={<Branches />} />
        <Route path="/quote" element={<QuotePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/trade" element={<TradePage />} />
        <Route path="/delivery" element={<DeliveryPage />} />
        <Route path="/timber-cut" element={<TimberCutPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </StoreLayout>
  );
}

function Console() {
  const user = currentUser()!;
  const nav = useNavigate();
  const items = navFor(user.role);
  return (
    <div className="app-shell">
      <aside className="side">
        <h2>SNG ONE</h2>
        <p style={{ padding: "0 22px", fontSize: 12 }}>{user.fullName}<br />{user.role.replace(/_/g, " ")}</p>
        {items.map(i => <Link key={i.to} to={i.to}>{i.label}</Link>)}
        <a href="/" onClick={() => { logout(); nav("/"); }}>Sign out</a>
      </aside>
      <main className="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/branch" element={<Dashboard />} />
          <Route path="/pos" element={<Pos />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/warehouse" element={<Warehouse />} />
          <Route path="/enquiries" element={<Enquiries />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/transfers" element={<Transfers />} />
          <Route path="/timber" element={<Timber />} />
          <Route path="/fleet" element={<Fleet />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/purchasing" element={<Purchasing />} />
          <Route path="/accounting" element={<Accounting />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/audit" element={<Audit />} />
          <Route path="/customers" element={<Customers />} />
        </Routes>
      </main>
    </div>
  );
}

function navFor(role: string) {
  const all = [
    { to: "/app", label: "Dashboard", roles: ["ADMIN", "GENERAL_MANAGER", "BRANCH_MANAGER"] },
    { to: "/app/pos", label: "POS / Till", roles: ["ADMIN", "GENERAL_MANAGER", "BRANCH_MANAGER", "CASHIER"] },
    { to: "/app/enquiries", label: "Online requests", roles: ["ADMIN", "GENERAL_MANAGER", "BRANCH_MANAGER"] },
    { to: "/app/orders", label: "Quotes & orders", roles: ["ADMIN", "GENERAL_MANAGER", "BRANCH_MANAGER"] },
    { to: "/app/inventory", label: "Inventory", roles: ["ADMIN", "GENERAL_MANAGER", "BRANCH_MANAGER", "WAREHOUSE_MANAGER", "WAREHOUSE_OPERATOR", "AUDITOR"] },
    { to: "/app/warehouse", label: "Warehouse tasks", roles: ["WAREHOUSE_OPERATOR", "WAREHOUSE_MANAGER", "ADMIN"] },
    { to: "/app/transfers", label: "Transfers", roles: ["ADMIN", "GENERAL_MANAGER", "WAREHOUSE_MANAGER", "WAREHOUSE_OPERATOR"] },
    { to: "/app/timber", label: "Timber cutting", roles: ["ADMIN", "GENERAL_MANAGER", "WAREHOUSE_MANAGER", "WAREHOUSE_OPERATOR"] },
    { to: "/app/fleet", label: "Fleet", roles: ["ADMIN", "GENERAL_MANAGER", "WAREHOUSE_MANAGER", "DRIVER"] },
    { to: "/app/trips", label: "My trips", roles: ["DRIVER", "ADMIN", "GENERAL_MANAGER"] },
    { to: "/app/purchasing", label: "Purchasing", roles: ["ADMIN", "GENERAL_MANAGER", "WAREHOUSE_MANAGER", "FINANCE_CONTROLLER"] },
    { to: "/app/customers", label: "Customers", roles: ["ADMIN", "GENERAL_MANAGER", "BRANCH_MANAGER", "FINANCE_CONTROLLER"] },
    { to: "/app/accounting", label: "Accounting", roles: ["ADMIN", "GENERAL_MANAGER", "FINANCE_CONTROLLER", "AUDITOR"] },
    { to: "/app/reports", label: "Reports", roles: ["ADMIN", "GENERAL_MANAGER", "FINANCE_CONTROLLER", "AUDITOR", "BRANCH_MANAGER"] },
    { to: "/app/audit", label: "Audit trail", roles: ["ADMIN", "GENERAL_MANAGER", "AUDITOR", "FINANCE_CONTROLLER"] },
  ];
  return all.filter(i => i.roles.includes(role) || role === "ADMIN");
}

function Dashboard() {
  const [d, setD] = useState<any>(null);
  useEffect(() => { api("/api/dashboard").then(setD); }, []);
  if (!d) return <p>Loading dashboard…</p>;
  return (
    <>
      <h1>Management dashboard</h1>
      <div className="kpis">
        <div className="kpi"><span>Sales today</span><b>{money(d.salesToday)}</b></div>
        <div className="kpi"><span>Sales this month</span><b>{money(d.salesMonth)}</b></div>
        <div className="kpi"><span>Online enquiries today</span><b>{d.onlineEnquiriesToday}</b></div>
        <div className="kpi"><span>Open orders</span><b>{d.openOrders}</b></div>
        <div className="kpi"><span>Inventory value</span><b>{money(d.inventoryValue)}</b></div>
        <div className="kpi"><span>Low stock items</span><b>{d.lowStockCount}</b></div>
        <div className="kpi"><span>Open transfers</span><b>{d.openTransfers}</b></div>
        <div className="kpi"><span>Trucks due service</span><b>{d.trucksDueService}</b></div>
        <div className="kpi"><span>Credit outstanding</span><b>{money(d.creditOutstanding)}</b></div>
      </div>
      <h2>Branch performance</h2>
      <table><thead><tr><th>Branch</th><th>Sales</th></tr></thead>
        <tbody>{Object.entries(d.branchPerformance || {}).map(([k, v]) => <tr key={k}><td>{k}</td><td>{money(v as number)}</td></tr>)}</tbody>
      </table>
      <h2>New online requests</h2>
      <table><thead><tr><th>Ref</th><th>Customer</th><th>Status</th></tr></thead>
        <tbody>{(d.enquiries || []).map((e: any) => <tr key={e.id}><td>{e.reference}</td><td>{e.customerName}</td><td>{e.status}</td></tr>)}</tbody>
      </table>
    </>
  );
}

function Pos() {
  const user = currentUser()!;
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Product[]>([]);
  const [cart, setLocal] = useState<CartLine[]>([]);
  const [till, setTill] = useState<any>(null);
  const [receipt, setReceipt] = useState<any>(null);
  const [counted, setCounted] = useState("");
  const [reason, setReason] = useState("");
  useEffect(() => { api("/api/pos/till/current").then(setTill); }, []);
  useEffect(() => {
    if (q.length < 1) return;
    const t = setTimeout(() => api<Product[]>("/api/products/search?q=" + encodeURIComponent(q)).then(setHits), 200);
    return () => clearTimeout(t);
  }, [q]);
  const total = cart.reduce((s, l) => s + l.qty * l.price, 0);
  async function openTill() {
    const t = await api("/api/pos/till/open", { method: "POST", body: JSON.stringify({ locationId: user.homeLocationId || 1, openingFloat: 200 }) });
    setTill({ open: true, ...t as any });
  }
  async function checkout(method: string) {
    const sale = await api("/api/pos/checkout", {
      method: "POST",
      body: JSON.stringify({ lines: cart.map(l => ({ sku: l.sku, quantity: l.qty })), payments: [{ method, amount: total }], discount: 0 })
    });
    setReceipt(sale);
    setLocal([]);
  }
  return (
    <>
      <h1>POS / Till</h1>
      {!till?.open && <button className="btn" onClick={openTill}>Open till — $200 float</button>}
      {till?.open && <p>Till open at {till.location} · float {money(till.openingFloat)}</p>}
      <input className="pos-search" placeholder="Scan barcode or search SKU / product / PLU…" value={q} onChange={e => setQ(e.target.value)} />
      <div>{hits.slice(0, 6).map(p => (
        <button key={p.sku} className="btn ghost" style={{ margin: 4 }} onClick={() => {
          const ex = cart.find(l => l.sku === p.sku);
          setLocal(ex ? cart.map(l => l.sku === p.sku ? { ...l, qty: l.qty + 1 } : l) : [...cart, { sku: p.sku, name: p.name, qty: 1, price: p.price }]);
        }}>{p.name} · {p.sku} · {money(p.price)}</button>
      ))}</div>
      <table><thead><tr><th>Item</th><th>Qty</th><th>Total</th></tr></thead>
        <tbody>{cart.map(l => <tr key={l.sku}><td>{l.name}</td><td>{l.qty}</td><td>{money(l.qty * l.price)}</td></tr>)}</tbody>
      </table>
      <h2>Total {money(total)}</h2>
      <div className="actions" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {["CASH", "CARD", "ECOCASH", "BANK_TRANSFER", "CUSTOMER_ACCOUNT"].map(m => (
          <button key={m} className="btn" disabled={!till?.open || !cart.length} onClick={() => checkout(m)}>{m}</button>
        ))}
      </div>
      {receipt && (
        <div className="receipt">
          <b>SNG ONE RECEIPT {receipt.receiptNo}</b>
          <div>{receipt.branch}<br />{receipt.cashier}<br />{receipt.createdAt}</div>
          {receipt.lines.map((l: any) => <div key={l.sku}>{l.qty} {l.name} {money(l.lineTotal)}</div>)}
          <hr /><b>TOTAL {money(receipt.total)}</b>
          <p>Thank you for building with SNG.</p>
        </div>
      )}
      {till?.open && (
        <div className="notice">
          <h3>Close till</h3>
          <input placeholder="Counted cash" value={counted} onChange={e => setCounted(e.target.value)} />
          <input placeholder="Variance reason" value={reason} onChange={e => setReason(e.target.value)} />
          <button className="btn" onClick={async () => { setTill(await api("/api/pos/till/close", { method: "POST", body: JSON.stringify({ countedCash: counted, reason }) })); }}>Close</button>
          {till.variance !== undefined && <p>Expected {money(till.expected)} · Counted {money(till.counted)} · Variance {money(till.variance)}</p>}
        </div>
      )}
    </>
  );
}

function Inventory() {
  const [q, setQ] = useState("PPC Cement");
  const [data, setData] = useState<any>(null);
  async function load(sku = "CEM-PPC-50") {
    setData(await api("/api/inventory/" + sku));
  }
  return (
    <>
      <h1>Inventory ledger</h1>
      <form onSubmit={async e => {
        e.preventDefault();
        const found = await api<Product[]>("/api/products/search?q=" + encodeURIComponent(q));
        if (found[0]) load(found[0].sku);
      }} className="filters">
        <input value={q} onChange={e => setQ(e.target.value)} />
        <button className="btn">Search</button>
      </form>
      {data && (
        <>
          <h2>{data.product.name}</h2>
          <p>Retail {money(data.product.retailPrice)} · Cost {money(data.product.costPrice)} · Inventory value {money(data.value)}</p>
          <div className="kpis">
            {Object.entries(data.breakdown).filter(([k]) => k !== "TOTAL" && k !== "IN_TRANSIT_TOTAL").map(([code, v]: any) => (
              <div className="kpi" key={code}><span>{v.name}</span><b>{Number(v.quantity).toLocaleString()}</b></div>
            ))}
            <div className="kpi"><span>Total stock</span><b>{Number(data.breakdown.TOTAL).toLocaleString()}</b></div>
            <div className="kpi"><span>In transit</span><b>{Number(data.breakdown.IN_TRANSIT_TOTAL).toLocaleString()}</b></div>
          </div>
          <h3>Latest movements</h3>
          <table><thead><tr><th>When</th><th>Type</th><th>Qty</th><th>From</th><th>To</th><th>User</th></tr></thead>
            <tbody>{data.movements.map((m: any) => <tr key={m.id}><td>{m.at}</td><td>{m.type}</td><td>{m.qty}</td><td>{m.from}</td><td>{m.to}</td><td>{m.user}</td></tr>)}</tbody>
          </table>
        </>
      )}
    </>
  );
}

function Warehouse() {
  return (
    <>
      <h1>Warehouse tasks</h1>
      <p>Receive purchase orders, pick transfers, and complete timber cuts from this workspace.</p>
      <p><Link className="btn" to="/app/transfers">Transfers</Link> <Link className="btn" to="/app/timber">Timber cutting</Link> <Link className="btn" to="/app/purchasing">Receiving</Link></p>
    </>
  );
}

function Enquiries() {
  const [list, setList] = useState<any[]>([]);
  const load = () => api<any[]>("/api/enquiries").then(setList);
  useEffect(() => { load(); }, []);
  return (
    <>
      <h1>Online quote requests</h1>
      {list.map(e => (
        <div className="card" key={e.id} style={{ marginBottom: 12 }}><div className="body">
          <b>{e.reference}</b> · {e.status} · {e.customerName} · {e.preferredBranch} · {e.fulfilment}
          <ul>{e.lines.map((l: any) => <li key={l.sku}>{l.quantity} × {l.name}</li>)}</ul>
          {e.status === "NEW" && <button className="btn" onClick={async () => { await api("/api/enquiries/" + e.id + "/convert", { method: "POST" }); load(); }}>Convert to quote</button>}
        </div></div>
      ))}
    </>
  );
}

function Orders() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const load = () => { api<any[]>("/api/quotes").then(setQuotes); api<any[]>("/api/orders").then(setOrders); };
  useEffect(() => { load(); }, []);
  return (
    <>
      <h1>Quotes and sales orders</h1>
      <h2>Quotes</h2>
      <table><thead><tr><th>Ref</th><th>Customer</th><th>Total</th><th>Status</th><th></th></tr></thead>
        <tbody>{quotes.map(q => <tr key={q.id}><td>{q.reference}</td><td>{q.customer}</td><td>{money(q.total)}</td><td>{q.status}</td>
          <td>{q.status === "ISSUED" && <button className="btn" onClick={async () => { await api("/api/quotes/" + q.id + "/accept", { method: "POST" }); load(); }}>Accept / create order</button>}</td></tr>)}</tbody>
      </table>
      <h2>Orders</h2>
      <table><thead><tr><th>Ref</th><th>Customer</th><th>Reserved</th><th>Status</th></tr></thead>
        <tbody>{orders.map(o => <tr key={o.id}><td>{o.reference}</td><td>{o.customer}</td><td>{String(o.reserved)}</td><td>{o.status}</td></tr>)}</tbody>
      </table>
    </>
  );
}

function Transfers() {
  const [list, setList] = useState<any[]>([]);
  const [locs, setLocs] = useState<any[]>([]);
  const [trucks, setTrucks] = useState<any[]>([]);
  const load = () => api<any[]>("/api/transfers").then(setList);
  useEffect(() => {
    load();
    api<any[]>("/api/locations").then(setLocs);
    api<any[]>("/api/fleet/trucks").then(setTrucks);
  }, []);
  const wh = locs.find(l => l.code === "WH-01");
  const shop = locs.find(l => l.code === "GWE-01" || l.name?.includes("Gweru"));
  const truck = trucks.find(t => t.vehicleCode === "SNG-04");
  return (
    <>
      <h1>Stock transfers</h1>
      <button className="btn" onClick={async () => {
        await api("/api/transfers", { method: "POST", body: JSON.stringify({
          fromLocationId: wh?.id, toLocationId: shop?.id, truckId: truck?.id,
          lines: [{ sku: "CEM-PPC-50", quantity: 100 }]
        })});
        load();
      }}>Create WH1 → Gweru 100 cement on SNG-04</button>
      {list.map(t => (
        <div className="card" key={t.id} style={{ margin: "12px 0" }}><div className="body">
          <b>{t.reference}</b> {t.status} · {t.from} → {t.to} · {t.truck} · {t.driver}
          <ul>{(t.lines || []).map((l: any) => <li key={l.sku}>{l.requested} {l.name} loaded {l.loaded ?? "–"} received {l.received ?? "–"} variance {l.variance ?? "–"}</li>)}</ul>
          {t.status === "REQUESTED" && <button className="btn" onClick={async () => { await api("/api/transfers/" + t.id + "/status/APPROVED", { method: "POST" }); load(); }}>Approve</button>}
          {(t.status === "APPROVED" || t.status === "PICKING" || t.status === "LOADED") && <button className="btn" onClick={async () => { await api("/api/transfers/" + t.id + "/load", { method: "POST" }); load(); }}>Load / send in transit</button>}
          {t.status === "IN_TRANSIT" && <button className="btn" onClick={async () => {
            await api("/api/transfers/" + t.id + "/receive", { method: "POST", body: JSON.stringify({ lines: [{ sku: "CEM-PPC-50", receivedQty: 98 }] }) });
            load();
          }}>Receive 98 (variance -2)</button>}
        </div></div>
      ))}
    </>
  );
}

function Timber() {
  const [preview, setPreview] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [locs, setLocs] = useState<any[]>([]);
  const payload = useMemo(() => ({
    locationId: locs.find(l => l.code === "WH-01")?.id,
    sourceSku: "TIM-PINE-38-114-6000",
    sourceQty: 1,
    originalLengthM: 6,
    kerfMm: 3,
    pieces: [{ lengthM: 2.4, quantity: 1 }, { lengthM: 2.4, quantity: 1 }]
  }), [locs]);
  const load = () => api<any[]>("/api/timber").then(setJobs);
  useEffect(() => { api<any[]>("/api/locations?type=WAREHOUSE").then(setLocs); load(); }, []);
  useEffect(() => {
    if (payload.locationId) api("/api/timber/preview", { method: "POST", body: JSON.stringify(payload) }).then(setPreview);
  }, [payload]);
  const colours = ["#1b4d3e", "#2f6f5b", "#c4a35a"];
  return (
    <>
      <h1>Timber cutting</h1>
      {preview && (
        <>
          <p>Original {preview.originalM}m · Cuts {preview.cutsTotalM}m · Kerf {preview.kerfTotalM}m · Remaining {preview.remainingM}m · {preview.reusableOffcut ? "Reusable offcut" : "Waste"} {preview.wasteM}m</p>
          <div className="bar">
            {preview.segments.map((s: number, i: number) => (
              <span key={i} style={{ width: (s / preview.originalM) * 100 + "%", background: colours[i % colours.length] }}>{s}m</span>
            ))}
          </div>
        </>
      )}
      <p>
        <button className="btn" onClick={async () => { await api("/api/timber", { method: "POST", body: JSON.stringify(payload) }); load(); }}>Create cut job</button>
      </p>
      {jobs.map(j => (
        <div className="card" key={j.id} style={{ marginTop: 12 }}><div className="body">
          <b>{j.reference}</b> {j.status} · {j.sourceName} · used {j.usedM}m · offcut {j.offcutM}m
          <div>{j.status !== "COMPLETED" && <button className="btn" onClick={async () => { await api("/api/timber/" + j.id + "/complete", { method: "POST" }); load(); }}>Complete cut</button>}</div>
        </div></div>
      ))}
    </>
  );
}

function Fleet() {
  const [trucks, setTrucks] = useState<any[]>([]);
  const [sel, setSel] = useState<any>(null);
  const load = () => api<any[]>("/api/fleet/trucks").then(setTrucks);
  useEffect(() => { load(); }, []);
  return (
    <>
      <h1>Fleet</h1>
      <table><thead><tr><th>Code</th><th>Reg</th><th>Driver</th><th>Odo</th><th>Next service</th><th>Status</th></tr></thead>
        <tbody>{trucks.map(t => <tr key={t.id} onClick={async () => setSel(await api("/api/fleet/trucks/" + t.id))} style={{ cursor: "pointer" }}>
          <td>{t.vehicleCode}</td><td>{t.registration}</td><td>{t.driver}</td><td>{t.odometerKm?.toLocaleString()} km</td>
          <td>{t.nextServiceKm?.toLocaleString()} {t.serviceDueSoon && <span className="badge low">SERVICE DUE SOON</span>}</td>
          <td>{t.status}</td></tr>)}</tbody>
      </table>
      {sel && (
        <div className="notice">
          <h3>{sel.vehicleCode} · remaining {sel.remainingKm} km to service</h3>
          <button className="btn" onClick={async () => {
            await api("/api/fleet/trucks/" + sel.id + "/maintenance", { method: "POST", body: JSON.stringify({
              type: "SERVICE", description: "Scheduled service", cost: 850, takeOutOfService: true, nextServiceKm: 140000
            })});
            load();
            setSel(await api("/api/fleet/trucks/" + sel.id));
          }}>Record maintenance and mark unavailable</button>
        </div>
      )}
    </>
  );
}

function Trips() {
  const [trips, setTrips] = useState<any[]>([]);
  const load = () => api<any[]>("/api/fleet/trips").then(setTrips);
  useEffect(() => { load(); }, []);
  return (
    <>
      <h1>Driver trips</h1>
      {trips.map(t => (
        <div className="card" key={t.id} style={{ marginBottom: 12 }}><div className="body">
          <b>{t.reference}</b> {t.truck} · {t.from} → {t.to} · {t.status}
          <div>
            <button className="btn" onClick={async () => { await api("/api/fleet/trips/" + t.id + "/start", { method: "POST" }); load(); }}>Start trip</button>
            <button className="btn ghost" onClick={async () => { await api("/api/fleet/trips/" + t.id + "/arrived", { method: "POST" }); load(); }}>Arrived</button>
            <button className="btn ghost" onClick={async () => { await api("/api/fleet/trips/" + t.id + "/pod", { method: "POST", body: JSON.stringify({ recipient: "Branch receiver", notes: "Offloaded" }) }); load(); }}>Delivered / POD</button>
          </div>
        </div></div>
      ))}
    </>
  );
}

function Purchasing() {
  const [pos, setPos] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [locs, setLocs] = useState<any[]>([]);
  const load = () => api<any[]>("/api/purchasing/orders").then(setPos);
  useEffect(() => {
    load();
    api<any[]>("/api/purchasing/suppliers").then(setSuppliers);
    api<any[]>("/api/locations?type=WAREHOUSE").then(setLocs);
  }, []);
  return (
    <>
      <h1>Purchasing</h1>
      <button className="btn" onClick={async () => {
        await api("/api/purchasing/orders", { method: "POST", body: JSON.stringify({
          supplierId: suppliers[0]?.id, locationId: locs[0]?.id, expectedDate: new Date().toISOString().slice(0, 10),
          lines: [{ sku: "CEM-PPC-50", quantity: 100, unitCost: 8.2 }]
        })});
        load();
      }}>Draft PO 100 cement</button>
      {pos.map(p => (
        <div className="card" key={p.id} style={{ marginTop: 12 }}><div className="body">
          {p.reference} {p.status} {p.supplier}
          <button className="btn" onClick={async () => { await api("/api/purchasing/orders/" + p.id + "/status/ORDERED", { method: "POST" }); load(); }}>Mark ordered</button>
          <button className="btn ghost" onClick={async () => {
            await api("/api/purchasing/orders/" + p.id + "/receive", { method: "POST", body: JSON.stringify({ lines: [{ sku: "CEM-PPC-50", receivedQty: 97 }] })});
            load();
          }}>Receive 97 (variance -3)</button>
        </div></div>
      ))}
    </>
  );
}

function Accounting() {
  const [journals, setJournals] = useState<any[]>([]);
  useEffect(() => { api<any[]>("/api/journals").then(setJournals); }, []);
  return (
    <>
      <h1>General ledger</h1>
      <p>Posted journals cannot be edited. Corrections reverse the original.</p>
      {journals.map(j => (
        <div key={j.id} className="card" style={{ marginBottom: 10 }}><div className="body">
          <b>{j.reference}</b> {j.description} {j.reversed ? "(reversed)" : ""}
          <table>{j.lines.map((l: any, i: number) => <tr key={i}><td>{l.account}</td><td>{money(l.debit)}</td><td>{money(l.credit)}</td></tr>)}</table>
        </div></div>
      ))}
    </>
  );
}

function Reports() {
  const [tb, setTb] = useState<any>(null);
  useEffect(() => { api("/api/reports/trial-balance").then(setTb); }, []);
  return (
    <>
      <h1>Reports</h1>
      <p><a href="/api/reports/low-stock.csv">Export low stock CSV</a></p>
      <h2>Trial balance</h2>
      <table><thead><tr><th>Account</th><th>Debit</th><th>Credit</th></tr></thead>
        <tbody>{tb && Object.entries(tb).map(([k, v]: any) => <tr key={k}><td>{k}</td><td>{money(v.debit)}</td><td>{money(v.credit)}</td></tr>)}</tbody>
      </table>
    </>
  );
}

function Audit() {
  const [data, setData] = useState<any>({ items: [] });
  useEffect(() => { api("/api/audit").then(setData); }, []);
  return (
    <>
      <h1>Audit trail</h1>
      <p>Auditor access is read-only. Trace price changes, stock, POS, transfers, timber and journals.</p>
      <table><thead><tr><th>When</th><th>User</th><th>Action</th><th>Entity</th><th>Before</th><th>After</th></tr></thead>
        <tbody>{data.items.map((a: any) => <tr key={a.id}><td>{a.at}</td><td>{a.user}</td><td>{a.action}</td><td>{a.entity} {a.entityId}</td><td>{a.before}</td><td>{a.after}</td></tr>)}</tbody>
      </table>
    </>
  );
}

function Customers() {
  const [list, setList] = useState<any[]>([]);
  useEffect(() => { api<any[]>("/api/customers").then(setList); }, []);
  return (
    <>
      <h1>Customers</h1>
      <table><thead><tr><th>Account</th><th>Name</th><th>Type</th><th>Limit</th><th>Outstanding</th><th>Available</th></tr></thead>
        <tbody>{list.map(c => <tr key={c.id}><td>{c.accountCode}</td><td>{c.name}</td><td>{c.type}</td><td>{money(c.creditLimit)}</td><td>{money(c.outstanding)}</td><td>{money(c.available)}</td></tr>)}</tbody>
      </table>
    </>
  );
}
