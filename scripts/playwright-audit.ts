import { chromium } from "playwright";

async function runAudit() {
  console.log("🚀 Starting Playwright Browser Audit for https://voltgear-pi.vercel.app ...\n");
  const browser = await chromium.launch({ headless: true });
  
  // Test Desktop Viewport
  console.log("🖥️ Testing Desktop Viewport (1440x900)...");
  const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];
  
  desktopPage.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });
  
  desktopPage.on("response", (res) => {
    if (res.status() >= 400) {
      failedRequests.push(`${res.status()} ${res.url()}`);
    }
  });
  
  const startTime = Date.now();
  await desktopPage.goto("https://voltgear-pi.vercel.app", { waitUntil: "networkidle" });
  const desktopLoadTime = Date.now() - startTime;
  
  console.log(`✅ Desktop page loaded in ${desktopLoadTime}ms`);
  console.log(`Console Errors (${consoleErrors.length}):`, consoleErrors);
  console.log(`Failed Requests 404/500 (${failedRequests.length}):`, failedRequests);
  
  // Test Mobile Viewport (Moto G / iPhone width 390px)
  console.log("\n📱 Testing Mobile Viewport (390x844)...");
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  
  const mobileConsoleErrors: string[] = [];
  const mobileFailedRequests: string[] = [];
  
  mobilePage.on("console", (msg) => {
    if (msg.type() === "error") {
      mobileConsoleErrors.push(msg.text());
    }
  });
  
  mobilePage.on("response", (res) => {
    if (res.status() >= 400) {
      mobileFailedRequests.push(`${res.status()} ${res.url()}`);
    }
  });
  
  const mStartTime = Date.now();
  await mobilePage.goto("https://voltgear-pi.vercel.app", { waitUntil: "networkidle" });
  const mobileLoadTime = Date.now() - mStartTime;
  
  console.log(`✅ Mobile page loaded in ${mobileLoadTime}ms`);
  console.log(`Mobile Console Errors (${mobileConsoleErrors.length}):`, mobileConsoleErrors);
  console.log(`Mobile Failed Requests 404/500 (${mobileFailedRequests.length}):`, mobileFailedRequests);
  
  await browser.close();
  console.log("\n🎉 Playwright Audit Complete!");
}

runAudit().catch(console.error);
