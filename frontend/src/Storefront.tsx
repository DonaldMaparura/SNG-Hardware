/**
 * Public customer storefront for SNG Hardware / Builders One Stop (Zimbabwe).
 * Uses verified public contacts only — do not invent branch cities.
 */
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import React, { FormEvent, useEffect, useState } from "react";
import {
  addCartLine, api, CartLine, cartQty, currentUser, getCart, getViewed,
  logout, pushViewed, setCart, setSession, token
} from "./api";
import {
  CAT_IMG, CAT_STORY, CORE_CAT_ORDER, FEATURED_SKUS, HERO_IMGS, SERVICE_IMGS,
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

function MerchImg({ product, alt, className }: { product?: Partial<Product>; alt: string; className?: string }) {
  const [src, setSrc] = useState(merchSrc(product || {}));
  useEffect(() => { setSrc(merchSrc(product || {})); }, [product?.sku, product?.imageUrl, product?.categorySlug]);
  return (
    <img
      className={className}
      src={src}
      alt={alt}
      onError={() => setSrc(merchFallback(product || {}))}
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
  toast(`${p.name} added to quote`);
}

function MobileActionBar() {
  const primary = SNG.contacts[0];
  return (
    <div className="mobile-actions" aria-label="Quick contact">
      <a href={telHref(primary.phone)}>Call</a>
      <a href={waHref(primary.whatsapp, "Hello SNG Hardware, I need building materials.")} target="_blank" rel="noreferrer">WhatsApp</a>
      <Link to="/quote">Quote</Link>
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
  const [cats, setCats] = useState<{ slug: string; name: string }[]>([]);
  const user = currentUser();
  useTick("sng-cart");
  const primary = SNG.contacts[0];

  useEffect(() => {
    api<any[]>("/api/public/categories").then(list => setCats((list || []).filter((c: any) => !c.parentSlug))).catch(() => {});
  }, []);

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
            <span className="hide-sm">{SNG.headOffice.full}</span>
            <a href={telHref(primary.phone)}>Call {primary.display}</a>
            <a className="hide-sm" href={`mailto:${SNG.email}`}>{SNG.email}</a>
          </span>
          <span className="hdr-top-actions">
            <a className="hide-sm" href={waHref(primary.whatsapp, "Hello SNG Hardware")} target="_blank" rel="noreferrer">WhatsApp</a>
            <Link to="/login" className="demo-link">Management Demo</Link>
          </span>
        </div>
      </div>
      <div className="wrap hdr-main">
        <Link to="/" className="logo">
          <img src="/img/logo.png" alt="SNG Hardware — Builders One Stop" className="logo-img" />
        </Link>
        <form className="search" onSubmit={goSearch}>
          <input placeholder="Search cement, timber, tools, SKU..." value={q} onChange={e => setQ(e.target.value)} />
          <button type="submit">Search</button>
          {q.trim().length >= 2 && (
            <div className="suggest">
              {hits.map(p => (
                <Link key={p.sku} to={"/product/" + p.sku} onClick={() => setQ("")}>
                  <MerchImg product={p} alt="" />
                  <span><b>{p.name}</b><small>{p.sku} · {p.brand}</small></span>
                </Link>
              ))}
              {cats.filter(c => c.name.toLowerCase().includes(q.toLowerCase())).slice(0, 2).map(c => (
                <Link key={c.slug} to={"/shop/" + c.slug} onClick={() => setQ("")}>{c.name}</Link>
              ))}
              {hits.length === 0 && (
                <div className="suggest-empty">
                  Can’t find what you need?
                  <Link to="/quote">Request a quote</Link>
                </div>
              )}
            </div>
          )}
        </form>
        <div className="hdr-utils">
          <a className="util util-call" href={telHref(primary.phone)}>Call</a>
          <Link to="/cart" className="util">Quote <b>{cartQty()}</b></Link>
          {user
            ? <Link to={user.role === "CUSTOMER" ? "/account" : "/app"} className="util">{user.fullName.split(" ")[0]}</Link>
            : <Link to="/account" className="util">Account</Link>}
          <button className="menu-btn" type="button" onClick={() => setOpen(!open)} aria-label="Menu">Menu</button>
        </div>
      </div>
      <div className={"hdr-nav-row" + (open ? " open" : "")}>
        <div className="wrap hdr-nav-inner">
          <nav className="nav">
            <Link to="/shop">Products</Link>
            <Link to="/shop/cement-concrete">Cement</Link>
            <Link to="/shop/timber">Timber</Link>
            <Link to="/shop/roofing">Roofing</Link>
            <Link to="/shop/plumbing">Plumbing</Link>
            <Link to="/shop/electrical">Electrical</Link>
            <Link to="/shop/tools">Tools</Link>
            <Link to="/specials">Specials</Link>
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
          <p>
            <a href={`mailto:${SNG.email}`}>{SNG.email}</a>
          </p>
        </div>
        <div>
          <h4>Contacts</h4>
          {SNG.contacts.map(c => (
            <p key={c.name}>
              <b>{c.name}</b><br />
              <a href={telHref(c.phone)}>{c.display}</a>
            </p>
          ))}
        </div>
        <div>
          <h4>Products</h4>
          <Link to="/shop">All products</Link>
          <Link to="/shop/cement-concrete">Cement</Link>
          <Link to="/shop/timber">Timber</Link>
          <Link to="/shop/roofing">Roofing</Link>
          <Link to="/specials">Specials</Link>
          <Link to="/quote">Request quote</Link>
          <Link to="/timber-cut">Timber cutting</Link>
          <Link to="/delivery">Delivery</Link>
          <Link to="/trade">Trade</Link>
        </div>
        <div>
          <h4>Social</h4>
          <p>Facebook — {SNG.facebook}</p>
          <p>Instagram — {SNG.instagram}</p>
          <Link to="/login" className="demo-link">Management Demo</Link>
        </div>
      </div>
      <div className="wrap footer-bottom">
        <span>{SNG.brand} · {SNG.tagline}</span>
        <span>Demo catalogue powered by SNG ONE</span>
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
  const [viewed, setViewed] = useState<Product[]>([]);
  const [slide, setSlide] = useState(0);
  useTick("sng-cart");
  useEffect(() => { api("/api/public/home").then(setData); }, []);
  useEffect(() => {
    const skus = getViewed();
    if (!skus.length) return;
    Promise.all(skus.slice(0, 4).map(s => api<Product>("/api/public/products/" + s).catch(() => null)))
      .then(list => setViewed(list.filter(Boolean) as Product[]));
  }, []);
  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % 3), 8000);
    return () => clearInterval(t);
  }, []);
  if (!data) return <div className="wrap loading-panel">Loading SNG Hardware…</div>;

  const primary = SNG.contacts[0];
  const slides = [
    {
      img: HERO_IMGS.yard,
      kicker: "SNG HARDWARE · BUILDERS ONE STOP",
      title: "EVERYTHING YOU NEED TO BUILD.",
      copy: "Cement, timber, roofing, plumbing, electrical, tools and building materials — all in one place."
    },
    {
      img: HERO_IMGS.timber,
      kicker: "TIMBER DIVISION",
      title: "TIMBER FOR THE JOB.",
      copy: "Choose your sizes, request cut-to-length and arrange collection or delivery."
    },
    {
      img: HERO_IMGS.delivery,
      kicker: "DELIVERY",
      title: "MATERIALS DELIVERED TO YOUR SITE.",
      copy: "Bulk building materials and complete orders delivered where you need them."
    }
  ];
  const hero = slides[slide];
  const cats = sortCategories(data.categories || []);

  return (
    <>
      <section className="hero" style={{ backgroundImage: `linear-gradient(100deg, rgba(20,40,22,.92) 0%, rgba(20,40,22,.55) 50%, rgba(20,40,22,.25) 100%), url(${hero.img})` }}>
        <div className="wrap hero-inner">
          <p className="kicker">{hero.kicker}</p>
          <h1>{hero.title}</h1>
          <p className="lede">{hero.copy}</p>
          <div className="actions">
            <Link className="btn gold" to="/shop">Shop products</Link>
            <Link className="btn ghost" to="/quote">Get a quote</Link>
            <a className="btn ghost" href={telHref(primary.phone)}>Call</a>
            <a className="btn ghost" href={waHref(primary.whatsapp, "Hello SNG Hardware")} target="_blank" rel="noreferrer">WhatsApp</a>
          </div>
          <div className="hero-dots">
            {slides.map((_, i) => <button key={i} type="button" className={i === slide ? "on" : ""} onClick={() => setSlide(i)} aria-label={"Slide " + (i + 1)} />)}
          </div>
        </div>
      </section>

      <section className="trust">
        <div className="wrap trust-grid">
          <div><b>Building materials</b><span>Under one roof</span></div>
          <div><b>Trade orders</b><span>Contractor support</span></div>
          <div><b>Delivery</b><span>To your site</span></div>
          <div><b>Timber cutting</b><span>Cut to requirement</span></div>
        </div>
      </section>

      <section className="wrap section">
        <div className="section-head">
          <h2>Building materials</h2>
          <Link to="/categories">All categories</Link>
        </div>
        <div className="cat-grid">
          {cats.map((c: any) => {
            const story = CAT_STORY[c.slug] || { kicker: c.description || "", points: [] as string[], cta: "View" };
            return (
              <Link key={c.slug} className="cat-card" to={"/shop/" + c.slug}>
                <img src={CAT_IMG[c.slug] || merchSrc({ categorySlug: c.slug })} alt={c.name} onError={e => { e.currentTarget.src = "/img/placeholder.svg"; }} />
                <div className="cat-card-body">
                  <small>{story.kicker}</small>
                  <h3>{c.name}</h3>
                  {story.points.length > 0 && <p>{story.points.join(" · ")}</p>}
                  <span className="cat-cta">{story.cta}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="band-sand">
        <div className="wrap section">
          <div className="section-head">
            <h2>Current deals</h2>
            <Link to="/specials">View specials</Link>
          </div>
          <ProductGrid items={(data.specials || []).slice(0, 6)} />
        </div>
      </section>

      <section className="wrap section">
        <div className="section-head">
          <h2>Popular products</h2>
          <Link to="/shop">Browse all</Link>
        </div>
        <ProductGrid items={pickFeatured(data.featured, data.bestsellers)} />
      </section>

      {viewed.length > 0 && (
        <section className="wrap section">
          <h2>Recently viewed</h2>
          <ProductGrid items={viewed} />
        </section>
      )}

      <section className="split-cta">
        <img src={SERVICE_IMGS.house} alt="Building project materials" />
        <div>
          <p className="kicker">Material list</p>
          <h2>Building a house?</h2>
          <p>Send us your material list and we’ll prepare a quotation — cement, timber, roofing, plumbing, electrical and finishing.</p>
          <div className="project-tiles">
            {[
              { name: "Foundation", to: "/shop/cement-concrete" },
              { name: "Brickwork", to: "/shop/bricks-blocks" },
              { name: "Roofing", to: "/shop/roofing" },
              { name: "Plumbing", to: "/shop/plumbing" },
              { name: "Electrical", to: "/shop/electrical" },
              { name: "Finishing", to: "/shop/paint" }
            ].map(x => (
              <Link key={x.name} to={x.to} className="project-chip">{x.name}</Link>
            ))}
          </div>
          <Link className="btn gold" to="/quote?project=house">Request material quote</Link>
        </div>
      </section>

      <section className="split-cta reverse">
        <img src={SERVICE_IMGS.cutting} alt="Timber lengths" />
        <div>
          <p className="kicker">Timber</p>
          <h2>Need timber cut to size?</h2>
          <ol className="steps">
            <li>Choose your timber</li>
            <li>Tell us the required lengths</li>
            <li>We prepare the cut list</li>
            <li>Collect or arrange delivery</li>
          </ol>
          <Link className="btn gold" to="/timber-cut">Request timber cut</Link>
        </div>
      </section>

      <section className="split-cta">
        <img src={SERVICE_IMGS.delivery} alt="Materials for delivery" />
        <div>
          <p className="kicker">Delivery</p>
          <h2>We deliver to your site</h2>
          <p>Bulk cement, timber, roofing, sand and aggregates, and full building orders delivered where you need them.</p>
          <Link className="btn gold" to="/delivery">Request delivery quote</Link>
        </div>
      </section>

      <section className="trade-band">
        <div className="wrap">
          <p className="kicker">Contractors</p>
          <h2>Trade &amp; bulk orders</h2>
          <p>Built for contractors, builders and businesses who buy regularly.</p>
          <ul className="benefit-list">
            <li>Trade pricing</li>
            <li>Bulk quotations</li>
            <li>Repeat orders</li>
            <li>Account support</li>
          </ul>
          <div className="actions">
            <Link className="btn gold" to="/trade">Open a trade account</Link>
            <Link className="btn ghost" to="/login">Trade login</Link>
          </div>
        </div>
      </section>

      <section className="wrap section">
        <div className="section-head">
          <h2>Call / WhatsApp SNG</h2>
          <Link to="/contact">All contacts</Link>
        </div>
        <p className="lede-sm"><b>Head Office:</b> {SNG.headOffice.full}</p>
        <div className="branch-grid">
          {SNG.contacts.map(c => (
            <article className="branch-card" key={c.name}>
              <h3>{c.name}</h3>
              <p className="phone-lg"><a href={telHref(c.phone)}>{c.display}</a></p>
              <p className="muted">Contact for directions and stock.</p>
              <div className="actions">
                <a className="btn" href={telHref(c.phone)}>Call</a>
                <a className="btn ghost" href={waHref(c.whatsapp, `Hello SNG — ${c.name}`)} target="_blank" rel="noreferrer">WhatsApp</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="final-cta">
        <div className="wrap">
          <h2>Need a price on a material list?</h2>
          <p>Add products to your quote cart, or call / WhatsApp us directly. No online payment required.</p>
          <div className="actions" style={{ justifyContent: "center" }}>
            <Link className="btn gold" to="/quote">Request a quote</Link>
            <a className="btn ghost" href={telHref(primary.phone)}>Call {primary.display}</a>
          </div>
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
  const nav = useNavigate();
  const status = p.inStock ? "IN_STOCK" : "OUT_OF_STOCK";
  const save = p.promotionPrice && p.retailPrice ? Number(p.retailPrice) - Number(p.promotionPrice) : 0;
  const bulk = isBulkCategory(p.categorySlug, p.sku);
  return (
    <article className="prod-card">
      <Link to={"/product/" + p.sku} className="prod-media">
        {p.promotionPrice && <span className="promo-flag">SPECIAL</span>}
        <MerchImg product={p} alt={p.name} />
      </Link>
      <div className="prod-body">
        <span className={"badge " + stockClass(status)}>{stockLabel(status, p.inStock)}</span>
        <small className="brand-line">{p.brand}</small>
        <Link to={"/product/" + p.sku}><h3>{p.name}</h3></Link>
        <p className="meta">SKU {p.sku} · {unitLabel(p.unitOfMeasure)}</p>
        <div className="price-row">
          {p.promotionPrice ? (
            <>
              <span className="was">{money(p.retailPrice)}</span>
              <span className="price">{money(p.price)}</span>
              {save > 0 && <span className="save">SAVE {money(save)}</span>}
            </>
          ) : <span className="price">{money(p.price)} <small>/ {unitLabel(p.unitOfMeasure)}</small></span>}
        </div>
        <div className="card-actions">
          <button className="btn" type="button" onClick={() => { addProduct(p); if (bulk) nav("/quote"); }}>
            {bulk ? "Request bulk quote" : "Add to quote"}
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
      {story && <p className="lede-sm">{story.points.join(" · ")}</p>}
      {q && <p>Results for “{q}”</p>}
      {items === null && <p>Loading products…</p>}
      {items && items.length > 0 && <ProductGrid items={items} />}
      {items && items.length === 0 && (
        <div className="empty-panel">
          <h2>Can’t find what you need?</h2>
          <p>Call, WhatsApp or request a quote — we’ll price custom lengths and bulk lists.</p>
          <Link className="btn gold" to="/quote">Request a quote</Link>
        </div>
      )}
    </div>
  );
}

export function CategoriesPage() {
  const [cats, setCats] = useState<any[]>([]);
  useEffect(() => { api("/api/public/home").then((d: any) => setCats(sortCategories(d.categories || []))); }, []);
  return (
    <div className="wrap page">
      <h1>Categories</h1>
      <div className="cat-grid">
        {cats.map((c: any) => (
          <Link key={c.slug} className="cat-card" to={"/shop/" + c.slug}>
            <img src={CAT_IMG[c.slug] || "/img/placeholder.svg"} alt={c.name} />
            <div className="cat-card-body">
              <h3>{c.name}</h3>
              <p>{c.description}</p>
              <span className="cat-cta">View {c.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function ProductPage() {
  const { sku } = useParams();
  const nav = useNavigate();
  const [p, setP] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const primary = SNG.contacts[0];
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
        <div>
          <div className="pdp-hero">
            <MerchImg product={p} alt={p.name} />
          </div>
        </div>
        <div>
          <span className={"badge " + stockClass(p.inStock ? "IN_STOCK" : "OUT_OF_STOCK")}>
            {stockLabel(p.inStock ? "IN_STOCK" : "OUT_OF_STOCK", p.inStock)}
          </span>
          <p className="brand-line">{p.brand}</p>
          <h1>{p.name}</h1>
          <p className="meta">SKU {p.sku} · {unitLabel(p.unitOfMeasure)}</p>
          <div className="price-row lg">
            {p.promotionPrice && <span className="was">{money(p.retailPrice)}</span>}
            <span className="price">{money(p.price)} <small>/ {unitLabel(p.unitOfMeasure)}</small></span>
          </div>
          {currentUser()?.role === "CUSTOMER" && p.tradePrice
            ? <p className="trade-price">Your trade price {money(p.tradePrice)}</p>
            : <p className="muted">Trade pricing available on a trade account — call us to discuss.</p>}
          <p>{p.description}</p>
          <h3>Specifications</h3>
          <p>{p.specification}</p>
          <p><b>Collection or delivery</b> — call your nearest SNG contact, or add to a quote.</p>
          <div className="pdp-actions">
            <input type="number" min={1} value={qty} onChange={e => setQty(Math.max(1, Number(e.target.value)))} />
            <button className="btn" onClick={() => addProduct(p, qty)}>{bulk ? "Add to bulk quote" : "Add to quote"}</button>
            <button className="btn gold" onClick={() => { addProduct(p, qty); nav("/quote"); }}>Request quote</button>
          </div>
          <div className="actions" style={{ marginTop: 12 }}>
            <a className="btn ghost" href={telHref(primary.phone)}>Call {primary.display}</a>
            <a className="btn ghost" href={waHref(primary.whatsapp, `Hi SNG, I need a price on ${p.name} (${p.sku})`)} target="_blank" rel="noreferrer">WhatsApp</a>
          </div>
        </div>
      </div>
      {p.related && p.related.length > 0 && <><h2>Related products</h2><ProductGrid items={p.related} /></>}
    </div>
  );
}

export function Branches() {
  return (
    <div className="wrap page">
      <h1>Contacts &amp; locations</h1>
      <p className="lede-sm"><b>Head Office:</b> {SNG.headOffice.full}</p>
      <p className="lede-sm">Call or WhatsApp the contact nearest to you. Ask for directions and current stock.</p>
      <div className="branch-grid">
        {SNG.contacts.map(c => (
          <article className="branch-card" key={c.name} id={c.name.replace(/\s+/g, "-").toLowerCase()}>
            <h3>{c.name}</h3>
            <p className="phone-lg"><a href={telHref(c.phone)}>{c.display}</a></p>
            <div className="actions">
              <a className="btn" href={telHref(c.phone)}>Call</a>
              <a className="btn ghost" href={waHref(c.whatsapp, `Hello SNG — ${c.name}`)} target="_blank" rel="noreferrer">WhatsApp</a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function CartPage() {
  const [lines, setLines] = useState(getCart());
  function update(next: CartLine[]) { setCart(next); setLines(next); }
  const total = lines.reduce((s, l) => s + l.qty * l.price, 0);
  return (
    <div className="wrap page">
      <h1>Quote cart</h1>
      <p>No online payment — submit this list as a quotation. Staff will confirm price, stock and delivery.</p>
      {lines.length === 0 && <p>Your quote cart is empty. <Link to="/shop">Browse products</Link></p>}
      {lines.map(l => (
        <div className="cart-line" key={l.sku}>
          <img src={l.imageUrl || merchSrc({ sku: l.sku })} alt="" onError={e => { e.currentTarget.src = "/img/placeholder.svg"; }} />
          <div>
            <b>{l.name}</b>
            <small>{l.sku}</small>
          </div>
          <input type="number" min={1} value={l.qty} onChange={e => update(lines.map(x => x.sku === l.sku ? { ...x, qty: Number(e.target.value) } : x))} />
          <span>{money(l.price * l.qty)}</span>
          <button className="btn ghost" onClick={() => update(lines.filter(x => x.sku !== l.sku))}>Remove</button>
        </div>
      ))}
      {lines.length > 0 && <p className="price">Indicative total {money(total)}</p>}
      <Link className="btn gold" to="/quote">Request quote</Link>
    </div>
  );
}

export function QuotePage() {
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    customerName: "", phone: "", email: "",
    fulfilment: "COLLECTION", deliveryAddress: "",
    notes: params.get("project") === "house" ? "House build — please quote a complete material list." :
      params.get("timber") ? "Timber cut-to-size required." :
      params.get("delivery") ? "Please quote site delivery." : "",
    tradeCustomer: false
  });
  const [contactId, setContactId] = useState<string>(SNG.contacts[0].name);
  const [done, setDone] = useState<{ reference: string } | null>(null);
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const lines = getCart();
    if (!lines.length) { setError("Add products to the quote cart first."); return; }
    try {
      const created = await api<any>("/api/public/quote-requests", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          notes: `${form.notes || ""}\nPreferred contact: ${contactId}`.trim(),
          preferredLocationId: null,
          lines: lines.map(l => ({ sku: l.sku, quantity: l.qty }))
        })
      });
      setCart([]);
      setDone({ reference: created.reference });
    } catch (err: any) {
      setError(err.message || "Could not submit quote");
    }
  }

  if (done) {
    return (
      <div className="wrap page confirm">
        <p className="kicker">Thank you</p>
        <h1>Quote request received</h1>
        <p className="ref">Reference: <b>{done.reference}</b></p>
        <p>An SNG representative will contact you to confirm stock, cutting and delivery.</p>
        <div className="actions">
          <Link className="btn gold" to="/shop">Continue shopping</Link>
          <a className="btn ghost" href={telHref(SNG.contacts[0].phone)}>Call SNG</a>
        </div>
      </div>
    );
  }

  return (
    <form className="wrap page quote-form" onSubmit={submit}>
      <h1>Request a quote</h1>
      <p>Preferred contact, collection or delivery, and your details. No card payment online.</p>
      <div className="quote-layout">
        <div className="quote-lines">
          <h3>Quote cart</h3>
          {getCart().length === 0 && <p>Cart is empty. <Link to="/shop">Add products</Link></p>}
          {getCart().map(l => <p key={l.sku}>{l.qty} × {l.name}</p>)}
        </div>
        <div className="quote-fields">
          <label>Preferred contact</label>
          <select value={contactId} onChange={e => setContactId(e.target.value)}>
            {SNG.contacts.map(c => <option key={c.name} value={c.name}>{c.name} — {c.display}</option>)}
          </select>
          <label>Collection / Delivery</label>
          <select value={form.fulfilment} onChange={e => setForm({ ...form, fulfilment: e.target.value })}>
            <option value="COLLECTION">Collection</option>
            <option value="DELIVERY">Delivery</option>
          </select>
          <label>Delivery address</label>
          <textarea value={form.deliveryAddress} onChange={e => setForm({ ...form, deliveryAddress: e.target.value })} placeholder="If delivery required" />
          <label>Customer name</label>
          <input value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} required />
          <label>Phone</label>
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
          <label>Email</label>
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <label className="check"><input type="checkbox" checked={form.tradeCustomer} onChange={e => setForm({ ...form, tradeCustomer: e.target.checked })} /> Trade customer?</label>
          <label>Notes</label>
          <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          {error && <p className="error">{error}</p>}
          <button className="btn gold" type="submit">Submit quote request</button>
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
        <p>Trade customers can sign in to view quotes and account details.</p>
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
          <h2>My quotes</h2>
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
        {SNG.contacts.map(c => (
          <article className="branch-card" key={c.name}>
            <h3>{c.name}</h3>
            <p className="phone-lg"><a href={telHref(c.phone)}>{c.display}</a></p>
            <div className="actions">
              <a className="btn" href={telHref(c.phone)}>Call</a>
              <a className="btn ghost" href={waHref(c.whatsapp)} target="_blank" rel="noreferrer">WhatsApp</a>
            </div>
          </article>
        ))}
      </div>
      <div className="actions" style={{ marginTop: 24 }}>
        <Link className="btn gold" to="/quote">Request a quote</Link>
      </div>
    </div>
  );
}

export function TradePage() {
  return (
    <div className="wrap page">
      <p className="kicker">Contractors &amp; businesses</p>
      <h1>Trade account</h1>
      <p className="lede-sm">For contractors and builders who buy regularly from SNG Hardware.</p>
      <ul className="benefit-list">
        <li>Trade pricing</li>
        <li>Bulk quotations</li>
        <li>Faster repeat ordering</li>
        <li>Account support</li>
      </ul>
      <div className="actions">
        <Link className="btn gold" to="/quote">Request trade setup</Link>
        <Link className="btn ghost" to="/login">Trade login</Link>
        <a className="btn ghost" href={telHref(SNG.contacts[0].phone)}>Call {SNG.contacts[0].display}</a>
      </div>
    </div>
  );
}

export function DeliveryPage() {
  return (
    <div className="split-cta page-split">
      <img src={SERVICE_IMGS.delivery} alt="" />
      <div>
        <p className="kicker">Delivery</p>
        <h1>We deliver to your site</h1>
        <p>Bulk cement, timber, roofing, sand &amp; aggregates, and full building orders.</p>
        <Link className="btn gold" to="/quote?delivery=1">Request delivery quote</Link>
      </div>
    </div>
  );
}

export function TimberCutPage() {
  return (
    <div className="split-cta page-split">
      <img src={SERVICE_IMGS.cutting} alt="" />
      <div>
        <p className="kicker">Cut-to-size</p>
        <h1>Timber cut to size</h1>
        <ol className="steps">
          <li>Choose your timber</li>
          <li>Tell us the required lengths</li>
          <li>We prepare the cut list</li>
          <li>Collect or arrange delivery</li>
        </ol>
        <Link className="btn gold" to="/shop/timber">Choose timber</Link>
        <Link className="btn ghost" to="/quote?timber=1">Request timber cut</Link>
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
  const [email, setEmail] = useState("gm@sng.one");
  const [password, setPassword] = useState("SngOne2026!");
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
      nav(res.user.role === "CUSTOMER" ? "/account" : homeFor(res.user.role));
    } catch (err: any) { setError(err.message); }
  }

  async function demoEnter(role: string) {
    setError("");
    try {
      const res = await api<{ token: string; user: any }>("/api/auth/demo", {
        method: "POST", body: JSON.stringify({ role })
      });
      setSession(res.token, res.user);
      nav(res.user.role === "CUSTOMER" ? "/account" : homeFor(res.user.role));
    } catch (err: any) { setError(err.message); }
  }

  const roles = [
    ["GENERAL_MANAGER", "Enter as General Manager"],
    ["BRANCH_MANAGER", "Enter as Branch Manager"],
    ["WAREHOUSE_MANAGER", "Enter as Warehouse Manager"],
    ["CASHIER", "Enter as Cashier"],
    ["DRIVER", "Enter as Driver"],
    ["FINANCE", "Enter as Finance"],
    ["AUDITOR", "Enter as Auditor"]
  ];

  return (
    <div className="staff-login">
      <div className="staff-login-card">
        <img src="/img/logo.png" alt="SNG Hardware" className="staff-logo" />
        <h1>Management login</h1>
        <p>Staff sign in separately from the customer store.</p>
        <form onSubmit={submit}>
          <label>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} />
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
          {error && <p className="error">{error}</p>}
          <button className="btn" type="submit">Sign in</button>
        </form>
        {demo && (
          <div className="demo-roles">
            <p>Presentation shortcuts</p>
            {roles.map(([role, label]) => (
              <button key={role} className="btn ghost" type="button" onClick={() => demoEnter(role)}>{label}</button>
            ))}
          </div>
        )}
        <p className="muted"><Link to="/">Back to store</Link></p>
      </div>
    </div>
  );
}

export function homeFor(role: string) {
  switch (role) {
    case "CASHIER": return "/app/pos";
    case "WAREHOUSE_OPERATOR": return "/app/warehouse";
    case "WAREHOUSE_MANAGER": return "/app/inventory";
    case "DRIVER": return "/app/trips";
    case "FINANCE_CONTROLLER": return "/app/accounting";
    case "AUDITOR": return "/app/audit";
    case "BRANCH_MANAGER": return "/app/branch";
    default: return "/app";
  }
}
