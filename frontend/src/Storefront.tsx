/**
 * Public SNG Hardware catalogue + invoice / quotation request service.
 * No online checkout. Verified contacts only.
 */
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import React, { FormEvent, useEffect, useState } from "react";
import {
  addCartLine, api, CartLine, cartQty, currentUser, getCart,
  logout, pushViewed, setCart, setSession, token
} from "./api";
import {
  CAT_IMG, CAT_STORY, CORE_CAT_ORDER, FEATURED_SKUS, HERO_IMGS, HOME_CATS, SERVICE_IMGS,
  merchFallback, merchSrc, stockClass, stockLabel, unitLabel
} from "./merch";
import { SNG, isBulkCategory, money, telHref, waHref } from "./sng";

export type Product = {
  id: number; sku: string; name: string; brand: string; unitOfMeasure: string;
  price: number; retailPrice: number; promotionPrice?: number; imageUrl: string;
  inStock: boolean; inStockBranches?: number; category?: string; categorySlug?: string;
  description?: string; specification?: string; tradePrice?: number;
  availability?: { locationId?: number; locationName: string; city: string; status: string }[];
  related?: Product[];
};

export { money };

const PLACEHOLDER = "/img/brand/placeholder.jpg";
const CONTACTS = SNG.contacts;

function MerchImg({ product, alt, className }: { product?: Partial<Product>; alt: string; className?: string }) {
  const [src, setSrc] = useState(merchSrc(product || {}));
  useEffect(() => { setSrc(merchSrc(product || {})); }, [product?.sku, product?.imageUrl, product?.categorySlug]);
  return (
    <img
      className={className}
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => {
        const fb = merchFallback(product || {});
        setSrc(fb === src ? PLACEHOLDER : fb);
      }}
    />
  );
}

function useTick(event: string) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const fn = () => setN(x => x + 1);
    window.addEventListener(event, fn);
    return () => window.removeEventListener(event, fn);
  }, [event]);
  return n;
}

function toast(msg: string) {
  window.dispatchEvent(new CustomEvent("sng-toast", { detail: msg }));
}

function ToastHost() {
  const [msg, setMsg] = useState("");
  useEffect(() => {
    let t: number | undefined;
    const fn = (e: Event) => {
      setMsg((e as CustomEvent).detail);
      window.clearTimeout(t);
      t = window.setTimeout(() => setMsg(""), 2200);
    };
    window.addEventListener("sng-toast", fn);
    return () => {
      window.removeEventListener("sng-toast", fn);
      window.clearTimeout(t);
    };
  }, []);
  if (!msg) return null;
  return <div className="toast">{msg}</div>;
}

function addProduct(p: Product, qty = 1) {
  addCartLine({ sku: p.sku, name: p.name, qty, price: p.price, imageUrl: merchSrc(p) });
  toast(`${p.name} added to invoice request`);
}

function MobileActionBar() {
  const primary = CONTACTS[0];
  return (
    <div className="mobile-actions" aria-label="Quick actions">
      <a href={telHref(primary.phone)}>Call</a>
      <a className="wa" href={waHref(primary.whatsapp, "Hello SNG Hardware")} target="_blank" rel="noreferrer">WhatsApp</a>
      <Link to="/invoice">Request invoice</Link>
    </div>
  );
}

export function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="store">
      <StoreHeader />
      <ToastHost />
      {children}
      <StoreFooter />
      <MobileActionBar />
    </div>
  );
}

