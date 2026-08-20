/** SKU-level and category merchandising for the public storefront. Prefer local files. */

const PLACEHOLDER = "/img/placeholder.svg";

/** Exact product images — one file per important demo SKU where possible. */
export const SKU_IMG: Record<string, string> = {
  "CEM-PPC-50": "/img/products/cem-ppc-50.svg",
  "CEM-LAF-50": "/img/products/cem-laf-50.svg",
  "CEM-PPC-42.5": "/img/products/cem-ppc-50.svg",
  "CEM-MASON-25": "/img/products/cem-ppc-50.svg",
  "TIM-PINE-38-114-3600": "/img/products/timber-stack.svg",
  "TIM-PINE-38-114-6000": "/img/products/timber-long.svg",
  "TIM-PINE-38-114-4200": "/img/products/timber-stack.svg",
  "TIM-PINE-38-114-2400": "/img/products/timber-stack.svg",
  "TIM-PINE-50-152-3600": "/img/products/timber-stack.svg",
  "TIM-PINE-38-38-3000": "/img/products/timber-stack.svg",
  "ROF-IBR-3M": "/img/products/ibr-sheet.svg",
  "ROF-IBR-48": "/img/products/ibr-sheet.svg",
  "ROF-IBR-026": "/img/products/ibr-sheet.svg",
  "ROF-CORR-026": "/img/products/ibr-sheet.svg",
  "PNT-WHT-20": "/img/products/paint-20l.svg",
  "PNT-EXT-20": "/img/products/paint-20l.svg",
  "PNT-PRM-5": "/img/products/paint-20l.svg",
  "ELC-GEY-150": "/img/products/geyser-150.svg",
  "ELC-2.5-100": "/img/products/cable.svg",
  "ELC-CU-25": "/img/products/cable.svg",
  "ELC-1.5-100": "/img/products/cable.svg",
  "PLB-TOI-CLS": "/img/products/toilet.svg",
  "PLB-TAP-MIX": "/img/products/tap.svg",
  "PLB-PVC-50": "/img/products/pvc-pipe.svg",
  "PLB-PVC-110": "/img/products/pvc-pipe.svg",
  "PLB-SINK-DBL": "/img/products/sink.svg",
  "TOL-WHEL-65": "/img/products/wheelbarrow.svg",
  "TOL-ANG-115": "/img/products/grinder.svg",
  "TOL-DRL-18": "/img/products/drill.svg",
  "TOL-HAM-16": "/img/products/grinder.svg",
  "AGG-SAND-BLD": "/img/products/builders-sand.svg",
  "AGG-SAND-RIV": "/img/products/river-sand.svg",
  "AGG-STN-19": "/img/products/stone.svg",
  "AGG-DUST": "/img/products/builders-sand.svg",
  "AGG-PIT": "/img/products/river-sand.svg",
  "BRK-BLK-6IN": "/img/products/blocks.svg",
  "BRK-CLY-STD": "/img/products/bricks.svg",
  "BRK-MAXI": "/img/products/bricks.svg",
  "DOR-SEC-813": "/img/products/security-door.svg",
  "DOR-EXT-813": "/img/products/door.svg",
  "DOR-INT-726": "/img/products/door.svg"
};

/** Category cards — material-yard style, not white ecommerce packs. */
export const CAT_IMG: Record<string, string> = {
  "cement-concrete": "/img/categories/cement.svg",
  timber: "/img/categories/timber.svg",
  roofing: "/img/categories/roofing.svg",
  "bricks-blocks": "/img/categories/bricks.svg",
  plumbing: "/img/categories/plumbing.svg",
  electrical: "/img/categories/electrical.svg",
  paint: "/img/categories/paint.svg",
  "doors-windows": "/img/categories/doors.svg",
  tools: "/img/categories/tools.svg",
  "sand-aggregates": "/img/categories/sand.svg"
};

export const CAT_STORY: Record<string, { kicker: string; points: string[]; cta: string }> = {
  "cement-concrete": { kicker: "Foundation work", points: ["PPC", "Lafarge", "Masonry", "Bulk bags"], cta: "View cement" },
  timber: { kicker: "Structural pine", points: ["Lengths in stock", "Cut to size", "Boards"], cta: "View timber" },
  roofing: { kicker: "IBR & sheeting", points: ["IBR sheets", "Corrugated", "Ridges"], cta: "View roofing" },
  "bricks-blocks": { kicker: "Walls & paving", points: ["Clay brick", "6 inch blocks", "Maxi"], cta: "View bricks" },
  plumbing: { kicker: "Pipes & fittings", points: ["PVC", "Tanks", "Sanitaryware"], cta: "View plumbing" },
  electrical: { kicker: "Cable & geysers", points: ["Copper cable", "Geysers", "Boards"], cta: "View electrical" },
  paint: { kicker: "Interior & exterior", points: ["20L paint", "Primer", "Brushes"], cta: "View paint" },
  "doors-windows": { kicker: "Doors & frames", points: ["Security doors", "Hardwood", "Frames"], cta: "View doors" },
  tools: { kicker: "Site tools", points: ["Grinders", "Drills", "Wheelbarrows"], cta: "View tools" },
  "sand-aggregates": { kicker: "Bulk materials", points: ["Builders sand", "River sand", "Stone"], cta: "View aggregates" }
};

