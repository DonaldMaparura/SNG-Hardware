export type User = {
  id: number;
  email: string;
  fullName: string;
  role: string;
  homeLocationId: number;
  homeLocationName: string;
};

const TOKEN = "sng.token";
const USER = "sng.user";
const CART = "sng.cart";
const BRANCH = "sng.branch";

export function token() {
  return localStorage.getItem(TOKEN);
}

export function currentUser(): User | null {
  const raw = localStorage.getItem(USER);
  return raw ? JSON.parse(raw) : null;
}

export function setSession(t: string, u: User) {
  localStorage.setItem(TOKEN, t);
  localStorage.setItem(USER, JSON.stringify(u));
}

export function logout() {
  localStorage.removeItem(TOKEN);
  localStorage.removeItem(USER);
}

export type CartLine = { sku: string; name: string; qty: number; price: number; imageUrl?: string };

export function getCart(): CartLine[] {
  const raw = localStorage.getItem(CART);
  return raw ? JSON.parse(raw) : [];
}

export function setCart(lines: CartLine[]) {
  localStorage.setItem(CART, JSON.stringify(lines));
  window.dispatchEvent(new Event("sng-cart"));
}

export function cartQty() {
  return getCart().reduce((s, l) => s + Number(l.qty || 0), 0);
}

export function addCartLine(line: CartLine) {
  const cart = getCart();
  const existing = cart.find(l => l.sku === line.sku);
  if (existing) existing.qty += line.qty;
  else cart.push(line);
  setCart(cart);
}

const VIEWED = "sng.viewed";

export function getViewed(): string[] {
  try {
    const raw = localStorage.getItem(VIEWED);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function pushViewed(sku: string) {
  const next = [sku, ...getViewed().filter(s => s !== sku)].slice(0, 8);
  localStorage.setItem(VIEWED, JSON.stringify(next));
}

export function getBranch(): { id: number; name: string } | null {
  const raw = localStorage.getItem(BRANCH);
  return raw ? JSON.parse(raw) : null;
}

export function setBranch(b: { id: number; name: string } | null) {
  if (!b) localStorage.removeItem(BRANCH);
  else localStorage.setItem(BRANCH, JSON.stringify(b));
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { ...(init.headers as Record<string, string>) };
  if (init.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
  const t = token();
  if (t) headers.Authorization = `Bearer ${t}`;
  const res = await fetch(path, { ...init, headers });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = body.message || message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return text ? JSON.parse(text) : (undefined as T);
}