function StoreHeader() {
  const nav = useNavigate();
  const loc = useLocation();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [hits, setHits] = useState<Product[]>([]);
  useTick("sng-cart");
  const primary = CONTACTS[0];

  useEffect(() => {
    if (q.trim().length < 2) { setHits([]); return; }
    const t = setTimeout(() => {
      api<Product[]>("/api/public/products?q=" + encodeURIComponent(q.trim()))
        .then(list => setHits(list.slice(0, 6)))
        .catch(() => setHits([]));
    }, 180);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => { setOpen(false); setHits([]); }, [loc.pathname]);

  function goSearch(e: FormEvent) {
    e.preventDefault();
    nav("/shop?q=" + encodeURIComponent(q.trim()));
    setHits([]);
  }

  return (
    <header className="store-header">
      <div className="hdr-top">
        <div className="wrap hdr-top-inner">
          <span className="hdr-top-left">
            Head Office: {SNG.headOffice.full}
          </span>
          <span className="hdr-top-actions">
            <a href={telHref(primary.phone)}>Phone: {primary.display}</a>
            <a href={`mailto:${SNG.email}`}>Email: {SNG.email}</a>
          </span>
        </div>
      </div>
      <div className="wrap hdr-main">
        <Link to="/" className="logo">
          <img src="/img/logo.png" alt="SNG Hardware — Builders One Stop" className="logo-img" />
        </Link>
        <form className="search" onSubmit={goSearch}>
          <input placeholder="Search cement, timber, roofing, tools..." value={q} onChange={e => setQ(e.target.value)} />
          <button type="submit">Search</button>
          {q.trim().length >= 2 && (
            <div className="suggest">
              {hits.map(p => (
                <Link key={p.sku} to={"/product/" + p.sku} onClick={() => setQ("")}>
                  <MerchImg product={p} alt="" />
                  <span><b>{p.name}</b><small>{p.sku} · {p.brand}</small></span>
                </Link>
              ))}
              {hits.length === 0 && (
                <div className="suggest-empty">
                  Not listed? <Link to="/invoice">Request an invoice</Link> or{" "}
                  <a href={waHref(primary.whatsapp, `Looking for: ${q}`)} target="_blank" rel="noreferrer">WhatsApp</a>
                </div>
              )}
            </div>
          )}
        </form>
        <div className="hdr-utils">
          <a className="util util-wa" href={waHref(primary.whatsapp, "Hello SNG Hardware")} target="_blank" rel="noreferrer">WhatsApp</a>
          <Link className="util util-quote" to="/invoice">Request invoice</Link>
          <Link to="/invoice-list" className="util">Invoice list <b>{cartQty()}</b></Link>
          <button className="menu-btn" type="button" onClick={() => setOpen(!open)} aria-label="Menu">Menu</button>
        </div>
      </div>
      <div className={"hdr-nav-row" + (open ? " open" : "")}>
        <div className="wrap hdr-nav-inner">
          <nav className="nav">
            <Link to="/">Home</Link>
            <Link to="/shop">Products</Link>
            <Link to="/categories">Categories</Link>
            <Link to="/shop/cement-concrete">Cement</Link>
            <Link to="/shop/timber">Timber</Link>
            <Link to="/shop/roofing">Roofing</Link>
            <Link to="/shop/plumbing">Plumbing</Link>
            <Link to="/shop/electrical">Electrical</Link>
            <Link to="/shop/tools">Tools</Link>
            <Link to="/delivery">Delivery</Link>
            <Link to="/contact">Contact</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

function StoreFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div>
          <img src="/img/logo.png" alt="" className="footer-logo" />
          <p className="footer-brand">{SNG.brand}<br />{SNG.tagline}</p>
          <p>
            <b>Head Office</b><br />
            {SNG.headOffice.address}<br />
            {SNG.headOffice.suburb}
          </p>
          <p><a href={`mailto:${SNG.email}`}>{SNG.email}</a></p>
        </div>
        <div>
          <h4>Quick links</h4>
          <Link to="/shop">Products</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/invoice">Request invoice</Link>
          <Link to="/delivery">Delivery</Link>
          <Link to="/timber-cut">Timber cutting</Link>
          <Link to="/trade">Trade</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div>
          <h4>Contacts</h4>
          {CONTACTS.map(c => (
            <p key={c.name}>
              <b>{c.name}</b><br />
              <a href={telHref(c.phone)}>{c.display}</a>
            </p>
          ))}
        </div>
        <div>
          <h4>Social</h4>
          <p>Facebook — {SNG.facebook}</p>
          <p>Instagram — {SNG.instagram}</p>
        </div>
      </div>
      <div className="wrap footer-bottom">
        <span>{SNG.brand} · {SNG.tagline}</span>
        <span>Damofalls Ruwa · Zimbabwe</span>
      </div>
    </footer>
  );
}

function pickFeatured(featured: Product[] = [], bestsellers: Product[] = []) {
  const all = [...featured, ...bestsellers].filter((p, i, arr) => arr.findIndex(x => x.sku === p.sku) === i);
  const preferred = FEATURED_SKUS.map(sku => all.find(p => p.sku === sku)).filter(Boolean) as Product[];
  const rest = all.filter(p => !FEATURED_SKUS.includes(p.sku));
  return [...preferred, ...rest].slice(0, 8);
}

function sortCategories(cats: any[]) {
  return [...cats].sort((a, b) => {
    const ia = CORE_CAT_ORDER.indexOf(a.slug);
    const ib = CORE_CAT_ORDER.indexOf(b.slug);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
}

export function Home() {
  const [data, setData] = useState<any>(null);
  useTick("sng-cart");
  useEffect(() => { api("/api/public/home").then(setData); }, []);
  if (!data) return <div className="wrap loading-panel">Loading SNG Hardware…</div>;

  const primary = CONTACTS[0];

  return (
    <>
      <section
        className="hero"
        style={{
          backgroundImage: `linear-gradient(105deg, rgba(18,32,20,.88) 0%, rgba(18,32,20,.55) 42%, rgba(18,32,20,.2) 100%), url(${HERO_IMGS.yard})`
        }}
      >
        <div className="wrap hero-inner">
          <h1>EVERYTHING YOU NEED TO BUILD.</h1>
          <p className="lede">
            Cement, timber, roofing, plumbing, electrical, tools and building materials for projects of every size.
          </p>
          <div className="actions">
            <Link className="btn gold" to="/invoice">Request invoice</Link>
            <Link className="btn ghost" to="/shop">Browse products</Link>
            <a className="btn ghost" href={telHref(primary.phone)}>Call</a>
            <a className="btn ghost" href={waHref(primary.whatsapp, "Hello SNG Hardware")} target="_blank" rel="noreferrer">WhatsApp</a>
          </div>
          <ul className="hero-pills">
            <li>Product catalogue</li>
            <li>Invoice / quotation requests</li>
            <li>Collection &amp; delivery</li>
            <li>Timber cutting</li>
          </ul>
        </div>
      </section>

      <section className="trust">
        <div className="wrap trust-grid">
          <div><b>Browse products</b><span>Catalogue by category</span></div>
          <div><b>Request invoice</b><span>Price confirmed by SNG</span></div>
          <div><b>Collection</b><span>Pick up from SNG</span></div>
          <div><b>Delivery</b><span>To your site</span></div>
        </div>
      </section>

      <section className="wrap section">
        <div className="section-head">
          <h2>Product categories</h2>
          <Link to="/categories">All categories</Link>
        </div>
        <div className="cat-grid photo-cats">
          {HOME_CATS.map(c => {
            const story = CAT_STORY[c.slug] || { blurb: "", cta: "View products" };
            return (
              <Link key={c.slug} className="cat-tile" to={c.href}>
                <img src={CAT_IMG[c.slug] || PLACEHOLDER} alt={c.name} onError={e => { e.currentTarget.src = PLACEHOLDER; }} />
                <div className="cat-tile-body">
                  <h3>{c.name}</h3>
                  <p>{story.blurb}</p>
                  <span>{story.cta}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="wrap section">
        <div className="section-head">
          <h2>Popular products</h2>
          <Link to="/shop">Browse all</Link>
        </div>
        <ProductGrid items={pickFeatured(data.featured, data.bestsellers)} />
      </section>

      <section className="band-sand">
        <div className="wrap section invoice-cta">
          <h2>Need an invoice or quotation?</h2>
          <p>Add products from the catalogue, then submit your contact and collection or delivery details. SNG will confirm stock and pricing before preparing your invoice.</p>
          <div className="actions">
            <Link className="btn gold" to="/invoice">Request invoice</Link>
            <Link className="btn ghost dark" to="/invoice-list">View invoice list ({cartQty()})</Link>
          </div>
        </div>
      </section>

      <section className="house-band">
        <div className="wrap house-inner">
          <div className="house-copy">
            <h2>Building a house?</h2>
            <p>Send us your material list and let SNG price the complete job.</p>
            <ul className="house-list">
              <li>Cement</li><li>Bricks</li><li>Timber</li><li>Roofing</li>
              <li>Plumbing</li><li>Electrical</li><li>Finishes</li>
            </ul>
            <div className="actions">
              <Link className="btn gold" to="/invoice?project=house">Request full material invoice</Link>
              <Link className="btn ghost dark" to="/invoice?project=house">Upload material list</Link>
            </div>
          </div>
          <img className="house-photo" src={SERVICE_IMGS.house} alt="Building materials for a house" onError={e => { e.currentTarget.src = HERO_IMGS.yard; }} />
        </div>
      </section>

      <section className="split-cta reverse">
        <img src={SERVICE_IMGS.cutting} alt="Timber" onError={e => { e.currentTarget.src = HERO_IMGS.timber; }} />
        <div>
          <h2>Timber cut to your requirements</h2>
          <p>Example: 6.0m length cut to 2.4m + 2.4m + offcut.</p>
          <Link className="btn gold" to="/timber-cut">Request timber quote</Link>
        </div>
      </section>

      <section className="split-cta">
        <img src={SERVICE_IMGS.delivery} alt="Delivery" />
        <div>
          <h2>We deliver building materials to your site</h2>
          <p>Cement · Timber · Roofing · Sand · Stone · Bulk building orders</p>
          <Link className="btn gold" to="/delivery">Request delivery</Link>
        </div>
      </section>

      <section className="trade-band">
        <div className="wrap">
          <h2>Trade &amp; bulk customers</h2>
          <p>Contractors, builders, companies and repeat buyers — request bulk pricing, invoices and delivery support.</p>
          <div className="actions">
            <Link className="btn gold" to="/trade">Request trade pricing</Link>
            <a className="btn ghost" href={telHref(primary.phone)}>Call {primary.display}</a>
          </div>
        </div>
      </section>

      <section className="wrap section">
        <div className="section-head">
          <h2>Contact our SNG locations</h2>
          <Link to="/contact">All contacts</Link>
        </div>
        <p className="lede-sm"><b>Head Office:</b> {SNG.headOffice.full}</p>
        <div className="branch-grid">
          {CONTACTS.map(c => (
            <article className="branch-card" key={c.name}>
              <h3>{c.name}</h3>
              <p className="phone-lg"><a href={telHref(c.phone)}>{c.display}</a></p>
              {c.name === "Damofalls Ruwa" && <p className="muted">{SNG.headOffice.full}</p>}
              <div className="actions">
                <a className="btn" href={telHref(c.phone)}>Call</a>
                <a className="btn ghost" href={waHref(c.whatsapp, `Hello SNG — ${c.name}`)} target="_blank" rel="noreferrer">WhatsApp</a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function ProductGrid({ items }: { items: Product[] }) {
  return (
    <div className="prod-grid">
      {(items || []).map(p => <ProductCard key={p.sku} p={p} />)}
    </div>
  );
}

function ProductCard({ p }: { p: Product }) {
  const status = p.inStock ? "IN_STOCK" : "OUT_OF_STOCK";
  const bulk = isBulkCategory(p.categorySlug, p.sku);
  return (
    <article className="prod-card">
      <Link to={"/product/" + p.sku} className="prod-media">
        <MerchImg product={p} alt={p.name} />
      </Link>
      <div className="prod-body">
        <small className="brand-line">{p.brand}</small>
        <Link to={"/product/" + p.sku}><h3>{p.name}</h3></Link>
        <p className="meta">SKU {p.sku}</p>
        <div className="price-row">
          <span className="price">{money(p.price)}</span>
          <span className="per">per {unitLabel(p.unitOfMeasure)}</span>
        </div>
        <span className={"badge " + stockClass(status)}>{stockLabel(status, p.inStock)}</span>
        {bulk && <p className="bulk-note">Bulk pricing available</p>}
        <div className="card-actions">
          <button className="btn" type="button" onClick={() => addProduct(p)}>
            {bulk ? "Bulk pricing" : "Add to invoice"}
          </button>
          <Link className="btn ghost" to={"/product/" + p.sku}>View product</Link>
        </div>
      </div>
    </article>
  );
}

export function Shop({ promotion }: { promotion?: boolean }) {
  const { category } = useParams();
  const [params] = useSearchParams();
  const [items, setItems] = useState<Product[] | null>(null);
  const q = params.get("q") || "";
  useTick("sng-cart");
  useEffect(() => {
    setItems(null);
    const qs = new URLSearchParams();
    if (q) qs.set("q", q);
    if (category) qs.set("category", category);
    if (promotion) qs.set("promotion", "true");
    api<Product[]>("/api/public/products?" + qs.toString()).then(setItems);
  }, [q, category, promotion]);
  const title = promotion ? "Specials" : category ? category.replace(/-/g, " ") : "Products";
  const story = category ? CAT_STORY[category] : null;
  return (
    <div className="wrap page">
      <p className="crumb"><Link to="/">Home</Link> / {title}</p>
      <h1 className="cap">{title}</h1>
      {story && <p className="lede-sm">{story.blurb}</p>}
      {q && <p>Results for “{q}”</p>}
      {items === null && <p>Loading products…</p>}
      {items && items.length > 0 && <ProductGrid items={items} />}
      {items && items.length === 0 && (
        <div className="empty-panel">
          <h2>Need something not listed?</h2>
          <p>Call, WhatsApp or request an invoice with your material list.</p>
          <Link className="btn gold" to="/invoice">Request invoice</Link>
        </div>
      )}
    </div>
  );
}

export function CategoriesPage() {
  return (
    <div className="wrap page">
      <h1>Categories</h1>
      <div className="cat-grid photo-cats">
        {HOME_CATS.map(c => {
          const story = CAT_STORY[c.slug] || { blurb: "", cta: "View products" };
          return (
            <Link key={c.slug} className="cat-tile" to={c.href}>
              <img src={CAT_IMG[c.slug] || PLACEHOLDER} alt={c.name} onError={e => { e.currentTarget.src = PLACEHOLDER; }} />
              <div className="cat-tile-body">
                <h3>{c.name}</h3>
                <p>{story.blurb}</p>
                <span>{story.cta}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function ProductPage() {
  const { sku } = useParams();
  const nav = useNavigate();
  const [p, setP] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const primary = CONTACTS[0];
  useEffect(() => {
    api<Product>("/api/public/products/" + sku).then(prod => {
      setP(prod);
      pushViewed(prod.sku);
    });
  }, [sku]);
  if (!p) return <div className="wrap page">Loading product…</div>;
  const bulk = isBulkCategory(p.categorySlug, p.sku);
  return (
    <div className="wrap page">
      <p className="crumb"><Link to="/shop">Products</Link> / {p.category} / {p.name}</p>
      <div className="pdp">
        <div className="pdp-hero">
          <MerchImg product={p} alt={p.name} />
        </div>
        <div className="pdp-info">
          <p className="brand-line">{p.brand}</p>
          <h1>{p.name}</h1>
          <p className="meta">SKU {p.sku} · {p.category}</p>
          <div className="price-row lg">
            <span className="price">{money(p.price)}</span>
            <span className="per">per {unitLabel(p.unitOfMeasure)}</span>
          </div>
          <span className={"badge " + stockClass(p.inStock ? "IN_STOCK" : "OUT_OF_STOCK")}>
            {stockLabel(p.inStock ? "IN_STOCK" : "OUT_OF_STOCK", p.inStock)}
          </span>
          {bulk && <p className="bulk-note">Ask about bulk pricing.</p>}
          <div className="pdp-actions">
            <input type="number" min={1} value={qty} onChange={e => setQty(Math.max(1, Number(e.target.value)))} aria-label="Quantity" />
            <button className="btn gold" type="button" onClick={() => { addProduct(p, qty); nav("/invoice-list"); }}>Add to invoice request</button>
            <button className="btn" type="button" onClick={() => { addProduct(p, qty); nav("/invoice"); }}>Request price</button>
            <a className="btn ghost" href={telHref(primary.phone)}>Call</a>
            <a className="btn ghost" href={waHref(primary.whatsapp, `Hi SNG, price on ${p.name} (${p.sku})`)} target="_blank" rel="noreferrer">WhatsApp</a>
          </div>
        </div>
      </div>
      <div className="pdp-extra">
        <div>
          <h2>Description</h2>
          <p>{p.description || "Available in store. Ask about stock and bulk pricing."}</p>
          <h2>Specifications</h2>
          <p>{p.specification || "Confirm sizes and specifications with SNG staff."}</p>
        </div>
        <div>
          <h2>Collection &amp; delivery</h2>
          <p>Call your nearest SNG contact to confirm stock, collection or truck delivery.</p>
          <h2>Contact</h2>
          <p>
            <a href={telHref(primary.phone)}>{primary.display}</a> · Damofalls Ruwa<br />
            {SNG.headOffice.full}
          </p>
        </div>
      </div>
      {p.related && p.related.length > 0 && (
        <>
          <h2>Related products</h2>
          <ProductGrid items={p.related} />
        </>
      )}
    </div>
  );
}

export function Branches() {
  return <Contact />;
}

/** Invoice request product list (formerly quote cart) */
export function CartPage() {
  const [lines, setLines] = useState(getCart());
  function update(next: CartLine[]) { setCart(next); setLines(next); }
  return (
    <div className="wrap page">
      <h1>Invoice request list</h1>
      <p>Review products and quantities, then continue to request an invoice. No online payment.</p>
      {lines.length === 0 && <p>Your list is empty. <Link to="/shop">Browse products</Link></p>}
      {lines.map(l => (
        <div className="cart-line" key={l.sku}>
          <img src={l.imageUrl || merchSrc({ sku: l.sku })} alt="" onError={e => { e.currentTarget.src = PLACEHOLDER; }} />
          <div>
            <b>{l.name}</b>
            <small>{l.sku}</small>
          </div>
          <input type="number" min={1} value={l.qty} onChange={e => update(lines.map(x => x.sku === l.sku ? { ...x, qty: Number(e.target.value) } : x))} />
          <button className="btn ghost" onClick={() => update(lines.filter(x => x.sku !== l.sku))}>Remove</button>
        </div>
      ))}
      {lines.length > 0 && <Link className="btn gold" to="/invoice">Continue — request invoice</Link>}
    </div>
  );
}

export function QuotePage() {
  const [params] = useSearchParams();
  const project = params.get("project");
  const timber = params.get("timber");
  const delivery = params.get("delivery");
  const [form, setForm] = useState({
    customerName: "",
    companyName: "",
    phone: "",
    whatsapp: "",
    email: "",
    preferredContact: CONTACTS[0].name,
    fulfilment: delivery ? "DELIVERY" : "COLLECTION",
    deliveryAddress: "",
    suburb: "",
    deliveryNotes: "",
    projectType: project === "house" ? "Residential" : timber ? "Other" : "",
    notes: project === "house" ? "Full material list for a house build — please price complete job." :
      timber ? (typeof sessionStorage !== "undefined" && sessionStorage.getItem("sng.timberNotes")) || "Timber cut-to-size required. See notes for cut lengths." :
      delivery ? "Please quote site delivery." : "",
    tradeCustomer: false
  });
  useEffect(() => {
    if (timber) {
      const t = sessionStorage.getItem("sng.timberNotes");
      if (t) {
        setForm(f => ({ ...f, notes: t }));
        sessionStorage.removeItem("sng.timberNotes");
      }
    }
  }, [timber]);
  const [done, setDone] = useState<{ reference: string } | null>(null);
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const lines = getCart();
    if (!lines.length && !form.notes.trim()) {
      setError("Add products to your invoice list, or describe your material list in notes.");
      return;
    }
    try {
      const created = await api<any>("/api/public/quote-requests", {
        method: "POST",
        body: JSON.stringify({
          customerName: form.customerName,
          companyName: form.companyName,
          phone: form.phone,
          whatsapp: form.whatsapp || form.phone,
          email: form.email,
          preferredContact: form.preferredContact,
          preferredLocationId: null,
          fulfilment: form.fulfilment,
          deliveryAddress: form.deliveryAddress,
          suburb: form.suburb,
          deliveryNotes: form.deliveryNotes,
          projectType: form.projectType,
          notes: form.notes,
          tradeCustomer: form.tradeCustomer,
          lines: lines.map(l => ({ sku: l.sku, quantity: l.qty }))
        })
      });
      setCart([]);
      setDone({ reference: created.reference });
    } catch (err: any) {
      setError(err.message || "Could not submit request");
    }
  }

  if (done) {
    return (
      <div className="wrap page confirm">
        <h1>Request received</h1>
        <p className="ref">Reference: <b>{done.reference}</b></p>
        <p>Thank you. SNG will confirm stock, pricing, collection or delivery before preparing your invoice / quotation.</p>
        <div className="actions">
          <a className="btn gold" href={telHref(CONTACTS[0].phone)}>Call SNG</a>
          <a className="btn ghost" href={waHref(CONTACTS[0].whatsapp, `Hi SNG, request ${done.reference}`)} target="_blank" rel="noreferrer">WhatsApp SNG</a>
          <Link className="btn ghost" to="/shop">Return to products</Link>
        </div>
      </div>
    );
  }

  return (
    <form className="wrap page quote-form" onSubmit={submit}>
      <h1>Request invoice</h1>
      <p>Submit your product list and contact details. SNG staff will confirm pricing and prepare your invoice or quotation. No online payment.</p>
      <div className="quote-layout">
        <div className="quote-lines">
          <h3>Selected products</h3>
          {getCart().length === 0 && <p>List is empty. <Link to="/shop">Add products</Link> or describe materials in notes.</p>}
          {getCart().map(l => <p key={l.sku}>{l.qty} × {l.name} <small>({l.sku})</small></p>)}
          <p><Link to="/invoice-list">Edit quantities</Link></p>
        </div>
        <div className="quote-fields">
          <label>Full name</label>
          <input value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} required />
          <label>Company / business name</label>
          <input value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} />
          <label>Phone number</label>
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
          <label>WhatsApp number</label>
          <input value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} placeholder="Same as phone if blank" />
          <label>Email address</label>
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <label>Preferred SNG location</label>
          <select value={form.preferredContact} onChange={e => setForm({ ...form, preferredContact: e.target.value as typeof form.preferredContact })}>
            {CONTACTS.map(c => <option key={c.name} value={c.name}>{c.name} — {c.display}</option>)}
          </select>
          <label>Fulfilment</label>
          <select value={form.fulfilment} onChange={e => setForm({ ...form, fulfilment: e.target.value })}>
            <option value="COLLECTION">Collection</option>
            <option value="DELIVERY">Delivery</option>
          </select>
          {form.fulfilment === "DELIVERY" && (
            <>
              <label>Delivery address</label>
              <textarea value={form.deliveryAddress} onChange={e => setForm({ ...form, deliveryAddress: e.target.value })} required={form.fulfilment === "DELIVERY"} />
              <label>Area / suburb</label>
              <input value={form.suburb} onChange={e => setForm({ ...form, suburb: e.target.value })} />
              <label>Delivery notes</label>
              <textarea value={form.deliveryNotes} onChange={e => setForm({ ...form, deliveryNotes: e.target.value })} />
            </>
          )}
          <label>Project type</label>
          <select value={form.projectType} onChange={e => setForm({ ...form, projectType: e.target.value })}>
            <option value="">Select…</option>
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Contractor">Contractor</option>
            <option value="Renovation">Renovation</option>
            <option value="Other">Other</option>
          </select>
          <label className="check">
            <input type="checkbox" checked={form.tradeCustomer} onChange={e => setForm({ ...form, tradeCustomer: e.target.checked })} />
            Trade / bulk customer
          </label>
          <label>Additional notes / material list</label>
          <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          {error && <p className="error">{error}</p>}
          <button className="btn gold" type="submit">Request invoice</button>
        </div>
      </div>
    </form>
  );
}

export function AccountPage() {
  const user = currentUser();
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    if (token()) api("/api/account/me").then(setData).catch(() => setData({ error: true }));
  }, []);
  if (!user) {
    return (
      <div className="wrap page">
        <h1>Customer account</h1>
        <p>Trade customers with an SNG account can sign in to view invoices and statements.</p>
        <Link className="btn gold" to="/login">Sign in</Link>
      </div>
    );
  }
  return (
    <div className="wrap page">
      <h1>My account</h1>
      <p>{user.fullName} · {user.email}</p>
      {user.role !== "CUSTOMER" && <p><Link className="btn" to="/app">Open management console</Link></p>}
      {data && !data.error && (
        <>
          <div className="kpis">
            <div className="kpi"><span>Customer</span><b>{data.name}</b></div>
            <div className="kpi"><span>Type</span><b>{data.type}</b></div>
            <div className="kpi"><span>Credit limit</span><b>{money(data.creditLimit)}</b></div>
            <div className="kpi"><span>Outstanding</span><b>{money(data.outstanding)}</b></div>
          </div>
          <h2>My requests</h2>
          <table><thead><tr><th>Ref</th><th>Status</th><th>When</th></tr></thead>
            <tbody>{(data.quotes || []).map((q: any) => <tr key={q.id}><td>{q.reference}</td><td>{q.status}</td><td>{String(q.createdAt || "").replace("T", " ").slice(0, 16)}</td></tr>)}</tbody>
          </table>
        </>
      )}
      <button className="btn ghost" onClick={() => { logout(); window.location.href = "/"; }}>Sign out</button>
    </div>
  );
}

export function Contact() {
  return (
    <div className="wrap page">
      <h1>Contact SNG Hardware</h1>
      <p><b>Head Office</b><br />{SNG.headOffice.address}<br />{SNG.headOffice.suburb}</p>
      <p>Email: <a href={`mailto:${SNG.email}`}>{SNG.email}</a></p>
      <p>Facebook: {SNG.facebook} · Instagram: {SNG.instagram}</p>
      <div className="branch-grid" style={{ marginTop: 24 }}>
        {CONTACTS.map(c => (
          <article className="branch-card" key={c.name}>
            <h3>{c.name}</h3>
            <p className="phone-lg"><a href={telHref(c.phone)}>{c.display}</a></p>
            {c.name === "Damofalls Ruwa" && <p className="muted">{SNG.headOffice.full}</p>}
            <div className="actions">
              <a className="btn" href={telHref(c.phone)}>Call</a>
              <a className="btn ghost" href={waHref(c.whatsapp)} target="_blank" rel="noreferrer">WhatsApp</a>
            </div>
          </article>
        ))}
      </div>
      <div className="actions" style={{ marginTop: 24 }}>
        <Link className="btn gold" to="/invoice">Request invoice</Link>
      </div>
    </div>
  );
}

export function TradePage() {
  return (
    <div className="wrap page">
      <h1>Trade &amp; bulk customers</h1>
      <p className="lede-sm">For contractors, builders, companies, property developers and repeat customers.</p>
      <ul className="benefit-list">
        <li>Bulk pricing</li>
        <li>Invoice requests</li>
        <li>Repeat orders</li>
        <li>Statements</li>
        <li>Delivery support</li>
        <li>Account support</li>
      </ul>
      <div className="actions">
        <Link className="btn gold" to="/invoice">Request trade pricing</Link>
        <a className="btn ghost" href={telHref(CONTACTS[0].phone)}>Call {CONTACTS[0].display}</a>
      </div>
    </div>
  );
}

export function DeliveryPage() {
  return (
    <div className="split-cta page-split">
      <img src={SERVICE_IMGS.delivery} alt="Delivery" />
      <div>
        <h1>Request delivery</h1>
        <p>Cement · Timber · Roofing · Sand · Stone · Bulk building orders</p>
        <p>Add products to your invoice list, choose delivery, and include your site address and preferred date in the notes.</p>
        <Link className="btn gold" to="/invoice?delivery=1">Request delivery</Link>
      </div>
    </div>
  );
}

export function TimberCutPage() {
  const [notes, setNotes] = useState("Original length:\nRequired cuts:\nQuantity:\n");
  const nav = useNavigate();
  return (
    <div className="wrap page">
      <div className="split-cta page-split" style={{ margin: 0 }}>
        <img src={SERVICE_IMGS.cutting} alt="Timber" />
        <div>
          <h1>Timber cut to size</h1>
          <p>Example: 6.0m length cut to 2.4m + 2.4m + offcut.</p>
          <ol className="steps">
            <li>Choose timber from the catalogue (or describe it below)</li>
            <li>Tell us original length and required cuts</li>
            <li>Choose collection or delivery on the invoice form</li>
          </ol>
          <label>Cut requirements</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} style={{ width: "100%", minHeight: 100, marginBottom: 12 }} />
          <div className="actions">
            <Link className="btn" to="/shop/timber">Choose timber</Link>
            <button
              className="btn gold"
              type="button"
              onClick={() => {
                sessionStorage.setItem("sng.timberNotes", notes);
                nav("/invoice?timber=1");
              }}
            >
              Request timber quote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AboutPage() {
  return (
    <div className="wrap page">
      <h1>About SNG Hardware</h1>
      <p>{SNG.brand} — {SNG.tagline}. Building materials for contractors and home builders.</p>
      <p><b>Head Office:</b> {SNG.headOffice.full}</p>
      <Link className="btn" to="/contact">Contact us</Link>
    </div>
  );
}

export function StaffLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [demo, setDemo] = useState(false);
  useEffect(() => {
    api<{ demoOneClick?: boolean }>("/api/public/config").then(d => setDemo(!!d.demoOneClick)).catch(() => {});
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await api<{ token: string; user: any }>("/api/auth/login", {
        method: "POST", body: JSON.stringify({ email, password })
      });
      setSession(res.token, res.user);
      nav(res.user.role === "CUSTOMER" ? "/invoice" : homeFor(res.user.role));
    } catch (err: any) { setError(err.message); }
  }

  async function demoEnter(role: string) {
    setError("");
    try {
      const res = await api<{ token: string; user: any }>("/api/auth/demo", {
        method: "POST", body: JSON.stringify({ role })
      });
      setSession(res.token, res.user);
      nav(res.user.role === "CUSTOMER" ? "/invoice" : homeFor(res.user.role));
    } catch (err: any) { setError(err.message); }
  }

  const roles = [
    ["STORE_OPERATOR", "Store Operator"],
    ["BRANCH_MANAGER", "Branch Manager"],
    ["OPERATIONS_MANAGER", "Operations Manager"],
    ["DIRECTOR", "Director"],
    ["FINANCE", "Finance"],
    ["DRIVER", "Driver"],
  ];

  return (
    <div className="staff-login">
      <div className="staff-login-card">
        <img src="/img/logo.png" alt="SNG Hardware" className="staff-logo" />
        <h1>Staff sign in</h1>
        <p>Internal SNG management access only.</p>
        <form onSubmit={submit}>
          <label>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" />
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
          {error && <p className="error">{error}</p>}
          <button className="btn" type="submit">Sign in</button>
        </form>
        {demo && (
          <div className="role-shortcuts">
            <p>Quick access</p>
            {roles.map(([role, label]) => (
              <button key={role} className="btn ghost" type="button" onClick={() => demoEnter(role)}>{label}</button>
            ))}
          </div>
        )}
        <p className="muted"><Link to="/">Back to website</Link></p>
      </div>
    </div>
  );
}

export function homeFor(role: string) {
  switch (role) {
    case "CASHIER":
    case "STORE_OPERATOR":
    case "BRANCH_MANAGER":
    case "DIRECTOR":
    case "OPERATIONS_MANAGER":
      return "/app";
    case "WAREHOUSE_OPERATOR": return "/app/warehouse";
    case "WAREHOUSE_MANAGER": return "/app/inventory";
    case "DRIVER": return "/app/trips";
    case "FINANCE_CONTROLLER": return "/app/accounting";
    case "AUDITOR": return "/app/audit";
    default: return "/app";
  }
}
