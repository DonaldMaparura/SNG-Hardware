/** Verified public SNG Hardware / Builders One Stop business details. Do not invent locations. */

export const SNG = {
  brand: "SNG Hardware",
  tagline: "Builders One Stop",
  slogan: "Every Little Helps",
  currencyPrefix: "US$",
  headOffice: {
    label: "Head Office",
    address: "21626 Tarisa Road",
    suburb: "Damofalls Ruwa",
    full: "21626 Tarisa Road, Damofalls Ruwa"
  },
  email: "snghardware@gmail.com",
  website: "www.buildersonestop.co.zw",
  facebook: "SNG Hardware",
  facebookUrl: "https://www.facebook.com/",
  instagram: "Builders One Stop",
  instagramUrl: "https://www.instagram.com/",
  /** Primary public phone (Damofalls Ruwa) */
  primaryPhone: "0776410181",
  primaryPhoneDisplay: "0776 410 181",
  contacts: [
    { name: "Damofalls Ruwa", phone: "0776410181", display: "0776 410 181", whatsapp: "263776410181" },
    { name: "Mbare Magaba", phone: "0787663663", display: "0787 663 663", whatsapp: "263787663663" },
    { name: "Simon Mazorodze", phone: "0775663663", display: "0775 663 663", whatsapp: "263775663663" },
    { name: "Trabablas Fidelity", phone: "0786602860", display: "0786 602 860", whatsapp: "263786602860" }
  ]
} as const;

export function telHref(phone: string) {
  return "tel:+263" + phone.replace(/^0/, "");
}

export function waHref(whatsapp: string, text?: string) {
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${whatsapp}${q}`;
}

export function money(n?: number) {
  return `${SNG.currencyPrefix}${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function isBulkCategory(slug?: string, sku?: string) {
  const s = (sku || "").toUpperCase();
  const c = (slug || "").toLowerCase();
  if (s.startsWith("CEM-") || s.startsWith("TIM-") || s.startsWith("ROF-") || s.startsWith("AGG-") || s.startsWith("BRK-")) return true;
  return ["cement-concrete", "timber", "roofing", "sand-aggregates", "bricks-blocks"].includes(c);
}
