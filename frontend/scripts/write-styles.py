from pathlib import Path

Path(__file__).resolve().parents[1].joinpath("src", "styles.css").write_text(r"""
:root {
  --green: #16361c;
  --green-2: #2a5a28;
  --lime: #8BC53F;
  --mint: #eef5e6;
  --sand: #f5f3ef;
  --paper: #ffffff;
  --ink: #1a1f1c;
  --muted: #5c675f;
  --line: #d8ddd8;
  --danger: #9b2c2c;
  --charcoal: #242824;
  font-family: "DM Sans", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  color: var(--ink);
  background: var(--sand);
}

* { box-sizing: border-box; }
html, body, #root { margin: 0; min-height: 100%; }
a { color: inherit; text-decoration: none; }
button, input, select, textarea { font: inherit; }
img { max-width: 100%; display: block; }
h1, h2, h3 { font-family: "DM Sans", "Segoe UI", Arial, sans-serif; font-weight: 800; letter-spacing: -0.02em; }

.store { padding-bottom: 72px; background: var(--sand); }
@media (min-width: 861px) { .store { padding-bottom: 0; } }

.store-header {
  background: var(--paper);
  color: var(--ink);
  position: sticky; top: 0; z-index: 40;
  border-bottom: 1px solid var(--line);
}
.hdr-top { background: var(--charcoal); color: #e6ebe6; font-size: 12px; }
.hdr-top-inner, .hdr-main, .hdr-nav-inner {
  max-width: 1320px; margin: 0 auto; padding: 8px 20px;
  display: flex; gap: 16px; align-items: center; justify-content: space-between;
}
.hdr-top-left { opacity: .92; }
.hdr-top-actions { display: flex; gap: 18px; align-items: center; flex-wrap: wrap; }
.hdr-top-actions a { color: #dce8d4; }
.hdr-top-actions a:hover { color: var(--lime); }
.demo-link { color: var(--muted) !important; font-weight: 600; font-size: 12px; text-transform: none; letter-spacing: 0; }
.hdr-main { padding: 14px 20px; gap: 16px; background: var(--paper); }
.logo { display: flex; align-items: center; flex-shrink: 0; }
.logo-img { height: 56px; width: auto; }
.footer-logo, .staff-logo { height: 56px; width: auto; background: #fff; padding: 6px 10px; margin-bottom: 10px; }
.hdr-utils { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.util { font-size: 13px; font-weight: 700; color: var(--ink); white-space: nowrap; }
.util b { color: var(--green-2); }
.util-call {
  background: var(--green); color: #fff !important; padding: 10px 14px;
  font-size: 12px; letter-spacing: .03em; text-transform: uppercase;
}
.util-wa {
  background: #25D366; color: #fff !important; padding: 10px 14px;
  font-size: 12px; letter-spacing: .03em; text-transform: uppercase;
}
.util-quote {
  background: var(--lime); color: var(--green) !important; padding: 10px 14px;
  font-size: 12px; letter-spacing: .03em; text-transform: uppercase;
}
.hdr-nav-row { background: var(--green); border-top: 0; }
.hdr-nav-inner { padding: 0 20px; min-height: 44px; }
.nav { display: flex; gap: 18px; font-size: 13px; font-weight: 700; letter-spacing: 0.02em; flex-wrap: wrap; color: #fff; }
.nav a:hover { color: var(--lime); }
.search { flex: 1; min-width: 180px; display: flex; background: #fff; border: 1px solid var(--line); overflow: visible; position: relative; }
.search input { border: 0; padding: 12px 14px; width: 100%; color: var(--ink); outline: none; }
.search > button, .btn {
  background: var(--green); color: #fff; border: 0; padding: 11px 16px; cursor: pointer;
  font-weight: 700; letter-spacing: .03em;
}
.search > button { background: var(--lime); color: var(--green); }
.btn.ghost { background: transparent; border: 1px solid currentColor; color: inherit; }
.btn.ghost.dark { border-color: var(--green); color: var(--green); }
.btn.gold { background: var(--lime); color: var(--green); }
.menu-btn { display: none; background: transparent; color: var(--ink); border: 1px solid var(--line); padding: 8px 12px; }
.suggest {
  position: absolute; top: 48px; left: 0; right: 0; background: #fff; color: var(--ink);
  border: 1px solid var(--line); z-index: 50; overflow: hidden;
}
.suggest a, .suggest-empty { display: flex; gap: 10px; align-items: center; padding: 10px 14px; border-bottom: 1px solid var(--line); }
.suggest img { width: 44px; height: 44px; object-fit: cover; }
.suggest small { display: block; color: var(--muted); }
.suggest-empty { display: block; font-size: 14px; }
.suggest-empty a { display: inline; padding: 0; border: 0; color: var(--green-2); font-weight: 700; }

.wrap { max-width: 1320px; margin: 0 auto; padding: 36px 20px; }
.store-header .wrap { padding: 10px 20px; max-width: 1320px; }
.page { padding-top: 24px; }

.hero {
  min-height: min(72vh, 620px);
  background-size: cover; background-position: center;
  color: #fff; display: flex; align-items: center;
}
.hero-inner { padding: 64px 20px; }
.hero h1 { font-size: clamp(34px, 5.4vw, 64px); margin: 0 0 14px; max-width: 14ch; line-height: 1.02; }
.lede { font-size: 18px; max-width: 46ch; margin: 0 0 26px; color: #e8efe9; }
.lede-sm { color: var(--muted); max-width: 60ch; }
.kicker { letter-spacing: .14em; text-transform: uppercase; font-size: 12px; color: var(--lime); font-weight: 800; }
.actions { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.hero-pills {
  display: flex; flex-wrap: wrap; gap: 8px 18px; margin: 28px 0 0; padding: 0; list-style: none;
  font-size: 12px; letter-spacing: .08em; text-transform: uppercase; font-weight: 700; color: #d5e8d0;
}
.hero-pills li { border-left: 3px solid var(--lime); padding-left: 10px; }

.trust { background: var(--paper); border-bottom: 1px solid var(--line); }
.trust-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; padding: 18px 20px; }
.trust-grid div { border-left: 3px solid var(--lime); padding-left: 12px; }
.trust-grid b { display: block; }
.trust-grid span { color: var(--muted); font-size: 14px; }

.section { padding-top: 12px; }
.section-head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-bottom: 8px; }
.section-head a { color: var(--green-2); font-weight: 700; }
.cap { text-transform: capitalize; }
.demo-price-note, .demo-note { font-size: 12px; color: var(--muted); margin: 0 0 14px; }
.bulk-note { margin: 0; font-size: 13px; color: var(--green-2); font-weight: 600; }
.per { font-size: 13px; color: var(--muted); font-weight: 600; }

.cat-grid.photo-cats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.cat-tile {
  position: relative; min-height: 220px; overflow: hidden; color: #fff; display: block;
}
.cat-tile img {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
  transition: transform .4s ease;
}
.cat-tile:hover img { transform: scale(1.05); }
.cat-tile-body {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,.08) 0%, rgba(12,20,14,.85) 72%);
  padding: 18px; display: flex; flex-direction: column; justify-content: flex-end;
}
.cat-tile h3 { margin: 0 0 6px; font-size: 26px; text-transform: uppercase; letter-spacing: .02em; }
.cat-tile p { margin: 0 0 10px; font-size: 13px; color: #dce8e2; line-height: 1.35; max-width: 28ch; }
.cat-tile span {
  display: inline-block; width: fit-content;
  background: var(--lime); color: var(--green); padding: 7px 11px;
  font-size: 11px; letter-spacing: .06em; text-transform: uppercase; font-weight: 800;
}

.house-band { background: var(--paper); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.house-inner {
  display: grid; grid-template-columns: 1.1fr 1fr; gap: 0; align-items: stretch; padding: 0;
  max-width: 1320px; margin: 0 auto;
}
.house-copy { padding: 48px 36px; }
.house-copy h2 { font-size: clamp(28px, 3.5vw, 42px); margin: 0 0 12px; }
.house-list {
  display: flex; flex-wrap: wrap; gap: 8px; list-style: none; padding: 0; margin: 18px 0 24px;
}
.house-list li {
  background: var(--mint); color: var(--green); padding: 8px 12px; font-weight: 700; font-size: 13px;
}
.house-photo { width: 100%; height: 100%; min-height: 340px; object-fit: cover; }

.prod-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.prod-card {
  background: var(--paper); border: 1px solid var(--line);
  display: flex; flex-direction: column;
}
.prod-card:hover { border-color: #b7c4b8; }
.prod-media { position: relative; background: #eceee8; aspect-ratio: 1 / 1; overflow: hidden; }
.prod-media img { height: 100%; width: 100%; object-fit: cover; }
.promo-flag { position: absolute; top: 10px; left: 10px; background: var(--lime); color: var(--green); font-size: 11px; font-weight: 800; padding: 4px 8px; }
.prod-body { padding: 12px 14px 14px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
.prod-body h3 { margin: 0; font-size: 16px; line-height: 1.25; }
.brand-line { text-transform: uppercase; letter-spacing: .08em; font-size: 11px; color: var(--muted); font-weight: 700; }
.meta { color: var(--muted); font-size: 13px; margin: 0; }
.price { font-weight: 800; color: var(--ink); font-size: 20px; }
.price-row { display: flex; gap: 8px; align-items: baseline; flex-wrap: wrap; }
.price-row.lg .price { font-size: 28px; }
.card-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: auto; padding-top: 8px; }
.card-actions .btn { width: 100%; font-size: 12px; padding: 10px 6px; text-align: center; }

.badge { display: inline-block; font-size: 11px; letter-spacing: 0.06em; padding: 3px 8px; background: var(--mint); color: var(--green); font-weight: 800; width: fit-content; }
.badge.low { background: #f4e3c3; color: #7a4b00; }
.badge.out { background: #f3d4d4; color: var(--danger); }

.split-cta { display: grid; grid-template-columns: 1fr 1fr; min-height: 360px; }
.split-cta img { width: 100%; height: 100%; object-fit: cover; min-height: 280px; }
.split-cta > div { padding: 44px 36px; background: var(--paper); }
.split-cta.reverse { direction: rtl; }
.split-cta.reverse > * { direction: ltr; }
.page-split { margin: 24px 20px; overflow: hidden; border: 1px solid var(--line); }
.steps { padding-left: 18px; }
.trade-band { background: var(--charcoal); color: #fff; }
.trade-band .wrap { padding: 48px 20px; }
.benefit-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px 20px; padding: 0; list-style: none; }
.benefit-list li::before { content: "■ "; color: var(--lime); }

.branch-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
.branch-card { background: var(--paper); border: 1px solid var(--line); padding: 18px; }
.phone-lg { font-size: 22px; font-weight: 800; margin: 8px 0; }
.phone-lg a { color: var(--green-2); }

.site-footer { background: #102418; color: #d5e4dd; }
.footer-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; padding-bottom: 12px; }
.footer-grid h4 { color: var(--lime); margin: 0 0 10px; font-family: inherit; letter-spacing: .06em; text-transform: uppercase; font-size: 12px; }
.footer-grid a { display: block; padding: 4px 0; }
.footer-brand { font-weight: 800; margin: 0 0 10px; }
.footer-bottom { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,.12); padding: 16px 20px 28px; gap: 12px; flex-wrap: wrap; font-size: 13px; }

.pdp { display: grid; grid-template-columns: 1.05fr .95fr; gap: 36px; align-items: start; }
.pdp-hero { background: #eceee8; aspect-ratio: 1; overflow: hidden; border: 1px solid var(--line); }
.pdp-hero img { width: 100%; height: 100%; object-fit: cover; }
.pdp-info h1 { margin: 6px 0 8px; font-size: clamp(26px, 3vw, 36px); }
.pdp-actions { display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap; }
.pdp-actions input { width: 88px; padding: 10px; border: 1px solid var(--line); }
.pdp-extra { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin: 36px 0 24px; padding-top: 24px; border-top: 1px solid var(--line); }
.muted { color: var(--muted); }
.crumb { color: var(--muted); font-size: 13px; }
.empty-panel, .confirm, .loading-panel { background: var(--paper); padding: 28px; border: 1px solid var(--line); }
.ref { font-size: 22px; }
.cart-line { display: grid; grid-template-columns: 72px 1fr 80px 100px auto; gap: 12px; align-items: center; background: var(--paper); padding: 12px; margin-bottom: 8px; border: 1px solid var(--line); }
.cart-line img { width: 72px; height: 72px; object-fit: cover; }
.quote-layout { display: grid; grid-template-columns: 1fr 1.2fr; gap: 28px; }
.quote-fields input, .quote-fields select, .quote-fields textarea { width: 100%; padding: 10px; margin: 4px 0 14px; border: 1px solid var(--line); background: #fff; }
.quote-fields textarea { min-height: 80px; }
.check { display: flex; gap: 8px; align-items: center; }

.toast {
  position: fixed; bottom: 84px; right: 16px; background: var(--green); color: #fff;
  padding: 12px 16px; border-left: 4px solid var(--lime); z-index: 80;
}
@media (min-width: 861px) { .toast { bottom: 20px; right: 20px; } }

.mobile-actions {
  display: none; position: fixed; left: 0; right: 0; bottom: 0; z-index: 70;
  background: var(--green); border-top: 2px solid var(--lime);
  grid-template-columns: 1fr 1.2fr 1fr;
}
.mobile-actions a {
  color: #fff; text-align: center; padding: 14px 8px; font-weight: 800; font-size: 13px;
  letter-spacing: .06em; text-transform: uppercase; border-right: 1px solid rgba(255,255,255,.12);
}
.mobile-actions a.wa { background: #1ebe57; }
.mobile-actions a:last-child { border-right: 0; background: var(--lime); color: var(--green); }

.staff-login {
  min-height: 100vh; display: grid; place-items: center;
  background: var(--charcoal); padding: 24px;
}
.staff-login-card { width: min(520px, 100%); background: var(--paper); padding: 28px; border: 1px solid var(--line); }
.staff-login-card input { width: 100%; padding: 10px; margin: 6px 0 14px; border: 1px solid var(--line); }
.demo-roles { display: grid; gap: 8px; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--line); }
.demo-roles .btn { text-align: left; }

.app-shell { display: grid; grid-template-columns: 240px 1fr; min-height: 100vh; }
.side { background: var(--green); color: #e8f0ec; padding: 22px 0; }
.side a { display: block; padding: 10px 22px; color: #d5e4dd; font-size: 14px; }
.side a.active, .side a:hover { background: rgba(255,255,255,0.08); color: #fff; }
.side h2 { margin: 0 22px 18px; font-size: 20px; }
.main { padding: 24px; background: var(--sand); }
.kpis { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
.kpi { background: var(--paper); border: 1px solid var(--line); padding: 14px 16px; }
.kpi b { display: block; font-size: 22px; color: var(--green-2); }
.kpi span { color: var(--muted); font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; }
table { width: 100%; border-collapse: collapse; background: var(--paper); }
th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--line); font-size: 14px; }
th { font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); }
.pos-search { width: 100%; padding: 16px; font-size: 20px; border: 2px solid var(--green-2); }
.receipt { width: 320px; background: #fff; padding: 16px; font-family: ui-monospace, monospace; }
.bar { display: flex; height: 28px; width: 100%; background: #eee; overflow: hidden; }
.bar span { display: block; height: 100%; color: #fff; font-size: 11px; line-height: 28px; text-align: center; overflow: hidden; }
.notice { background: #fff6d8; border: 1px solid #e6d08a; padding: 10px 12px; margin: 12px 0; }
.error { color: var(--danger); }
.login { max-width: 420px; margin: 80px auto; background: var(--paper); padding: 32px; border: 1px solid var(--line); }
.login input { width: 100%; padding: 10px; margin: 6px 0 14px; border: 1px solid var(--line); }
.filters { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0 20px; }
.filters input, .filters select { padding: 8px; border: 1px solid var(--line); background: #fff; }
.card { background: var(--paper); border: 1px solid var(--line); }
.card .body { padding: 12px 14px 16px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 18px; }
.cta-band { background: var(--green); color: #fff; }
.cta-band .wrap { display: flex; justify-content: space-between; gap: 20px; align-items: center; flex-wrap: wrap; }

@media (max-width: 1200px) {
  .cat-grid.photo-cats { grid-template-columns: repeat(3, 1fr); }
  .prod-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 1024px) {
  .trust-grid, .branch-grid, .pdp, .pdp-extra, .quote-layout, .split-cta, .house-inner { grid-template-columns: 1fr; }
  .split-cta.reverse { direction: ltr; }
  .cat-grid.photo-cats, .prod-grid { grid-template-columns: repeat(2, 1fr); }
  .footer-grid, .benefit-list { grid-template-columns: repeat(2, 1fr); }
  .hero { min-height: 520px; }
  .house-photo { min-height: 260px; }
}
@media (max-width: 860px) {
  .app-shell { grid-template-columns: 1fr; }
  .side { display: flex; overflow: auto; padding: 0; }
  .side h2 { display: none; }
  .side a { white-space: nowrap; }
  .menu-btn { display: inline-block; }
  .hdr-nav-row { display: none; }
  .hdr-nav-row.open { display: block; }
  .hdr-nav-inner { flex-direction: column; align-items: flex-start; padding: 12px 20px; }
  .nav { display: flex; width: 100%; flex-direction: column; }
  .hdr-main { flex-wrap: wrap; }
  .search { min-width: 100%; order: 3; }
  .hdr-top-inner { flex-direction: column; align-items: flex-start; gap: 6px; }
  .hide-sm { display: none !important; }
  .util-call, .util-wa, .util-quote { padding: 8px 10px; font-size: 11px; }
  .mobile-actions { display: grid; }
  .cart-line { grid-template-columns: 72px 1fr; }
  .logo-img { height: 46px; }
  .hdr-top-left { display: none; }
}
@media (max-width: 640px) {
  .cat-grid.photo-cats, .prod-grid, .footer-grid, .benefit-list, .trust-grid { grid-template-columns: 1fr; }
  .cat-tile { min-height: 200px; }
  .card-actions { grid-template-columns: 1fr; }
  .hero h1 { font-size: 34px; }
  .hdr-utils .util:not(.util-call):not(.util-wa):not(.util-quote) { display: none; }
}
""".lstrip(), encoding="utf-8")
print("ok")