export const CORE_CAT_ORDER = [
  "cement-concrete", "timber", "roofing", "bricks-blocks", "plumbing", "electrical",
  "paint", "tools", "doors-windows", "sand-aggregates"
];

export const FEATURED_SKUS = [
  "CEM-PPC-50", "CEM-LAF-50", "TIM-PINE-38-114-3600", "TIM-PINE-38-114-6000",
  "ROF-IBR-3M", "ROF-IBR-48", "PNT-WHT-20", "ELC-GEY-150"
];

/** Hero: real SNG yard photo + timber / delivery scenes */
export const HERO_IMGS = {
  yard: "/img/hero/yard.png",
  timber: "/img/products/timber-long.svg",
  delivery: "/img/hero/yard.png"
};

export const SERVICE_IMGS = {
  house: "/img/hero/yard.png",
  cutting: "/img/products/timber-stack.svg",
  delivery: "/img/brand-yard.png",
  trade: "/img/hero/yard.png"
};

function categoryFallback(slug?: string) {
  if (slug && CAT_IMG[slug]) return CAT_IMG[slug];
  return PLACEHOLDER;
}

function prefixFallback(sku: string) {
  if (sku.startsWith("CEM-")) return CAT_IMG["cement-concrete"];
  if (sku.startsWith("TIM-")) return CAT_IMG.timber;
  if (sku.startsWith("ROF-")) return CAT_IMG.roofing;
  if (sku.startsWith("BRK-")) return CAT_IMG["bricks-blocks"];
  if (sku.startsWith("PLB-TOI")) return SKU_IMG["PLB-TOI-CLS"];
  if (sku.startsWith("PLB-TAP")) return SKU_IMG["PLB-TAP-MIX"];
  if (sku.startsWith("PLB-")) return CAT_IMG.plumbing;
  if (sku.startsWith("ELC-GEY")) return SKU_IMG["ELC-GEY-150"];
  if (sku.startsWith("ELC-")) return CAT_IMG.electrical;
  if (sku.startsWith("PNT-")) return CAT_IMG.paint;
  if (sku.startsWith("DOR-") || sku.startsWith("WIN-")) return CAT_IMG["doors-windows"];
  if (sku.startsWith("TOL-WHEL")) return SKU_IMG["TOL-WHEL-65"];
  if (sku.startsWith("TOL-")) return CAT_IMG.tools;
  if (sku.startsWith("AGG-")) return CAT_IMG["sand-aggregates"];
  return "";
}

export function slugify(name: string) {
  return name.toLowerCase().replace(/&/g, "").replace(/\s+/g, "-");
}

/**
 * Resolve a merchandising image.
 * Order: exact SKU → category → SKU-prefix category → local imageUrl if /img/ → neutral placeholder.
 * Never falls back to an unrelated product (e.g. tools for cement).
 */
export function merchSrc(p: { sku?: string; categorySlug?: string; category?: string; imageUrl?: string }) {
  const sku = (p.sku || "").toUpperCase();
  if (sku && SKU_IMG[sku]) return SKU_IMG[sku];
  const slug = p.categorySlug || slugify(p.category || "");
  if (slug && CAT_IMG[slug]) return CAT_IMG[slug];
  const byPrefix = prefixFallback(sku);
  if (byPrefix) return byPrefix;
  if (p.imageUrl && p.imageUrl.startsWith("/img/")) return p.imageUrl;
  return PLACEHOLDER;
}

export function merchFallback(p: { sku?: string; categorySlug?: string; category?: string }) {
  const slug = p.categorySlug || slugify(p.category || "");
  const cat = categoryFallback(slug);
  if (cat !== PLACEHOLDER) return cat;
  const byPrefix = prefixFallback((p.sku || "").toUpperCase());
  return byPrefix || PLACEHOLDER;
}

export function unitLabel(u?: string) {
  const map: Record<string, string> = {
    BAG: "BAG", LENGTH: "LENGTH", EACH: "EACH", LITRE: "LITRE",
    CUBIC_METRE: "m³", METRE: "METRE", BOX: "BOX"
  };
  return map[u || ""] || u || "EACH";
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
