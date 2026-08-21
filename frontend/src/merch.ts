/** Photographic merchandising map — JPG/PNG only. No SVG product art. */

const PLACEHOLDER = "/img/brand/placeholder.jpg";

/** Exact SKU → local photograph */
export const SKU_PRODUCT_IMAGE: Record<string, string> = {
  "CEM-PPC-50": "/img/products/ppc-cement-50kg.jpg",
  "CEM-LAF-50": "/img/products/lafarge-cement-50kg.jpg",
  "CEM-PPC-42.5": "/img/products/ppc-cement-50kg.jpg",
  "CEM-MASON-25": "/img/products/ppc-cement-50kg.jpg",
  "TIM-PINE-38-114-3600": "/img/products/pine-38x114.jpg",
  "TIM-PINE-38-114-6000": "/img/products/pine-6m.jpg",
  "TIM-PINE-38-114-4200": "/img/products/pine-38x114.jpg",
  "TIM-PINE-38-114-2400": "/img/products/pine-38x114.jpg",
  "TIM-PINE-50-152-3600": "/img/products/pine-38x114.jpg",
  "TIM-PINE-38-38-3000": "/img/products/pine-38x114.jpg",
  "ROF-IBR-3M": "/img/products/ibr-roofing.jpg",
  "ROF-IBR-48": "/img/products/ibr-roofing.jpg",
  "ROF-IBR-026": "/img/products/ibr-roofing.jpg",
  "ROF-CORR-026": "/img/products/ibr-roofing.jpg",
  "PNT-WHT-20": "/img/products/paint-20l.jpg",
  "PNT-EXT-20": "/img/products/paint-20l.jpg",
  "PNT-PRM-5": "/img/products/paint-20l.jpg",
  "ELC-GEY-150": "/img/products/geyser-150.jpg",
  "ELC-2.5-100": "/img/products/copper-cable.jpg",
  "ELC-CU-25": "/img/products/copper-cable.jpg",
  "ELC-1.5-100": "/img/products/copper-cable.jpg",
  "PLB-TOI-CLS": "/img/products/toilet.jpg",
  "PLB-TAP-MIX": "/img/products/mixer-tap.jpg",
  "PLB-PVC-50": "/img/products/pvc-pipe.jpg",
  "PLB-PVC-110": "/img/products/pvc-pipe.jpg",
  "PLB-SINK-DBL": "/img/products/double-sink.jpg",
  "TOL-WHEL-65": "/img/products/wheelbarrow.jpg",
  "TOL-ANG-115": "/img/products/angle-grinder.jpg",
  "TOL-DRL-18": "/img/products/cordless-drill.jpg",
  "TOL-HAM-16": "/img/products/claw-hammer.jpg",
  "AGG-SAND-BLD": "/img/products/builders-sand.jpg",
  "AGG-SAND-RIV": "/img/products/river-sand.jpg",
  "AGG-STN-19": "/img/products/stone-19mm.jpg",
  "AGG-DUST": "/img/products/builders-sand.jpg",
  "AGG-PIT": "/img/products/river-sand.jpg",
  "BRK-BLK-6IN": "/img/products/concrete-block.jpg",
  "BRK-CLY-STD": "/img/products/clay-brick.jpg",
  "BRK-MAXI": "/img/products/clay-brick.jpg",
  "DOR-SEC-813": "/img/products/security-door.jpg",
  "DOR-EXT-813": "/img/products/hardwood-door.jpg",
  "DOR-INT-726": "/img/products/hardwood-door.jpg"
};

/** Category photographic tiles */
export const CAT_IMG: Record<string, string> = {
  "cement-concrete": "/img/categories/cement.jpg",
  timber: "/img/categories/timber.jpg",
  roofing: "/img/categories/roofing.jpg",
  "bricks-blocks": "/img/categories/bricks.jpg",
  plumbing: "/img/categories/plumbing.jpg",
  electrical: "/img/categories/electrical.jpg",
  paint: "/img/categories/paint.jpg",
  "doors-windows": "/img/categories/doors.jpg",
  tools: "/img/categories/tools.jpg",
  "sand-aggregates": "/img/categories/sand.jpg",
  "wire-mesh": "/img/categories/wire-mesh.png",
  fasteners: "/img/categories/fasteners.jpg"
};

export const CAT_STORY: Record<string, { blurb: string; cta: string }> = {
  "cement-concrete": { blurb: "PPC, Lafarge and masonry cement for foundations and slab work.", cta: "View products" },
  timber: { blurb: "Structural pine, boards and cut-to-size service.", cta: "View products" },
  roofing: { blurb: "IBR and corrugated sheets, ridges and screws.", cta: "View products" },
  "bricks-blocks": { blurb: "Clay brick, concrete blocks and paving.", cta: "View products" },
  plumbing: { blurb: "PVC pipe, tanks, taps and sanitaryware.", cta: "View products" },
  electrical: { blurb: "Cable, geysers, boards and fittings.", cta: "View products" },
  paint: { blurb: "Interior and exterior paint, primers and brushes.", cta: "View products" },
  tools: { blurb: "Grinders, drills, wheelbarrows and hand tools.", cta: "View products" },
  "doors-windows": { blurb: "Security doors, hardwood doors and frames.", cta: "View products" },
  "sand-aggregates": { blurb: "Builders sand, river sand and stone.", cta: "View products" },
  "wire-mesh": { blurb: "Field fencing and mesh for site and farm use.", cta: "Ask for stock" },
  fasteners: { blurb: "Bolts, screws and fixing hardware.", cta: "Ask for stock" }
};

