import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, currentUser } from "../api";
import { isCompanyWide, isStoreScoped } from "./roles";

export type Period = "TODAY" | "YESTERDAY" | "THIS_WEEK" | "THIS_MONTH" | "CUSTOM";

export type LocationRow = { id: number; code?: string; name: string; type?: string };

type OpsContextValue = {
  period: Period;
  customFrom: string;
  customTo: string;
  locationId: number | null;
  locations: LocationRow[];
  setPeriod: (p: Period) => void;
  setLocationId: (id: number | null) => void;
  setCustomRange: (from: string, to: string) => void;
  periodLabel: () => string;
  locationLabel: () => string;
  rangeParams: () => { from: string; to: string };
};

const OpsContext = createContext<OpsContextValue | null>(null);

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function computeRange(period: Period, customFrom: string, customTo: string): { from: string; to: string } {
  const now = new Date();
  if (period === "CUSTOM" && customFrom && customTo) {
    return {
      from: startOfDay(new Date(customFrom + "T00:00:00")).toISOString(),
      to: endOfDay(new Date(customTo + "T00:00:00")).toISOString(),
    };
  }
  if (period === "YESTERDAY") {
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    return { from: startOfDay(y).toISOString(), to: endOfDay(y).toISOString() };
  }
  if (period === "THIS_WEEK") {
    const start = startOfDay(now);
    const day = start.getDay();
    const diff = day === 0 ? 6 : day - 1;
    start.setDate(start.getDate() - diff);
    return { from: start.toISOString(), to: endOfDay(now).toISOString() };
  }
  if (period === "THIS_MONTH") {
    const start = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
    return { from: start.toISOString(), to: endOfDay(now).toISOString() };
  }
  return { from: startOfDay(now).toISOString(), to: endOfDay(now).toISOString() };
}

export function OpsProvider({ children }: { children: React.ReactNode }) {
  const user = currentUser();
  const companyWide = user ? isCompanyWide(user.role) : false;
  const storeScoped = user ? isStoreScoped(user.role) : true;

  const [period, setPeriod] = useState<Period>("TODAY");
  const [customFrom, setCustomFrom] = useState(isoDate(new Date()));
  const [customTo, setCustomTo] = useState(isoDate(new Date()));
  const [locationId, setLocationId] = useState<number | null>(() => {
    if (!user) return null;
    if (storeScoped && user.homeLocationId) return user.homeLocationId;
    return null;
  });
  const [locations, setLocations] = useState<LocationRow[]>([]);

  useEffect(() => {
    api<LocationRow[]>("/api/locations")
      .then(rows => setLocations(rows.filter(l => !String(l.type || "").includes("TRUCK") && l.type !== "IN_TRANSIT" && l.type !== "DAMAGE" && l.type !== "CUSTOMER")))
      .catch(() => setLocations([]));
  }, []);

  useEffect(() => {
    if (storeScoped && user?.homeLocationId) setLocationId(user.homeLocationId);
  }, [storeScoped, user?.homeLocationId]);

  const setCustomRange = useCallback((from: string, to: string) => {
    setCustomFrom(from);
    setCustomTo(to);
    setPeriod("CUSTOM");
  }, []);

  const periodLabel = useCallback(() => {
    switch (period) {
      case "YESTERDAY": return "Yesterday";
      case "THIS_WEEK": return "This week";
      case "THIS_MONTH": return "This month";
      case "CUSTOM": return `${customFrom} → ${customTo}`;
      default: return "Today";
    }
  }, [period, customFrom, customTo]);

  const locationLabel = useCallback(() => {
    if (locationId == null) return "All locations";
    const loc = locations.find(l => l.id === locationId);
    return loc?.name || user?.homeLocationName || `Location #${locationId}`;
  }, [locationId, locations, user?.homeLocationName]);

  const rangeParams = useCallback(
    () => computeRange(period, customFrom, customTo),
    [period, customFrom, customTo]
  );

  const value = useMemo<OpsContextValue>(() => ({
    period,
    customFrom,
    customTo,
    locationId: companyWide ? locationId : (user?.homeLocationId || locationId),
    locations,
    setPeriod,
    setLocationId,
    setCustomRange,
    periodLabel,
    locationLabel,
    rangeParams,
  }), [
    period, customFrom, customTo, locationId, locations, companyWide, user?.homeLocationId,
    setCustomRange, periodLabel, locationLabel, rangeParams,
  ]);

  return <OpsContext.Provider value={value}>{children}</OpsContext.Provider>;
}

export function useOps() {
  const ctx = useContext(OpsContext);
  if (!ctx) throw new Error("useOps must be used within OpsProvider");
  return ctx;
}
