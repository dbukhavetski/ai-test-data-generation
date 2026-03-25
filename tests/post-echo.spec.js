import { test, expect } from "@playwright/test";
import fs from "fs";

const path = "data/customer-orders-chapter-3-masked.json";
const dataset = JSON.parse(fs.readFileSync(path, "utf-8"));

for (const record of dataset) {
  const name = `Echo validates order ${record.orderId}`;
  
  test(name, async ({ request }) => {
    const result = await request.post("https://postman-echo.com/post", {
      data: record,
      headers: { "Content-Type": "application/json" }
    });
    expect(result.ok()).toBeTruthy();

    const body = await result.json();
    expect(body.json).toEqual(record); // round-trip must match

    // --- Structural checks ---
    const requiredKeys = ["orderId","firstName","lastName","email","phoneNumber","status","totalAmount","items"];
    for (const key of requiredKeys) expect(record).toHaveProperty(key);

    // --- Type checks (apply to all records) ---
    expect(typeof record.orderId).toBe("number");
    expect(typeof record.firstName).toBe("string");
    expect(typeof record.lastName).toBe("string");
    expect(typeof record.email).toBe("string");
    expect(typeof record.phoneNumber).toBe("string");
    expect(typeof record.status).toBe("string");
    expect(typeof record.totalAmount).toBe("number");
    
    expect(record.email).toMatch(/^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/);
    expect(record.totalAmount).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(record.items)).toBeTruthy();
    expect(record.items.length).toBeGreaterThan(0);

    for (const it of record.items) {
    expect(typeof it.name).toBe("string");
    expect(typeof it.quantity).toBe("number");
    expect(typeof it.price).toBe("number");
    }

    expect(["Pending","Shipped","Cancelled","Returned","On Hold","Payment Error"])
    .toContain(record.status);
  });
}