/** Homepage category order (photographic tiles) */
export const HOME_CATS: { slug: string; name: string; href: string }[] = [
  { slug: "cement-concrete", name: "Cement & Concrete", href: "/shop/cement-concrete" },
  { slug: "timber", name: "Timber", href: "/shop/timber" },
  { slug: "roofing", name: "Roofing", href: "/shop/roofing" },
  { slug: "bricks-blocks", name: "Bricks & Blocks", href: "/shop/bricks-blocks" },
  { slug: "plumbing", name: "Plumbing", href: "/shop/plumbing" },
  { slug: "electrical", name: "Electrical", href: "/shop/electrical" },
  { slug: "paint", name: "Paint", href: "/shop/paint" },
  { slug: "doors-windows", name: "Doors & Windows", href: "/shop/doors-windows" },
  { slug: "tools", name: "Tools", href: "/shop/tools" },
  { slug: "sand-aggregates", name: "Sand & Aggregates", href: "/shop/sand-aggregates" },
  { slug: "wire-mesh", name: "Wire Mesh & Fencing", href: "/contact" },
  { slug: "fasteners", name: "Fasteners", href: "/contact" }
];

export const FEATURED_SKUS = [
  "CEM-PPC-50", "CEM-LAF-50", "TIM-PINE-38-114-3600", "TIM-PINE-38-114-6000",
  "ROF-IBR-3M", "PNT-WHT-20", "ELC-GEY-150", "TOL-WHEL-65"
];

export const HERO = {
  main: "/img/hero/hero.png",
  timber: "/img/hero/timber.jpg",
  delivery: "/img/services/sng-delivery.png"
};

export const SERVICE = {
  house: "/img/services/house-build.jpg",
  timber: "/img/services/timber-cut.jpg",
  delivery: "/img/services/sng-delivery.png",
  trade: "/img/services/trade.jpg"
};

/** @deprecated aliases used by Storefront */
export const HERO_IMGS = { yard: HERO.main, timber: HERO.timber, delivery: HERO.delivery };
export const SERVICE_IMGS = { house: SERVICE.house, cutting: SERVICE.timber, delivery: SERVICE.delivery, trade: SERVICE.trade };
export const CORE_CAT_ORDER = HOME_CATS.map(c => c.slug);

function typeFallback(sku: string, slug: string) {
  if (sku.startsWith("CEM-")) return CAT_IMG["cement-concrete"];
  if (sku.startsWith("TIM-")) return CAT_IMG.timber;
  if (sku.startsWith("ROF-")) return CAT_IMG.roofing;
  if (sku.startsWith("BRK-")) return CAT_IMG["bricks-blocks"];
  if (sku.startsWith("PLB-TOI")) return SKU_PRODUCT_IMAGE["PLB-TOI-CLS"];
  if (sku.startsWith("PLB-TAP")) return SKU_PRODUCT_IMAGE["PLB-TAP-MIX"];
  if (sku.startsWith("PLB-")) return CAT_IMG.plumbing;
  if (sku.startsWith("ELC-GEY")) return SKU_PRODUCT_IMAGE["ELC-GEY-150"];
  if (sku.startsWith("ELC-")) return CAT_IMG.electrical;
  if (sku.startsWith("PNT-")) return CAT_IMG.paint;
  if (sku.startsWith("DOR-") || sku.startsWith("WIN-")) return CAT_IMG["doors-windows"];
  if (sku.startsWith("TOL-WHEL")) return SKU_PRODUCT_IMAGE["TOL-WHEL-65"];
  if (sku.startsWith("TOL-")) return CAT_IMG.tools;
  if (sku.startsWith("AGG-")) return CAT_IMG["sand-aggregates"];
  if (slug && CAT_IMG[slug]) return CAT_IMG[slug];
  return PLACEHOLDER;
}

export function slugify(name: string) {
  return name.toLowerCase().replace(/&/g, "").replace(/\s+/g, "-");
}

/** Resolve photo: exact SKU → product-type/category photo → branded placeholder. Never tools-for-cement. */
export function merchSrc(p: { sku?: string; categorySlug?: string; category?: string; imageUrl?: string }) {
  const sku = (p.sku || "").toUpperCase();
  if (sku && SKU_PRODUCT_IMAGE[sku]) return SKU_PRODUCT_IMAGE[sku];
  const slug = p.categorySlug || slugify(p.category || "");
  return typeFallback(sku, slug);
}

export function merchFallback(p: { sku?: string; categorySlug?: string; category?: string }) {
  const sku = (p.sku || "").toUpperCase();
  const slug = p.categorySlug || slugify(p.category || "");
  const next = typeFallback(sku, slug);
  return next === PLACEHOLDER ? PLACEHOLDER : next;
}

export function unitLabel(u?: string) {
  const map: Record<string, string> = {
    BAG: "bag", LENGTH: "length", EACH: "each", LITRE: "litre",
    CUBIC_METRE: "m³", METRE: "metre", BOX: "box"
  };
  return map[u || ""] || (u || "each").toLowerCase();
}

export function stockClass(status?: string) {
  if (status === "LOW_STOCK") return "low";
  if (status === "OUT_OF_STOCK") return "out";
  return "";
}

export function stockLabel(status?: string, inStock?: boolean) {
  if (status === "LOW_STOCK") return "LOW STOCK";
  if (status === "OUT_OF_STOCK" || inStock === false) return "ASK BRANCH";
  return "IN STOCK";
}

/** @deprecated alias */
export const SKU_IMG = SKU_PRODUCT_IMAGE;
export const CAT_STORY_LEGACY = CAT_STORY;
