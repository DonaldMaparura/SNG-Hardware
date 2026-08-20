import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import React, { FormEvent, useEffect, useState } from "react";
import {
  addCartLine, api, CartLine, cartQty, currentUser, getBranch, getCart, getViewed,
  logout, pushViewed, setBranch, setCart, setSession, token
} from "./api";
import { CAT_IMG, CAT_STORY, FEATURED_SKUS, merchSrc, stockClass, stockLabel, unitLabel } from "./merch";

export type Product = {
  id: number; sku: string; name: string; brand: string; unitOfMeasure: string;
  price: number; retailPrice: number; promotionPrice?: number; imageUrl: string;
  inStock: boolean; inStockBranches?: number; category?: string; categorySlug?: string;
  description?: string; specification?: string; tradePrice?: number;
  availability?: { locationId?: number; locationName: string; city: string; status: string }[];
  related?: Product[];
};

export function money(n?: number) {
  return `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function MerchImg({ product, alt, className }: { product?: Partial<Product>; alt: string; className?: string }) {
  const [src, setSrc] = useState(merchSrc(product || {}));
  useEffect(() => { setSrc(merchSrc(product || {})); }, [product?.sku, product?.imageUrl, product?.categorySlug]);
  return <img className={className} src={src} alt={alt} onError={() => setSrc("/img/tools.jpg")} />;
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

function branchStock(p: Product) {
  const b = getBranch();
  if (!b || !p.availability) return null;
  return p.availability.find(a => a.locationId === b.id || a.locationName === b.name) || null;
}

function addProduct(p: Product, qty = 1) {
  addCartLine({ sku: p.sku, name: p.name, qty, price: p.price, imageUrl: merchSrc(p) });
  toast(`${p.name} added to quote cart`);
}

export function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="store">
      <StoreHeader />
      <ToastHost />
      {children}
      <StoreFooter />
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
  const [branches, setBranches] = useState<any[]>([]);
  const user = currentUser();
  useTick("sng-cart");
  const branch = getBranch();

  useEffect(() => {
    api<any[]>("/api/public/branches").then(setBranches).catch(() => {});
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
          <span>Builder One Stop · Harare · Bulawayo · Gweru · Mutare · Masvingo</span>
          <span className="hdr-top-actions">
            {branch ? <span>My branch: {branch.name}</span> : <Link to="/branches">Select your branch</Link>}
            <Link to="/login" className="demo-link">Management Demo</Link>
          </span>
        </div>
      </div>
      <div className="wrap hdr-main">
        <Link to="/" className="logo">
          <span className="logo-mark">SNG</span>
          <span className="brand">SNG ONE<small>BUILDER ONE STOP</small></span>
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
                <Link key={c.slug} to={"/shop/" + c.slug} onClick={() => setQ("")}>{c.name} category</Link>
              ))}
              {hits.length === 0 && (
                <div className="suggest-empty">
                  Can’t find what you need?
                  <Link to="/quote">Request a custom quote</Link>
                </div>
              )}
            </div>
          )}
        </form>
        <div className="hdr-utils">
          <Link to="/cart" className="util">Quote cart <b>{cartQty()}</b></Link>
          {user
            ? <Link to={user.role === "CUSTOMER" ? "/account" : "/app"} className="util">{user.fullName.split(" ")[0]}</Link>
            : <Link to="/account" className="util">Account</Link>}
          <button className="menu-btn" type="button" onClick={() => setOpen(!open)} aria-label="Menu">Menu</button>
        </div>
      </div>
      <div className={"hdr-nav-row" + (open ? " open" : "")}>
        <div className="wrap hdr-nav-inner">
        <nav className="nav">
          <Link to="/shop">Shop</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/specials">Specials</Link>
          <Link to="/trade">Trade Customers</Link>
          <Link to="/branches">Branches</Link>
          <Link to="/quote">Request Quote</Link>
          <Link to="/contact">Contact</Link>
        </nav>
        <div className="hdr-branch">
          <label>My branch</label>
          <select value={branch?.id || ""} onChange={e => {
            const b = branches.find(x => String(x.id) === e.target.value);
            setBranch(b ? { id: b.id, name: b.name } : null);
            window.dispatchEvent(new Event("sng-cart"));
          }}>
            <option value="">All branches</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
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
          <h4>Shop</h4>
          <Link to="/shop">Products</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/specials">Specials</Link>
          <Link to="/shop/timber">Timber</Link>
          <Link to="/shop/cement-concrete">Cement</Link>
          <Link to="/shop/tools">Tools</Link>
        </div>
        <div>
          <h4>Services</h4>
          <Link to="/quote">Request Quote</Link>
          <Link to="/trade">Trade Accounts</Link>
          <Link to="/delivery">Delivery</Link>
          <Link to="/timber-cut">Timber Cutting</Link>
        </div>
        <div>
          <h4>Company</h4>
          <Link to="/about">About</Link>
          <Link to="/branches">Branches</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div>
          <h4>Account</h4>
          <Link to="/login">Sign In</Link>
          <Link to="/account">Orders</Link>
          <Link to="/quote">Quotes</Link>
        </div>
      </div>
      <div className="wrap footer-bottom">
        <div className="brand">SNG ONE<small>BUILDER ONE STOP</small></div>
        <p>Demo platform powered by SNG ONE</p>
      </div>
    </footer>
  );
}

function BranchMiniStock({ name, highlights }: { name: string; highlights: Record<string, string> }) {
  function label(status?: string) {
    if (status === "LOW_STOCK") return "Low stock";
    if (status === "OUT_OF_STOCK") return "Contact branch";
    return "In stock";
  }
  return (
    <ul className="mini-stock">
      <li>Cement <b>{label(highlights[name + "|CEM-PPC-50"])}</b></li>
      <li>Timber <b>{label(highlights[name + "|TIM-PINE-38-114-6000"])}</b></li>
      <li>Paint <b>{label(highlights[name + "|PNT-WHT-20"])}</b></li>
    </ul>
  );
}

function useBranchHighlights() {
  const [highlights, setHighlights] = useState<Record<string, string>>({});
  useEffect(() => {
    Promise.all(["CEM-PPC-50", "TIM-PINE-38-114-6000", "PNT-WHT-20"].map(s => api<Product>("/api/public/products/" + s).catch(() => null)))
      .then(prods => {
        const map: Record<string, string> = {};
        (prods.filter(Boolean) as Product[]).forEach(p => {
          p.availability?.forEach(a => { map[a.locationName + "|" + p.sku] = a.status; });
        });
        setHighlights(map);
      });
  }, []);
  return highlights;
}

function pickFeatured(featured: Product[] = [], bestsellers: Product[] = []) {
  const all = [...featured, ...bestsellers].filter((p, i, arr) => arr.findIndex(x => x.sku === p.sku) === i);
  const preferred = FEATURED_SKUS.map(sku => all.find(p => p.sku === sku)).filter(Boolean) as Product[];
  const rest = all.filter(p => !FEATURED_SKUS.includes(p.sku));
  return [...preferred, ...rest].slice(0, 8);
}

function CountUp({ to }: { to: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 900);
      setN(Math.round(to * p));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [to]);
  return <b>{n}+</b>;
}

function IconBranches() {
  return <svg className="trust-ico" viewBox="0 0 24 24" aria-hidden><path fill="currentColor" d="M12 3 3 8v2h18V8L12 3zm-7 9v8h4v-6h6v6h4v-8H5z"/></svg>;
}
function IconTrade() {
  return <svg className="trust-ico" viewBox="0 0 24 24" aria-hidden><path fill="currentColor" d="M3 6h18v2H3V6zm2 4h14l-1.5 9h-11L5 10zm4 2v5h2v-5H9zm4 0v5h2v-5h-2z"/></svg>;
}
function IconTruck() {
  return <svg className="trust-ico" viewBox="0 0 24 24" aria-hidden><path fill="currentColor" d="M3 6h11v8H3V6zm11 3h4l3 3v2h-7V9zM6 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm11 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>;
}
function IconStock() {
  return <svg className="trust-ico" viewBox="0 0 24 24" aria-hidden><path fill="currentColor" d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 2 2.5-2.5 1.5 1.5L14 20l-4-4 1.5-1.5L14 16z"/></svg>;
}

export function Home() {
  const highlights = useBranchHighlights();
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
    const t = setInterval(() => setSlide(s => (s + 1) % 3), 7000);
    return () => clearInterval(t);
  }, []);
  if (!data) return <div className="wrap loading-panel">Loading SNG storefront…</div>;

  const slides = [
    { img: "/img/hero.jpg", kicker: "TRADE & BULK ORDERS WELCOME", title: "EVERYTHING YOU NEED TO BUILD.", copy: "From foundation to finish — quality building materials, hardware, timber and tools across all SNG branches." },
    { img: "/img/hero-timber.jpg", kicker: "CUT-TO-SIZE SERVICE", title: "NEED TIMBER CUT TO SIZE?", copy: "Choose your timber, tell us the lengths, collect or arrange delivery from any SNG branch." },
    { img: "/img/hero-delivery.jpg", kicker: "DELIVERY AVAILABLE", title: "WE DELIVER TO YOUR SITE.", copy: "Bulk cement, timber, roofing, sand and full building orders on the SNG fleet." }
  ];
  const hero = slides[slide];

  return (
    <>
      <section className="hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(12,28,24,.88) 0%, rgba(12,28,24,.45) 55%, rgba(12,28,24,.25) 100%), url(${hero.img})` }}>
        <div className="wrap hero-inner">
          <p className="kicker">{hero.kicker}</p>
          <h1>{hero.title}</h1>
          <p className="lede">{hero.copy}</p>
          <div className="actions">
            <Link className="btn gold" to="/shop">Shop products</Link>
            <Link className="btn ghost" to="/quote">Request a quote</Link>
            <Link className="btn text" to="/branches">Find a branch</Link>
          </div>
          <div className="hero-dots">
            {slides.map((_, i) => <button key={i} className={i === slide ? "on" : ""} onClick={() => setSlide(i)} aria-label={"Slide " + (i + 1)} />)}
          </div>
        </div>
      </section>

      <section className="trust">
        <div className="wrap trust-grid">
          <div>
            <IconBranches />
            <b>Multiple branches</b>
            <span>Shop across our branch network</span>
          </div>
          <div>
            <IconTrade />
            <b>Bulk &amp; trade pricing</b>
            <span>Special pricing for builders and contractors</span>
          </div>
          <div>
            <IconTruck />
            <b>Delivery available</b>
            <span>Get materials delivered to site</span>
          </div>
          <div>
            <IconStock />
            <b>Real-time stock</b>
            <span>Check availability before you travel</span>
          </div>
        </div>
      </section>

      <section className="wrap section">
        <div className="section-head">
          <h2>Shop by category</h2>
          <Link to="/categories">View all categories</Link>
        </div>
        <div className="cat-grid">
          {(data.categories || []).map((c: any) => {
            const story = CAT_STORY[c.slug] || { kicker: c.description, points: [] as string[], cta: "Shop now" };
            return (
              <Link key={c.slug} className="cat-card" to={"/shop/" + c.slug}>
                <img src={CAT_IMG[c.slug] || merchSrc({ categorySlug: c.slug, imageUrl: c.imageUrl })} alt={c.name} />
                <div className="cat-card-body">
                  <small>{story.kicker}</small>
                  <h3>{c.name}</h3>
                  {story.points.length > 0 && <p>{story.points.join(" · ")}</p>}
                  <em>{c.productCount ? c.productCount + " products" : "In stock now"}</em>
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
            <h2>This week’s deals</h2>
            <Link to="/specials">View all specials</Link>
          </div>
          <ProductGrid items={(data.specials || []).slice(0, 6)} />
        </div>
      </section>

      <section className="wrap section">
        <div className="section-head">
          <h2>Featured / best sellers</h2>
          <Link to="/shop">Shop the range</Link>
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
        <img src="/img/house.jpg" alt="House under construction" />
        <div>
          <p className="kicker">Builder one stop</p>
          <h2>Building a house?</h2>
          <p>Send us your material list and we’ll prepare a complete quotation from the same catalogue our branches sell.</p>
          <div className="project-tiles">
            {[
              { name: "Foundation", img: "/img/foundation.jpg", to: "/shop/cement-concrete" },
              { name: "Brickwork", img: "/img/brickwork.jpg", to: "/shop/bricks-blocks" },
              { name: "Roofing", img: "/img/roof.jpg", to: "/shop/roofing" },
              { name: "Plumbing", img: "/img/pipe.jpg", to: "/shop/plumbing" },
              { name: "Electrical", img: "/img/cable.jpg", to: "/shop/electrical" },
              { name: "Finishing", img: "/img/finishing.jpg", to: "/shop/paint" }
            ].map(x => (
              <Link key={x.name} to={x.to} className="project-tile">
                <img src={x.img} alt="" />
                <span>{x.name}</span>
              </Link>
            ))}
          </div>
          <Link className="btn gold" to="/quote?project=house">Upload / request material quote</Link>
        </div>
      </section>

      <section className="split-cta reverse">
        <img src="/img/cutting.jpg" alt="Timber being prepared" />
        <div>
          <p className="kicker">Warehouse service</p>
          <h2>Need timber cut to size?</h2>
          <ol className="steps">
            <li>Choose your timber</li>
            <li>Tell us the required lengths</li>
            <li>SNG prepares the cut list</li>
            <li>Collect or arrange delivery</li>
          </ol>
          <Link className="btn gold" to="/timber-cut">Request timber cut</Link>
        </div>
      </section>

      <section className="trade-band">
        <div className="wrap">
          <p className="kicker">B2B</p>
          <h2>SNG Trade Account</h2>
          <p>Built for contractors, builders and businesses.</p>
          <ul className="benefit-list">
            <li>Trade pricing</li>
            <li>Bulk quotations</li>
            <li>Order history</li>
            <li>Account statements</li>
            <li>Faster repeat ordering</li>
            <li>Credit account support</li>
          </ul>
          <div className="actions">
            <Link className="btn gold" to="/trade">Open a trade account</Link>
            <Link className="btn ghost" to="/login">Trade customer login</Link>
          </div>
        </div>
      </section>

      <section className="split-cta">
        <img src="/img/delivery.jpg" alt="Materials delivery to site" />
        <div>
          <p className="kicker">SNG fleet</p>
          <h2>We deliver to your site</h2>
          <p>Bulk cement, timber, roofing, sand &amp; aggregates, and full building orders — scheduled through the same fleet that moves stock between our warehouses.</p>
          <ul className="deliver-list">
            <li>Bulk cement</li>
            <li>Timber</li>
            <li>Roofing</li>
            <li>Sand &amp; aggregates</li>
            <li>Full building orders</li>
          </ul>
          <Link className="btn gold" to="/delivery">Request delivery quote</Link>
        </div>
      </section>

      <section className="wrap section">
        <div className="section-head">
          <h2>Shop your nearest SNG</h2>
          <Link to="/branches">All branches</Link>
        </div>
        <div className="branch-grid">
          {(data.branches || []).map((b: any) => (
            <article className={"branch-card" + (getBranch()?.id === b.id ? " selected" : "")} key={b.id}>
              <div className="badge">OPEN</div>
              <h3>{b.name}</h3>
              <p>{b.address}<br />{b.city}<br />{b.phone}<br />{b.openingHours}</p>
              <BranchMiniStock name={b.name} highlights={highlights} />
              <div className="actions">
                <button className="btn" onClick={() => { setBranch({ id: b.id, name: b.name }); toast(b.name + " set as my branch"); }}>My branch</button>
                <Link className="btn ghost" to={"/branches#" + b.code}>View branch</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="wrap section why">
        <h2>Why builders choose SNG</h2>
        <div className="stat-row">
          <div><CountUp to={5} /><span>Branches</span></div>
          <div><CountUp to={10} /><span>Major categories</span></div>
          <div><CountUp to={60} /><span>Stocked lines</span></div>
        </div>
        <div className="why-grid">
          <div><b>Complete range</b><p>Building materials from foundation to finishing.</p></div>
          <div><b>Multiple branches</b><p>Stock available across our network.</p></div>
          <div><b>Trade friendly</b><p>Bulk orders and contractor support.</p></div>
          <div><b>Delivery</b><p>Materials delivered to your project.</p></div>
          <div><b>Timber cutting</b><p>Cut-to-size timber services.</p></div>
        </div>
      </section>

      <section className="final-cta">
        <div className="wrap">
          <h2>Need a full material list priced?</h2>
          <p>Add products to your quote cart — no card payment required. An SNG representative will confirm availability and delivery.</p>
          <Link className="btn gold" to="/quote">Request a quote</Link>
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
  const local = branchStock(p);
  const status = local?.status || (p.inStock ? "IN_STOCK" : "OUT_OF_STOCK");
  const save = p.promotionPrice && p.retailPrice ? Number(p.retailPrice) - Number(p.promotionPrice) : 0;
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
        <p className="avail">{p.inStockBranches ? `Available at ${p.inStockBranches} branch${p.inStockBranches === 1 ? "" : "es"}` : "Ask a branch for stock"}</p>
        <div className="card-actions">
          <button className="btn" type="button" onClick={() => addProduct(p)}>Add to cart</button>
          <button className="btn ghost" type="button" onClick={() => { addProduct(p); nav("/quote"); }}>Request quote</button>
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
  const title = promotion ? "This week’s deals" : category ? (category.replace(/-/g, " ")) : "Shop products";
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
          <p>We’ll quote custom lengths, brands and bulk lists.</p>
          <Link className="btn gold" to="/quote">Request a custom quote</Link>
        </div>
      )}
    </div>
  );
}

export function CategoriesPage() {
  const [cats, setCats] = useState<any[]>([]);
  useEffect(() => { api("/api/public/home").then((d: any) => setCats(d.categories || [])); }, []);
  return (
    <div className="wrap page">
      <h1>Categories</h1>
      <div className="cat-grid">
        {cats.map((c: any) => (
          <Link key={c.slug} className="cat-card" to={"/shop/" + c.slug}>
            <img src={CAT_IMG[c.slug] || "/img/tools.jpg"} alt={c.name} />
            <div className="cat-card-body">
              <h3>{c.name}</h3>
              <p>{c.description}</p>
              <span>Shop {c.name}</span>
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
  const [thumb, setThumb] = useState(0);
  useEffect(() => {
    api<Product>("/api/public/products/" + sku).then(prod => {
      setP(prod);
      pushViewed(prod.sku);
    });
  }, [sku]);
  if (!p) return <div className="wrap page">Loading product…</div>;
  const thumbs = [merchSrc(p), CAT_IMG[p.categorySlug || ""] || merchSrc(p), "/img/hero.jpg"];
  const shops = (p.availability || []).filter(a => !/warehouse/i.test(a.locationName));
  return (
    <div className="wrap page">
      <p className="crumb"><Link to="/shop">Shop</Link> / {p.category} / {p.name}</p>
      <div className="pdp">
        <div>
          <div className="pdp-hero"><img src={thumbs[thumb]} alt={p.name} onError={e => (e.currentTarget.src = "/img/tools.jpg")} /></div>
          <div className="thumbs">
            {thumbs.map((t, i) => <button key={i} className={i === thumb ? "on" : ""} onClick={() => setThumb(i)}><img src={t} alt="" /></button>)}
          </div>
        </div>
        <div>
          <span className={"badge " + stockClass(branchStock(p)?.status || (p.inStock ? "IN_STOCK" : "OUT_OF_STOCK"))}>
            {stockLabel(branchStock(p)?.status, p.inStock)}
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
            : <p className="muted">Trade pricing available on a trade account.</p>}
          <p>{p.description}</p>
          <h3>Specifications</h3>
          <p>{p.specification}</p>
          <h3>Branch stock</h3>
          <div className="stock-table">
            {shops.map(a => (
              <div key={a.locationName}><b>{a.locationName.replace(" Branch", "").toUpperCase()}</b>
                <span className={"badge " + stockClass(a.status)}>{stockLabel(a.status)}</span></div>
            ))}
          </div>
          <p className="muted">Exact quantities are not shown publicly. Availability is live from SNG warehouse and branch stock.</p>
          <p><b>Delivery</b> — collection from your branch, or request site delivery on the quote.</p>
          <div className="pdp-actions">
            <input type="number" min={1} value={qty} onChange={e => setQty(Math.max(1, Number(e.target.value)))} />
            <button className="btn" onClick={() => addProduct(p, qty)}>Add to cart</button>
            <button className="btn gold" onClick={() => { addProduct(p, qty); nav("/quote"); }}>Request quote</button>
          </div>
        </div>
      </div>
      {p.related && p.related.length > 0 && <><h2>Related products</h2><ProductGrid items={p.related} /></>}
    </div>
  );
}

export function Branches() {
  const [list, setList] = useState<any[]>([]);
  const highlights = useBranchHighlights();
  useTick("sng-cart");
  useEffect(() => { api<any[]>("/api/public/branches").then(setList); }, []);
  return (
    <div className="wrap page">
      <h1>Shop your nearest SNG</h1>
      <p className="lede-sm">Selecting a branch updates stock messaging across the storefront.</p>
      <div className="branch-grid">
        {list.map(b => (
          <article id={b.code} className={"branch-card" + (getBranch()?.id === b.id ? " selected" : "")} key={b.id}>
            <div className="badge">OPEN</div>
            <h3>{b.name}</h3>
            <p>{b.address}<br />{b.city}<br />{b.phone}<br />{b.openingHours}</p>
            <p>{b.services}</p>
            <BranchMiniStock name={b.name} highlights={highlights} />
            <button className="btn" onClick={() => { setBranch({ id: b.id, name: b.name }); toast("My branch: " + b.name); }}>My branch</button>
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
      <p>No online payment — submit this list as a quotation. Staff see it immediately in SNG ONE.</p>
      {lines.length === 0 && <p>Your quote cart is empty. <Link to="/shop">Shop products</Link></p>}
      {lines.map(l => (
        <div className="cart-line" key={l.sku}>
          <img src={l.imageUrl || merchSrc({ sku: l.sku })} alt="" />
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
    customerName: "ABC Construction", phone: "+263 77 212 0001", email: "abc@construction.zw",
    fulfilment: "DELIVERY", deliveryAddress: "Stand 44, Borrowdale Brooke, Harare",
    notes: params.get("project") === "house" ? "House build — please quote a complete material list." :
      params.get("timber") ? "Timber cut-to-size required. Please prepare a cut list." :
      params.get("delivery") ? "Please quote site delivery." : "Please confirm stock and lead time.",
    tradeCustomer: false
  });
  const [branches, setBranches] = useState<any[]>([]);
  const [branchId, setBranchId] = useState(String(getBranch()?.id || ""));
  const [done, setDone] = useState<{ reference: string } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { api<any[]>("/api/public/branches").then(setBranches); }, []);
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
          preferredLocationId: branchId || null,
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
          <Link className="btn ghost" to="/account">View account</Link>
        </div>
      </div>
    );
  }
  return (
    <form className="wrap page quote-form" onSubmit={submit}>
      <h1>Request a quote</h1>
      <p>Preferred branch, collection or delivery, and your details. This creates a live enquiry in SNG ONE.</p>
      <div className="quote-layout">
        <div className="quote-lines">
          <h3>Quote cart</h3>
          {getCart().length === 0 && <p>Cart is empty. <Link to="/shop">Add products</Link></p>}
          {getCart().map(l => <p key={l.sku}>{l.qty} × {l.name}</p>)}
        </div>
        <div className="quote-fields">
          <label>Preferred branch</label>
          <select value={branchId} onChange={e => setBranchId(e.target.value)}>
            <option value="">Select branch</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <label>Collection / Delivery</label>
          <select value={form.fulfilment} onChange={e => setForm({ ...form, fulfilment: e.target.value })}>
            <option value="COLLECTION">Collection</option>
            <option value="DELIVERY">Delivery</option>
          </select>
          <label>Delivery address</label>
          <textarea value={form.deliveryAddress} onChange={e => setForm({ ...form, deliveryAddress: e.target.value })} />
          <label>Customer name</label>
          <input value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} required />
          <label>Phone</label>
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
          <label>Email</label>
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
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
        <p>Sign in as a trade customer to view pricing, quotes and statements.</p>
        <p>Demo trade account: <b>abc@construction.zw</b></p>
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
            <div className="kpi"><span>Available</span><b>{money(data.available)}</b></div>
          </div>
          <h2>My quotes / enquiries</h2>
          <table><thead><tr><th>Ref</th><th>Status</th><th>When</th></tr></thead>
            <tbody>{(data.quotes || []).map((q: any) => <tr key={q.id}><td>{q.reference}</td><td>{q.status}</td><td>{String(q.createdAt || "").replace("T", " ").slice(0, 16)}</td></tr>)}</tbody>
          </table>
          <h2>Saved addresses</h2>
          {(data.addresses || []).map((a: any) => <p key={a.id}>{a.label}: {a.line1}, {a.city}</p>)}
        </>
      )}
      {data?.error && <p>Signed in as staff. Customer quotes appear for trade accounts.</p>}
      <button className="btn ghost" onClick={() => { logout(); window.location.href = "/"; }}>Sign out</button>
    </div>
  );
}

export function Contact() {
  return (
    <div className="wrap page">
      <h1>Contact SNG</h1>
      <p>Call Harare branch <b>+263 242 621000</b> or send a quote from the catalogue. This website is connected to live product, price and stock data in SNG ONE.</p>
      <div className="actions">
        <Link className="btn gold" to="/quote">Request a quote</Link>
        <Link className="btn ghost" to="/branches">Find a branch</Link>
      </div>
    </div>
  );
}

export function TradePage() {
  return (
    <div className="wrap page">
      <p className="kicker">Contractors &amp; businesses</p>
      <h1>SNG Trade Account</h1>
      <p className="lede-sm">Built for contractors, builders and businesses that buy every week — not once.</p>
      <ul className="benefit-list">
        <li>Trade pricing on the live catalogue</li>
        <li>Bulk quotations from the same stock your branch sells</li>
        <li>Order history and account statements</li>
        <li>Faster repeat ordering</li>
        <li>Credit account support (subject to approval)</li>
      </ul>
      <div className="actions">
        <Link className="btn gold" to="/quote">Open a trade account</Link>
        <Link className="btn ghost" to="/login">Trade customer login</Link>
      </div>
    </div>
  );
}

export function DeliveryPage() {
  return (
    <div className="split-cta page-split">
      <img src="/img/delivery.jpg" alt="" />
      <div>
        <p className="kicker">SNG fleet</p>
        <h1>We deliver to your site</h1>
        <p>Bulk cement, timber, roofing, sand &amp; aggregates, and full building orders. Deliveries are planned against the same trucks that move stock between warehouses.</p>
        <Link className="btn gold" to="/quote?delivery=1">Request delivery quote</Link>
      </div>
    </div>
  );
}

export function TimberCutPage() {
  return (
    <div className="split-cta page-split">
      <img src="/img/cutting.jpg" alt="" />
      <div>
        <p className="kicker">Cut-to-size</p>
        <h1>Need timber cut to size?</h1>
        <ol className="steps">
          <li>Choose your timber</li>
          <li>Tell us the required lengths</li>
          <li>SNG prepares the cut list</li>
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
      <h1>About SNG ONE</h1>
      <p>SNG is a multi-branch hardware and building-material retailer. This storefront is the customer face of the same catalogue, inventory, quotes, timber cutting and fleet that run inside the business.</p>
      <Link className="btn" to="/branches">Our branches</Link>
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
        <Link to="/" className="brand">SNG ONE<small>OPERATIONS</small></Link>
        <h1>Management login</h1>
        <p>Staff sign in with their own credentials. The customer store stays separate from operations.</p>
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
            <button className="btn ghost" type="button" onClick={() => demoEnter("TRADE")}>Enter as trade customer</button>
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
