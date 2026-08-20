import { describe, expect, it } from "vitest";
import { getCart, setCart } from "./api";

describe("enquiry cart", () => {
  it("stores lines in localStorage", () => {
    setCart([{ sku: "CEM-PPC-50", name: "PPC Cement 50kg", qty: 100, price: 10.5 }]);
    expect(getCart()[0].qty).toBe(100);
  });
});
