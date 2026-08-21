import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api, CartLine, currentUser } from "../api";
import type { Product } from "../Storefront";
import { useOps } from "./OpsContext";
import { homeTitle, isCompanyWide, isDirector, isStoreScoped, moreLinks } from "./roles";

export function money(n?: number) {
  return `US$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function Overview() {
  const user = currentUser()!;
  const nav = useNavigate();
  const ops = useOps();
  const company = isCompanyWide(user.role);
  const [d, setD] = useState<any>(null);
  const [till, setTill] = useState<any>(null);

  useEffect(() => {
    api("/api/dashboard").then(setD).catch(() => setD(null));
    if (isStoreScoped(user.role) || user.role === "STORE_OPERATOR" || user.role === "CASHIER" || user.role === "BRANCH_MANAGER") {
      api("/api/pos/till/current").then(setTill).catch(() => setTill(null));
    }
  }, [user.role, ops.period, ops.locationId]);

  if (!d) return <p className="ops-muted">Loading overview…</p>;

  const branchRows = Object.entries(d.branchPerformance || {}).map(([name, sales]) => ({ name, sales: sales as number }));
  const focusedBranch = company && ops.locationId != null;
  const showStoreDash = !company || isStoreScoped(user.role) || focusedBranch;

  if (showStoreDash) {
    const locName = focusedBranch
      ? (ops.locations.find(l => l.id === ops.locationId)?.name || ops.locationLabel())
      : (user.homeLocationName || homeTitle(user.role));
    return (
      <>
        <div className="ops-hero-head">
          <div>
            <div className="ops-kicker">SNG HARDWARE</div>
            <h1>{locName}</h1>
            <p className="ops-sub">
              {ops.periodLabel()} · {user.fullName}
              {!focusedBranch && (till?.open ? ` · Till open at ${till.location}` : " · Till closed")}
            </p>
          </div>
          {focusedBranch && (
            <button className="ops-btn ghost" type="button" onClick={() => ops.setLocationId(null)}>All stores</button>
          )}
        </div>

        <div className="ops-metrics">
          <div className="ops-metric"><span>Today's sales</span><b>{money(d.salesToday)}</b></div>
          <div className="ops-metric"><span>Transactions</span><b>{d.transactionsToday ?? "—"}</b></div>
          <div className="ops-metric">
            <span>Money received</span>
            <b>{money(d.moneyReceived ?? d.salesToday)}</b>
          </div>
          {!focusedBranch && (
            <div className={`ops-metric ${till?.open ? "ok" : ""}`}>
              <span>Expected cash</span>
              <b>{till?.open ? money(till.openingFloat) : "—"}</b>
              <small>{till?.open ? "Opening float (till open)" : "No open till"}</small>
            </div>
          )}
          <div className="ops-metric"><span>Stock value</span><b>{money(d.inventoryValue)}</b></div>
          <div className={`ops-metric ${d.lowStockCount ? "warn" : ""}`}><span>Low stock</span><b>{d.lowStockCount ?? 0}</b></div>
          <div className={`ops-metric ${(d.outOfStockCount || 0) ? "danger" : ""}`}><span>Out of stock</span><b>{d.outOfStockCount ?? 0}</b></div>
          <div className="ops-metric"><span>Requests</span><b>{d.openCustomerRequests ?? d.onlineEnquiriesToday ?? 0}</b></div>
        </div>

        <div className="ops-actions">
          <Link className="ops-btn" to="/app/pos">New sale</Link>
          <Link className="ops-btn ghost" to="/app/inventory">Stock</Link>
          <Link className="ops-btn ghost" to="/app/purchasing">Receive</Link>
          <Link className="ops-btn ghost" to="/app/transfers">Transfer</Link>
        </div>

        <Exceptions d={d} />
      </>
    );
  }

  return (
    <>
      <div className="ops-hero-head">
        <div>
          <div className="ops-kicker">SNG HARDWARE</div>
          <h1>{isDirector(user.role) ? "Business overview" : "All stores"}</h1>
          <p className="ops-sub">{ops.periodLabel()} · {ops.locationLabel()}</p>
        </div>
      </div>

      <div className="ops-metrics">
        <div className="ops-metric"><span>Sales today</span><b>{money(d.salesToday)}</b></div>
        <div className="ops-metric"><span>Transactions</span><b>{d.transactionsToday ?? 0}</b></div>
        <div className="ops-metric"><span>Money received</span><b>{money(d.moneyReceived ?? d.salesToday)}</b></div>
        <div className="ops-metric"><span>Inventory value</span><b>{money(d.inventoryValue)}</b></div>
        <div className={`ops-metric ${d.lowStockCount ? "warn" : ""}`}><span>Low stock</span><b>{d.lowStockCount ?? 0}</b></div>
        <div className={`ops-metric ${(d.outOfStockCount || 0) ? "danger" : ""}`}><span>Out of stock</span><b>{d.outOfStockCount ?? 0}</b></div>
        <div className="ops-metric"><span>Open requests</span><b>{d.openCustomerRequests ?? 0}</b></div>
        <div className="ops-metric"><span>Transfers in transit</span><b>{d.openTransfers ?? 0}</b></div>
        <div className="ops-metric"><span>Credit outstanding</span><b>{money(d.creditOutstanding)}</b></div>
      </div>

      <Exceptions d={d} />

      <h2>Branch comparison</h2>
      <div className="ops-table-wrap">
        <table className="ops-table">
          <thead><tr><th>Branch</th><th>Sales</th></tr></thead>
          <tbody>
            {branchRows.map(r => (
              <tr
                key={r.name}
                className="clickable"
                onClick={() => {
                  const loc = ops.locations.find(l => l.name === r.name);
                  if (loc) ops.setLocationId(loc.id);
                  nav("/app");
                }}
              >
                <td>{r.name}</td>
                <td>{money(r.sales)}</td>
              </tr>
            ))}
            {branchRows.length === 0 && <tr><td colSpan={2}>No branch sales yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Exceptions({ d }: { d: any }) {
  const chips: string[] = [];
  if (d.lowStockCount) chips.push(`${d.lowStockCount} low stock`);
  if (d.outOfStockCount) chips.push(`${d.outOfStockCount} out of stock`);
  if (d.openTransfers) chips.push(`${d.openTransfers} open transfers`);
  if (d.openCustomerRequests || d.onlineEnquiriesToday) {
    chips.push(`${d.openCustomerRequests ?? d.onlineEnquiriesToday} open requests`);
  }
  if (!chips.length) return null;
  return (
    <div className="ops-exceptions">
      {chips.map(c => <span key={c} className="ops-chip">{c}</span>)}
    </div>
  );
}

export function Pos() {
  const user = currentUser()!;
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Product[]>([]);
  const [cart, setLocal] = useState<CartLine[]>([]);
  const [till, setTill] = useState<any>(null);
  const [receipt, setReceipt] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => { api("/api/pos/till/current").then(setTill).catch(() => setTill(null)); }, []);
  useEffect(() => {
    if (q.length < 1) { setHits([]); return; }
    const t = setTimeout(() => api<Product[]>("/api/products/search?q=" + encodeURIComponent(q)).then(setHits).catch(() => setHits([])), 200);
    return () => clearTimeout(t);
  }, [q]);

  const total = cart.reduce((s, l) => s + l.qty * l.price, 0);

  function addLine(p: Product) {
    const ex = cart.find(l => l.sku === p.sku);
    setLocal(ex ? cart.map(l => l.sku === p.sku ? { ...l, qty: l.qty + 1 } : l) : [...cart, { sku: p.sku, name: p.name, qty: 1, price: p.price }]);
  }

  async function checkout(method: string) {
    setError("");
    try {
      const sale = await api("/api/pos/checkout", {
        method: "POST",
        body: JSON.stringify({ lines: cart.map(l => ({ sku: l.sku, quantity: l.qty })), payments: [{ method, amount: total }], discount: 0 }),
      });
      setReceipt(sale);
      setLocal([]);
      setQ("");
      setHits([]);
    } catch (e: any) {
      setError(e.message || "Checkout failed");
    }
  }

  function newSale() {
    setReceipt(null);
    setLocal([]);
    setQ("");
  }

  if (receipt) {
    return (
      <div className="pos-complete">
        <h2>Sale complete</h2>
        <p className="ops-muted">{receipt.receiptNo} · {receipt.branch}</p>
        <div className="pos-total">{money(receipt.total)}</div>
        <div className="ops-table-wrap" style={{ textAlign: "left", marginBottom: 16 }}>
          <table className="ops-table">
            <tbody>
              {(receipt.lines || []).map((l: any) => (
                <tr key={l.sku}><td>{l.qty} × {l.name}</td><td>{money(l.lineTotal)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="ops-actions" style={{ justifyContent: "center" }}>
          <button className="ops-btn lime" type="button" onClick={newSale}>New sale</button>
          <button className="ops-btn ghost" type="button" onClick={() => window.print()}>Print</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="ops-hero-head">
        <div>
          <h1>Sell</h1>
          <p className="ops-sub">
            {till?.open ? `Till open · ${till.location} · float ${money(till.openingFloat)}` : "Till is closed — open till before selling"}
            {" · "}{user.fullName}
          </p>
        </div>
        {!till?.open && (
          <Link className="ops-btn" to="/app/till">Open till</Link>
        )}
      </div>

      {error && <p className="ops-error">{error}</p>}

      <div className="pos-layout">
        <div className="pos-search-box">
          <input
            placeholder="Scan barcode or search SKU / product / PLU…"
            value={q}
            onChange={e => setQ(e.target.value)}
            autoFocus
          />
          <div className="pos-hits">
            {hits.slice(0, 12).map(p => (
              <button key={p.sku} type="button" className="pos-hit" onClick={() => addLine(p)}>
                <b>{p.name}</b>
                <span>{p.sku} · {money(p.price)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="pos-sale">
          <h3>Current sale</h3>
          <div className="ops-table-wrap">
            <table className="ops-table">
              <thead><tr><th>Item</th><th>Qty</th><th>Total</th></tr></thead>
              <tbody>
                {cart.map(l => (
                  <tr key={l.sku}>
                    <td>{l.name}</td>
                    <td>
                      <button className="ops-btn ghost" type="button" style={{ padding: "2px 8px" }}
                        onClick={() => setLocal(cart.map(x => x.sku === l.sku ? { ...x, qty: Math.max(1, x.qty - 1) } : x))}>−</button>
                      {" "}{l.qty}{" "}
                      <button className="ops-btn ghost" type="button" style={{ padding: "2px 8px" }}
                        onClick={() => setLocal(cart.map(x => x.sku === l.sku ? { ...x, qty: x.qty + 1 } : x))}>+</button>
                    </td>
                    <td>{money(l.qty * l.price)}</td>
                  </tr>
                ))}
                {cart.length === 0 && <tr><td colSpan={3} className="ops-muted">Add products to start a sale</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="pos-total">{money(total)}</div>
          <div className="pos-pay">
            {[
              ["CASH", "Cash"],
              ["CARD", "Card"],
              ["ECOCASH", "EcoCash"],
              ["BANK_TRANSFER", "Bank"],
              ["CUSTOMER_ACCOUNT", "Account"],
            ].map(([m, label]) => (
              <button key={m} className="ops-btn" type="button" disabled={!till?.open || !cart.length} onClick={() => checkout(m)}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export function Till() {
  const user = currentUser()!;
  const [till, setTill] = useState<any>(null);
  const [counted, setCounted] = useState("");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState("");

  const load = () => api("/api/pos/till/current").then(setTill).catch(() => setTill(null));
  useEffect(() => { load(); }, []);

  async function openTill() {
    setMsg("");
    try {
      const t = await api("/api/pos/till/open", {
        method: "POST",
        body: JSON.stringify({ locationId: user.homeLocationId || 1, openingFloat: 200 }),
      });
      setTill({ open: true, ...(t as any) });
      setMsg("Till opened with US$200.00 float");
    } catch (e: any) {
      setMsg(e.message || "Could not open till");
    }
  }

  async function closeTill() {
    setMsg("");
    try {
      const closed = await api("/api/pos/till/close", {
        method: "POST",
        body: JSON.stringify({ countedCash: counted, reason }),
      });
      setTill(closed);
      setMsg("Till closed");
    } catch (e: any) {
      setMsg(e.message || "Could not close till");
    }
  }

  return (
    <>
      <h1>Till</h1>
      <p className="ops-sub">{user.homeLocationName || "Home branch"} · {user.fullName}</p>
      {msg && <p className="ops-muted">{msg}</p>}

      <div className="ops-panel">
        {!till?.open ? (
          <>
            <p>No till is open at this location.</p>
            <button className="ops-btn" type="button" onClick={openTill}>Open till — US$200.00 float</button>
          </>
        ) : (
          <>
            <p>Till open at <b>{till.location}</b> · float {money(till.openingFloat)}</p>
            <div className="ops-input-row">
              <input placeholder="Counted cash" value={counted} onChange={e => setCounted(e.target.value)} />
              <input placeholder="Variance reason" value={reason} onChange={e => setReason(e.target.value)} />
              <button className="ops-btn" type="button" onClick={closeTill}>Close till</button>
            </div>
            {till.variance !== undefined && (
              <p>Expected {money(till.expected)} · Counted {money(till.counted)} · Variance {money(till.variance)}</p>
            )}
          </>
        )}
      </div>
      <Link className="ops-btn ghost" to="/app/pos">Go to sell</Link>
    </>
  );
}

export function Inventory() {
  const [searchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") || "PPC Cement");
  const [data, setData] = useState<any>(null);

  async function load(sku: string) {
    setData(await api("/api/inventory/" + sku));
  }

  useEffect(() => {
    const sku = searchParams.get("sku");
    if (sku) load(sku);
  }, [searchParams]);

  return (
    <>
      <h1>Stock</h1>
      <p className="ops-sub">Company-wide product stock, location breakdown and movements.</p>
      <form
        className="ops-input-row"
        onSubmit={async e => {
          e.preventDefault();
          const found = await api<Product[]>("/api/products/search?q=" + encodeURIComponent(q));
          if (found[0]) load(found[0].sku);
        }}
      >
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search product…" />
        <button className="ops-btn" type="submit">Search</button>
      </form>

      {data && (
        <>
          <div className="ops-hero-head">
            <div>
              <h2 style={{ margin: 0 }}>{data.product.name}</h2>
              <p className="ops-sub">
                {data.product.sku} · Retail {money(data.product.retailPrice)} · Cost {money(data.product.costPrice)} · Value {money(data.value)}
              </p>
            </div>
            <Link className="ops-btn" to={`/app/transfers?sku=${encodeURIComponent(data.product.sku)}`}>Create transfer</Link>
          </div>

          <h3>Location breakdown</h3>
          <div className="ops-table-wrap">
            <table className="ops-table">
              <thead><tr><th>Location</th><th>On hand</th><th>Available</th><th>Reserved</th></tr></thead>
              <tbody>
                {Object.entries(data.breakdown)
                  .filter(([k]) => k !== "TOTAL" && k !== "IN_TRANSIT_TOTAL")
                  .map(([code, v]: any) => (
                    <tr key={code}>
                      <td>{v.name || code} <small className="ops-muted">{v.type}</small></td>
                      <td>{Number(v.quantity ?? 0).toLocaleString()}</td>
                      <td>{Number(v.available ?? v.quantity ?? 0).toLocaleString()}</td>
                      <td>{Number(v.reserved ?? 0).toLocaleString()}</td>
                    </tr>
                  ))}
                <tr><td><b>Total company</b></td><td colSpan={3}><b>{Number(data.breakdown.TOTAL).toLocaleString()}</b></td></tr>
                <tr><td>In transit / trucks</td><td colSpan={3}>{Number(data.breakdown.IN_TRANSIT_TOTAL).toLocaleString()}</td></tr>
              </tbody>
            </table>
          </div>

          <h3>Latest movements</h3>
          <div className="ops-table-wrap">
            <table className="ops-table">
              <thead><tr><th>When</th><th>Type</th><th>Qty</th><th>From</th><th>To</th><th>User</th></tr></thead>
              <tbody>
                {(data.movements || []).map((m: any) => (
                  <tr key={m.id}>
                    <td>{String(m.at || "").replace("T", " ").slice(0, 16)}</td>
                    <td>{m.type}</td>
                    <td>{m.qty}</td>
                    <td>{m.from}</td>
                    <td>{m.to}</td>
                    <td>{m.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}

export function Stores() {
  const ops = useOps();
  const nav = useNavigate();
  const [d, setD] = useState<any>(null);
  useEffect(() => { api("/api/dashboard").then(setD); }, []);
  if (!d) return <p className="ops-muted">Loading stores…</p>;
  const rows = Object.entries(d.branchPerformance || {});
  return (
    <>
      <h1>Stores</h1>
      <p className="ops-sub">Branch comparison · {ops.periodLabel()}</p>
      <div className="ops-table-wrap">
        <table className="ops-table">
          <thead><tr><th>Branch</th><th>Sales</th></tr></thead>
          <tbody>
            {rows.map(([name, sales]) => (
              <tr
                key={name}
                className="clickable"
                onClick={() => {
                  const loc = ops.locations.find(l => l.name === name);
                  if (loc) ops.setLocationId(loc.id);
                  nav("/app");
                }}
              >
                <td>{name}</td>
                <td>{money(sales as number)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function More() {
  const user = currentUser()!;
  const links = moreLinks(user.role);
  return (
    <>
      <h1>More</h1>
      <p className="ops-sub">Secondary tools for your role</p>
      <div className="more-grid">
        {links.map(l => (
          <Link key={l.to} className="more-card" to={l.to}>
            {l.label}
            <span>Open workspace</span>
          </Link>
        ))}
        {links.length === 0 && <p className="ops-muted">No secondary links for this role.</p>}
      </div>
    </>
  );
}

export function Reports() {
  const [d, setD] = useState<any>(null);
  const [tb, setTb] = useState<any>(null);
  useEffect(() => {
    api("/api/dashboard").then(setD);
    api("/api/reports/trial-balance").then(setTb).catch(() => setTb(null));
  }, []);
  return (
    <>
      <h1>Reports & money</h1>
      <p className="ops-sub">Store money summary and trial balance</p>
      {d && (
        <div className="ops-metrics">
          <div className="ops-metric"><span>Sales today</span><b>{money(d.salesToday)}</b></div>
          <div className="ops-metric"><span>Sales this month</span><b>{money(d.salesMonth)}</b></div>
          <div className="ops-metric"><span>Inventory value</span><b>{money(d.inventoryValue)}</b></div>
          <div className="ops-metric"><span>Credit outstanding</span><b>{money(d.creditOutstanding)}</b></div>
        </div>
      )}
      <p><a href="/api/reports/low-stock.csv">Export low stock CSV</a></p>
      <h2>Trial balance</h2>
      <div className="ops-table-wrap">
        <table className="ops-table">
          <thead><tr><th>Account</th><th>Debit</th><th>Credit</th></tr></thead>
          <tbody>
            {tb && Object.entries(tb).map(([k, v]: any) => (
              <tr key={k}><td>{k}</td><td>{money(v.debit)}</td><td>{money(v.credit)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function Warehouse() {
  return (
    <>
      <h1>Warehouse</h1>
      <p className="ops-sub">Receive purchase orders, pick transfers, and complete timber cuts.</p>
      <div className="ops-actions">
        <Link className="ops-btn" to="/app/transfers">Transfers</Link>
        <Link className="ops-btn ghost" to="/app/timber">Timber cutting</Link>
        <Link className="ops-btn ghost" to="/app/purchasing">Receiving</Link>
      </div>
    </>
  );
}

export function Enquiries() {
  const [list, setList] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const statuses = ["NEW", "REVIEWING", "PRICING", "INVOICE_PREPARED", "SENT", "ACCEPTED", "CANCELLED"];
  const load = () => api<any[]>("/api/enquiries").then(setList);
  useEffect(() => { load(); }, []);

  async function setStatus(id: number, status: string) {
    await api("/api/enquiries/" + id + "/status", { method: "POST", body: JSON.stringify({ status }) });
    load();
    if (selected?.id === id) setSelected(await api<any>("/api/enquiries/" + id));
  }

  async function generateInvoice(id: number) {
    await api("/api/enquiries/" + id + "/convert", { method: "POST" });
    load();
    setSelected(await api<any>("/api/enquiries/" + id));
  }

  return (
    <>
      <h1>Requests</h1>
      <p className="ops-sub">Invoice and quotation requests from the public website.</p>
      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 1.2fr" : "1fr", gap: 16 }}>
        <div>
          {list.map(e => (
            <div
              key={e.id}
              className="ops-panel"
              style={{ cursor: "pointer", borderColor: selected?.id === e.id ? "var(--ops-accent)" : undefined }}
              onClick={() => setSelected(e)}
            >
              <b>{e.reference}</b> · <span className="ops-badge">{e.status}</span><br />
              {e.customerName} · {e.phone || "—"} · {e.fulfilment}<br />
              <small className="ops-muted">{String(e.createdAt || "").replace("T", " ").slice(0, 16)}</small>
            </div>
          ))}
          {list.length === 0 && <p className="ops-muted">No customer requests yet.</p>}
        </div>
        {selected && (
          <div className="ops-panel">
            <h2 style={{ marginTop: 0 }}>{selected.reference}</h2>
            <p><b>Status:</b> {selected.status}</p>
            <p>
              <b>Customer:</b> {selected.customerName}<br />
              <b>Phone:</b> {selected.phone || "—"}<br />
              <b>Email:</b> {selected.email || "—"}<br />
              <b>Fulfilment:</b> {selected.fulfilment}<br />
              <b>Delivery:</b> {selected.deliveryAddress || "—"}
            </p>
            <h3>Products</h3>
            <div className="ops-table-wrap">
              <table className="ops-table">
                <thead><tr><th>SKU</th><th>Description</th><th>Qty</th><th>Unit price</th></tr></thead>
                <tbody>
                  {(selected.lines || []).map((l: any) => (
                    <tr key={l.sku}><td>{l.sku}</td><td>{l.name}</td><td>{l.quantity}</td><td>{money(l.unitPrice)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h3>Notes</h3>
            <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", background: "#eef2ef", padding: 12, borderRadius: 6 }}>{selected.notes || "—"}</pre>
            <label>Update status</label>
            <select value={selected.status} onChange={e => setStatus(selected.id, e.target.value)} style={{ display: "block", margin: "8px 0 16px", padding: 8 }}>
              {statuses.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
            </select>
            <div className="ops-actions">
              {!selected.convertedQuoteId && selected.status !== "CANCELLED" && (
                <button className="ops-btn lime" type="button" onClick={() => generateInvoice(selected.id)}>Generate invoice</button>
              )}
              {selected.convertedQuoteId && <Link className="ops-btn" to="/app/orders">Open quotes &amp; orders</Link>}
              <button className="ops-btn ghost" type="button" onClick={() => window.print()}>Print</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export function Orders() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const load = () => { api<any[]>("/api/quotes").then(setQuotes); api<any[]>("/api/orders").then(setOrders); };
  useEffect(() => { load(); }, []);
  return (
    <>
      <h1>Sales</h1>
      <p className="ops-sub">Quotes and sales orders</p>
      <h2>Quotes</h2>
      <div className="ops-table-wrap">
        <table className="ops-table">
          <thead><tr><th>Ref</th><th>Customer</th><th>Total</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {quotes.map(q => (
              <tr key={q.id}>
                <td>{q.reference}</td>
                <td>{q.customer}</td>
                <td>{money(q.total)}</td>
                <td>{q.status}</td>
                <td>
                  {q.status === "ISSUED" && (
                    <button className="ops-btn" type="button" onClick={async () => { await api("/api/quotes/" + q.id + "/accept", { method: "POST" }); load(); }}>
                      Accept / create order
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2>Orders</h2>
      <div className="ops-table-wrap">
        <table className="ops-table">
          <thead><tr><th>Ref</th><th>Customer</th><th>Reserved</th><th>Status</th></tr></thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}><td>{o.reference}</td><td>{o.customer}</td><td>{String(o.reserved)}</td><td>{o.status}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function Transfers() {
  const [searchParams] = useSearchParams();
  const presetSku = searchParams.get("sku") || "CEM-PPC-50";
  const [list, setList] = useState<any[]>([]);
  const [locs, setLocs] = useState<any[]>([]);
  const [trucks, setTrucks] = useState<any[]>([]);
  const load = () => api<any[]>("/api/transfers").then(setList);
  useEffect(() => {
    load();
    api<any[]>("/api/locations").then(setLocs);
    api<any[]>("/api/fleet/trucks").then(setTrucks).catch(() => setTrucks([]));
  }, []);
  const wh = locs.find(l => l.code === "WH-01") || locs.find((l: any) => l.type === "WAREHOUSE");
  const shop = locs.find(l => l.code === "TRB-01") || locs.find(l => l.name === "Trabablas Fidelity") || locs.find((l: any) => l.type === "SHOP");
  const truck = trucks.find(t => t.vehicleCode === "SNG-04") || trucks[0];
  return (
    <>
      <h1>Transfers</h1>
      <p className="ops-sub">Move stock between warehouses and branches{presetSku ? ` · SKU ${presetSku}` : ""}</p>
      <button
        className="ops-btn"
        type="button"
        onClick={async () => {
          await api("/api/transfers", {
            method: "POST",
            body: JSON.stringify({
              fromLocationId: wh?.id,
              toLocationId: shop?.id,
              truckId: truck?.id,
              lines: [{ sku: presetSku, quantity: 100 }],
            }),
          });
          load();
        }}
      >
        Create transfer ({presetSku})
      </button>
      {list.map(t => (
        <div className="ops-panel" key={t.id} style={{ marginTop: 12 }}>
          <b>{t.reference}</b> {t.status} · {t.from} → {t.to} · {t.truck} · {t.driver}
          <ul>{(t.lines || []).map((l: any) => (
            <li key={l.sku}>{l.requested} {l.name} loaded {l.loaded ?? "–"} received {l.received ?? "–"} variance {l.variance ?? "–"}</li>
          ))}</ul>
          <div className="ops-actions">
            {t.status === "REQUESTED" && <button className="ops-btn" type="button" onClick={async () => { await api("/api/transfers/" + t.id + "/status/APPROVED", { method: "POST" }); load(); }}>Approve</button>}
            {(t.status === "APPROVED" || t.status === "PICKING" || t.status === "LOADED") && (
              <button className="ops-btn" type="button" onClick={async () => { await api("/api/transfers/" + t.id + "/load", { method: "POST" }); load(); }}>Load / send in transit</button>
            )}
            {t.status === "IN_TRANSIT" && (
              <button className="ops-btn" type="button" onClick={async () => {
                await api("/api/transfers/" + t.id + "/receive", { method: "POST", body: JSON.stringify({ lines: [{ sku: presetSku, receivedQty: 98 }] }) });
                load();
              }}>Receive 98 (variance -2)</button>
            )}
          </div>
        </div>
      ))}
    </>
  );
}

export function Timber() {
  const [preview, setPreview] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [locs, setLocs] = useState<any[]>([]);
  const payload = useMemo(() => ({
    locationId: locs.find(l => l.code === "WH-01")?.id,
    sourceSku: "TIM-PINE-38-114-6000",
    sourceQty: 1,
    originalLengthM: 6,
    kerfMm: 3,
    pieces: [{ lengthM: 2.4, quantity: 1 }, { lengthM: 2.4, quantity: 1 }],
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
          <div className="bar" style={{ display: "flex", height: 28, borderRadius: 4, overflow: "hidden", marginBottom: 12 }}>
            {preview.segments.map((s: number, i: number) => (
              <span key={i} style={{ width: (s / preview.originalM) * 100 + "%", background: colours[i % colours.length], color: "#fff", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>{s}m</span>
            ))}
          </div>
        </>
      )}
      <button className="ops-btn" type="button" onClick={async () => { await api("/api/timber", { method: "POST", body: JSON.stringify(payload) }); load(); }}>Create cut job</button>
      {jobs.map(j => (
        <div className="ops-panel" key={j.id} style={{ marginTop: 12 }}>
          <b>{j.reference}</b> {j.status} · {j.sourceName} · used {j.usedM}m · offcut {j.offcutM}m
          {j.status !== "COMPLETED" && (
            <div style={{ marginTop: 8 }}>
              <button className="ops-btn" type="button" onClick={async () => { await api("/api/timber/" + j.id + "/complete", { method: "POST" }); load(); }}>Complete cut</button>
            </div>
          )}
        </div>
      ))}
    </>
  );
}

export function Fleet() {
  const [trucks, setTrucks] = useState<any[]>([]);
  const [sel, setSel] = useState<any>(null);
  const load = () => api<any[]>("/api/fleet/trucks").then(setTrucks);
  useEffect(() => { load(); }, []);
  return (
    <>
      <h1>Operations / fleet</h1>
      <div className="ops-table-wrap">
        <table className="ops-table">
          <thead><tr><th>Code</th><th>Reg</th><th>Driver</th><th>Odo</th><th>Next service</th><th>Status</th></tr></thead>
          <tbody>
            {trucks.map(t => (
              <tr key={t.id} className="clickable" onClick={async () => setSel(await api("/api/fleet/trucks/" + t.id))}>
                <td>{t.vehicleCode}</td>
                <td>{t.registration}</td>
                <td>{t.driver}</td>
                <td>{t.odometerKm?.toLocaleString()} km</td>
                <td>{t.nextServiceKm?.toLocaleString()} {t.serviceDueSoon && <span className="ops-badge low">SERVICE DUE</span>}</td>
                <td>{t.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sel && (
        <div className="ops-panel" style={{ marginTop: 16 }}>
          <h3>{sel.vehicleCode} · remaining {sel.remainingKm} km to service</h3>
          <button className="ops-btn" type="button" onClick={async () => {
            await api("/api/fleet/trucks/" + sel.id + "/maintenance", {
              method: "POST",
              body: JSON.stringify({ type: "SERVICE", description: "Scheduled service", cost: 850, takeOutOfService: true, nextServiceKm: 140000 }),
            });
            load();
            setSel(await api("/api/fleet/trucks/" + sel.id));
          }}>Record maintenance</button>
        </div>
      )}
    </>
  );
}

export function Trips() {
  const [trips, setTrips] = useState<any[]>([]);
  const load = () => api<any[]>("/api/fleet/trips").then(setTrips);
  useEffect(() => { load(); }, []);
  return (
    <>
      <h1>Deliveries</h1>
      <p className="ops-sub">Driver trips and proof of delivery</p>
      {trips.map(t => (
        <div className="ops-panel" key={t.id}>
          <b>{t.reference}</b> {t.truck} · {t.from} → {t.to} · {t.status}
          <div className="ops-actions" style={{ marginTop: 10 }}>
            <button className="ops-btn" type="button" onClick={async () => { await api("/api/fleet/trips/" + t.id + "/start", { method: "POST" }); load(); }}>Start trip</button>
            <button className="ops-btn ghost" type="button" onClick={async () => { await api("/api/fleet/trips/" + t.id + "/arrived", { method: "POST" }); load(); }}>Arrived</button>
            <button className="ops-btn ghost" type="button" onClick={async () => {
              await api("/api/fleet/trips/" + t.id + "/pod", { method: "POST", body: JSON.stringify({ recipient: "Branch receiver", notes: "Offloaded" }) });
              load();
            }}>Delivered / POD</button>
          </div>
        </div>
      ))}
      {trips.length === 0 && <p className="ops-muted">No trips assigned.</p>}
    </>
  );
}

export function Purchasing() {
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
      <h1>Receiving</h1>
      <p className="ops-sub">Purchase orders and goods receipt</p>
      <button className="ops-btn" type="button" onClick={async () => {
        await api("/api/purchasing/orders", {
          method: "POST",
          body: JSON.stringify({
            supplierId: suppliers[0]?.id,
            locationId: locs[0]?.id,
            expectedDate: new Date().toISOString().slice(0, 10),
            lines: [{ sku: "CEM-PPC-50", quantity: 100, unitCost: 8.2 }],
          }),
        });
        load();
      }}>Draft PO 100 cement</button>
      {pos.map(p => (
        <div className="ops-panel" key={p.id} style={{ marginTop: 12 }}>
          {p.reference} {p.status} {p.supplier}
          <div className="ops-actions" style={{ marginTop: 8 }}>
            <button className="ops-btn" type="button" onClick={async () => { await api("/api/purchasing/orders/" + p.id + "/status/ORDERED", { method: "POST" }); load(); }}>Mark ordered</button>
            <button className="ops-btn ghost" type="button" onClick={async () => {
              await api("/api/purchasing/orders/" + p.id + "/receive", { method: "POST", body: JSON.stringify({ lines: [{ sku: "CEM-PPC-50", receivedQty: 97 }] }) });
              load();
            }}>Receive 97 (variance -3)</button>
          </div>
        </div>
      ))}
    </>
  );
}

export function Accounting() {
  const [journals, setJournals] = useState<any[]>([]);
  useEffect(() => { api<any[]>("/api/journals").then(setJournals); }, []);
  return (
    <>
      <h1>Finance</h1>
      <p className="ops-sub">Posted journals cannot be edited. Corrections reverse the original.</p>
      {journals.map(j => (
        <div key={j.id} className="ops-panel">
          <b>{j.reference}</b> {j.description} {j.reversed ? "(reversed)" : ""}
          <div className="ops-table-wrap" style={{ marginTop: 8 }}>
            <table className="ops-table">
              <tbody>
                {j.lines.map((l: any, i: number) => (
                  <tr key={i}><td>{l.account}</td><td>{money(l.debit)}</td><td>{money(l.credit)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </>
  );
}

export function Audit() {
  const [data, setData] = useState<any>({ items: [] });
  useEffect(() => { api("/api/audit").then(setData); }, []);
  return (
    <>
      <h1>Audit trail</h1>
      <p className="ops-sub">Read-only trace of price changes, stock, POS, transfers, timber and journals.</p>
      <div className="ops-table-wrap">
        <table className="ops-table">
          <thead><tr><th>When</th><th>User</th><th>Action</th><th>Entity</th><th>Before</th><th>After</th></tr></thead>
          <tbody>
            {(data.items || []).map((a: any) => (
              <tr key={a.id}>
                <td>{a.at}</td><td>{a.user}</td><td>{a.action}</td>
                <td>{a.entity} {a.entityId}</td><td>{a.before}</td><td>{a.after}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function Customers() {
  const [list, setList] = useState<any[]>([]);
  useEffect(() => { api<any[]>("/api/customers").then(setList); }, []);
  return (
    <>
      <h1>Customers</h1>
      <div className="ops-table-wrap">
        <table className="ops-table">
          <thead><tr><th>Account</th><th>Name</th><th>Type</th><th>Limit</th><th>Outstanding</th><th>Available</th></tr></thead>
          <tbody>
            {list.map(c => (
              <tr key={c.id}>
                <td>{c.accountCode}</td><td>{c.name}</td><td>{c.type}</td>
                <td>{money(c.creditLimit)}</td><td>{money(c.outstanding)}</td><td>{money(c.available)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
