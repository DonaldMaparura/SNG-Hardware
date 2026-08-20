from pathlib import Path
p = Path(r"C:\Users\admin\IdeaProjects\SNG Hardware\frontend\src\App.tsx")
text = p.read_text(encoding="utf-8")
idx = text.find("function Console()")
assert idx > 0, "Console not found"
console = text[idx:]
head = r'''import { Navigate, Route, Routes, Link, useNavigate } from "react-router-dom";
import React, { useEffect, useMemo, useState } from "react";
import { api, CartLine, currentUser, logout, token } from "./api";
import {
  AccountPage, AboutPage, Branches, CartPage, CategoriesPage, Contact, DeliveryPage,
  Home, ProductPage, QuotePage, Shop, StaffLogin, StoreLayout, TimberCutPage, TradePage, homeFor
} from "./Storefront";
import type { Product } from "./Storefront";

function money(n?: number) {
  return `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<StaffLogin />} />
      <Route path="/app/*" element={<RequireAuth><Console /></RequireAuth>} />
      <Route path="/*" element={<Store />} />
    </Routes>
  );
}

function RequireAuth({ children }: { children: React.ReactElement }) {
  if (!token()) return <Navigate to="/login" replace />;
  return children;
}

function Store() {
  return (
    <StoreLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:category" element={<Shop />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/product/:sku" element={<ProductPage />} />
        <Route path="/specials" element={<Shop promotion />} />
        <Route path="/branches" element={<Branches />} />
        <Route path="/quote" element={<QuotePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/trade" element={<TradePage />} />
        <Route path="/delivery" element={<DeliveryPage />} />
        <Route path="/timber-cut" element={<TimberCutPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </StoreLayout>
  );
}

'''
p.write_text(head + console, encoding="utf-8")
print("ok", len(head + console))
