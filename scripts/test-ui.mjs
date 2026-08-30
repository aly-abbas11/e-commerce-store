import { chromium } from 'playwright';
import fs from 'fs';

async function run() {
  console.log("Starting custom UI test for Admin Panel...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[BROWSER ERROR] ${msg.text()}`);
    }
  });

  try {
    console.log("Navigating to /admin/login...");
    await page.goto("http://localhost:3000/admin/login", { waitUntil: "networkidle" });
    await page.screenshot({ path: "ui-test-login.png" });

    // Wait for the password input and login button
    await page.fill('input[type="password"]', 'vg_PLvuGw3mTW-pC0NvpI8401dVEcTNsPjP');
    await page.click('button[type="submit"]');

    console.log("Waiting for Dashboard/Broadcast to load...");
    await page.waitForTimeout(3000); 
    await page.screenshot({ path: "ui-test-dashboard.png" });

    // Try navigating to Orders
    console.log("Navigating to Orders...");
    await page.goto("http://localhost:3000/admin/orders", { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "ui-test-orders.png" });

    // Try navigating to Products
    console.log("Navigating to Products...");
    await page.goto("http://localhost:3000/admin/products", { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "ui-test-products.png" });

    console.log("UI Test Complete. Check screenshots and browser errors.");
  } catch (err) {
    console.error("Test script failed:", err.message);
  } finally {
    await browser.close();
  }
}

run();
