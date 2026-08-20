export const CAT_IMG: Record<string, string> = {
  "cement-concrete": "/img/cement.jpg",
  timber: "/img/timber.jpg",
  roofing: "/img/roof.jpg",
  "bricks-blocks": "/img/brick.jpg",
  plumbing: "/img/pipe.jpg",
  electrical: "/img/cable.jpg",
  paint: "/img/paint.jpg",
  "doors-windows": "/img/door.jpg",
  tools: "/img/tools.jpg",
  "sand-aggregates": "/img/sand.jpg"
};

export const CAT_STORY: Record<string, { kicker: string; points: string[]; cta: string }> = {
  "cement-concrete": { kicker: "Foundation strength", points: ["PPC & Lafarge", "Masonry cement", "Bonding agents", "Bulk bags available"], cta: "Shop cement" },
  timber: { kicker: "Pine & structural", points: ["Pine", "Structural timber", "Boards", "Cut-to-size available"], cta: "Shop timber" },
  roofing: { kicker: "Cover the build", points: ["IBR 3m–6m", "Corrugated", "Ridges & screws", "Flashing"], cta: "Shop roofing" },
  "bricks-blocks": { kicker: "Walls that last", points: ["Clay brick", "6 inch blocks", "Maxi brick", "Paving"], cta: "Shop bricks" },
  plumbing: { kicker: "Water in, waste out", points: ["PVC pipe", "Tanks", "Sinks", "Sanitaryware"], cta: "Shop plumbing" },
  electrical: { kicker: "Power the house", points: ["Copper cable", "Geysers", "DB boards", "Switches"], cta: "Shop electrical" },
  paint: { kicker: "Finish with colour", points: ["20L interior", "Exterior", "Primers", "Brushes"], cta: "Shop paint" },
  "doors-windows": { kicker: "Secure the opening", points: ["Security doors", "Hardwood", "Frames", "Aluminium windows"], cta: "Shop doors" },
  tools: { kicker: "Site ready", points: ["Angle grinders", "Cordless drills", "Wheelbarrows", "Hand tools"], cta: "Shop tools" },
  "sand-aggregates": { kicker: "Mix & fill", points: ["Builders sand", "River sand", "Stone", "Crusher dust"], cta: "Shop aggregates" }
};

const SKU_IMG: Record<string, string> = {
  "CEM-LAF-50": "/img/cement2.jpg",
  "ELC-GEY-150": "/img/geyser.jpg",
  "PLB-TOI-CLS": "/img/toilet.jpg",
  "PLB-TAP-MIX": "/img/tap.jpg",
  "TOL-WHEL-65": "/img/wheelbarrow.jpg",
  "AGG-STN-19": "/img/sand.jpg",
  "AGG-SAND-BLD": "/img/sand.jpg",
  "AGG-SAND-RIV": "/img/sand.jpg"
};

export function merchSrc(p: { sku?: string; categorySlug?: string; category?: string; imageUrl?: string }) {
  const sku = (p.sku || "").toUpperCase();
  if (SKU_IMG[sku]) return SKU_IMG[sku];
  if (sku.startsWith("CEM-")) return "/img/cement.jpg";
  if (sku.startsWith("TIM-")) return "/img/timber.jpg";
  if (sku.startsWith("ROF-")) return "/img/roof.jpg";
  if (sku.startsWith("BRK-")) return "/img/brick.jpg";
  if (sku.startsWith("PLB-TOI")) return "/img/toilet.jpg";
  if (sku.startsWith("PLB-TAP")) return "/img/tap.jpg";
  if (sku.startsWith("PLB-")) return "/img/pipe.jpg";
  if (sku.startsWith("ELC-GEY")) return "/img/geyser.jpg";
  if (sku.startsWith("ELC-")) return "/img/cable.jpg";
  if (sku.startsWith("PNT-")) return "/img/paint.jpg";
  if (sku.startsWith("DOR-") || sku.startsWith("WIN-")) return "/img/door.jpg";
  if (sku.startsWith("TOL-")) return "/img/tools.jpg";
  if (sku.startsWith("AGG-")) return "/img/sand.jpg";
  const slug = p.categorySlug || slugify(p.category || "");
  if (slug && CAT_IMG[slug]) return CAT_IMG[slug];
  if (p.imageUrl && p.imageUrl.startsWith("/img/") && p.imageUrl.endsWith(".jpg")) return p.imageUrl;
  return "/img/tools.jpg";
}

export function slugify(name: string) {
  return name.toLowerCase().replace(/&/g, "").replace(/\s+/g, "-");
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
  if (status === "OUT_OF_STOCK" || inStock === false) return "CONTACT BRANCH";
  return "IN STOCK";
}

export const FEATURED_SKUS = [
  "CEM-PPC-50", "CEM-LAF-50", "TIM-PINE-38-114-3600", "TIM-PINE-38-114-6000",
  "ROF-IBR-3M", "ROF-IBR-48", "PNT-WHT-20", "ELC-GEY-150"
];
