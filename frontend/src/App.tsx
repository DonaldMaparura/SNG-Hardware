import { Navigate, Route, Routes } from "react-router-dom";
import React from "react";
import { token } from "./api";
import {
  AboutPage, Branches, CartPage, CategoriesPage, Contact, DeliveryPage,
  Home, ProductPage, QuotePage, Shop, StaffLogin, StoreLayout, TimberCutPage, TradePage
} from "./Storefront";
import Console from "./console/Console";

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
        <Route path="/invoice" element={<QuotePage />} />
        <Route path="/quote" element={<Navigate to="/invoice" replace />} />
        <Route path="/invoice-list" element={<CartPage />} />
        <Route path="/cart" element={<Navigate to="/invoice-list" replace />} />
        <Route path="/account" element={<Navigate to="/invoice" replace />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/trade" element={<TradePage />} />
        <Route path="/delivery" element={<DeliveryPage />} />
        <Route path="/timber-cut" element={<TimberCutPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </StoreLayout>
  );
}
