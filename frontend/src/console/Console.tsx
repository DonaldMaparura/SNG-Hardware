import React from "react";
import { NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { currentUser, logout } from "../api";
import { OpsProvider, useOps, Period } from "./OpsContext";
import { homeTitle, isCompanyWide, isStoreScoped, navItems, roleLabel } from "./roles";
import {
  Accounting, Audit, Customers, Enquiries, Fleet, Inventory, More, Orders,
  Overview, Pos, Purchasing, Reports, Stores, Till, Timber, Transfers, Trips, Warehouse,
} from "./pages";
import "./console.css";

export default function Console() {
  return (
    <OpsProvider>
      <ConsoleShell />
    </OpsProvider>
  );
}

function ConsoleShell() {
  const user = currentUser()!;
  const nav = useNavigate();
  const ops = useOps();
  const items = navItems(user.role);
  const company = isCompanyWide(user.role);
  const store = isStoreScoped(user.role);

  return (
    <div className="ops-shell">
      <aside className="ops-sidebar">
        <div className="ops-brand">
          <img src="/img/logo.png" alt="SNG Hardware" />
          <div className="ops-brand-name">SNG Hardware</div>
          <div className="ops-brand-loc">
            {store ? (user.homeLocationName || homeTitle(user.role)) : homeTitle(user.role)}
          </div>
        </div>
        <nav className="ops-nav">
          {items.map(i => (
            <NavLink key={i.to} to={i.to} end={i.to === "/app"}>
              {i.label}
            </NavLink>
          ))}
        </nav>
        <div className="ops-user">
          <strong>{user.fullName}</strong>
          <span>{roleLabel(user.role).toLowerCase()}</span>
          <a
            className="ops-logout"
            href="/"
            onClick={e => {
              e.preventDefault();
              logout();
              nav("/");
            }}
          >
            Logout
          </a>
        </div>
      </aside>

      <div className="ops-main">
        <div className="ops-bar">
          <label>
            Period
            <select
              value={ops.period}
              onChange={e => ops.setPeriod(e.target.value as Period)}
            >
              <option value="TODAY">Today</option>
              <option value="YESTERDAY">Yesterday</option>
              <option value="THIS_WEEK">This week</option>
              <option value="THIS_MONTH">This month</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </label>
          {ops.period === "CUSTOM" && (
            <>
              <label>
                From
                <input
                  type="date"
                  value={ops.customFrom}
                  onChange={e => ops.setCustomRange(e.target.value, ops.customTo)}
                />
              </label>
              <label>
                To
                <input
                  type="date"
                  value={ops.customTo}
                  onChange={e => ops.setCustomRange(ops.customFrom, e.target.value)}
                />
              </label>
            </>
          )}
          {company && !store && (
            <label>
              Location
              <select
                value={ops.locationId ?? ""}
                onChange={e => {
                  const v = e.target.value;
                  ops.setLocationId(v === "" ? null : Number(v));
                }}
              >
                <option value="">All locations</option>
                {ops.locations.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </label>
          )}
          <div className="ops-bar-meta">
            {ops.periodLabel()}
            {company && !store ? ` · ${ops.locationLabel()}` : user.homeLocationName ? ` · ${user.homeLocationName}` : ""}
          </div>
        </div>

        <div className="ops-content">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/branch" element={<Overview />} />
            <Route path="/pos" element={<Pos />} />
            <Route path="/till" element={<Till />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/warehouse" element={<Warehouse />} />
            <Route path="/enquiries" element={<Enquiries />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/transfers" element={<Transfers />} />
            <Route path="/timber" element={<Timber />} />
            <Route path="/fleet" element={<Fleet />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/purchasing" element={<Purchasing />} />
            <Route path="/accounting" element={<Accounting />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/audit" element={<Audit />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/stores" element={<Stores />} />
            <Route path="/more" element={<More />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
