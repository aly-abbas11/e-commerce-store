/* Responsive audit: horizontal overflow + 44px touch targets at 4 breakpoints.
 * Usage: node scripts/responsive-test.mjs  (needs the site running on :3001)
 */
import { chromium } from "playwright";

const BASE = "http://localhost:3001";
const BREAKPOINTS = [375, 768, 1280, 1536];
const ROUTES = ["/", "/products", "/blog", "/checkout", "/search?q=test", "/products/smartwatch"];

const browser = await chromium.launch({ channel: "msedge", headless: true });

for (const width of BREAKPOINTS) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  for (const route of ROUTES) {
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(300);

    const result = await page.evaluate(() => {
      const de = document.documentElement;
      const overflow = de.scrollWidth - de.clientWidth;

      const inScrollable = (el) => {
        let n = el.parentElement;
        while (n) {
          const o = getComputedStyle(n).overflowX;
          if (o === "auto" || o === "scroll" || o === "hidden" || o === "clip") return true;
          n = n.parentElement;
        }
        return false;
      };

      const wideOffenders = [];
      document.querySelectorAll("body *").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width > de.clientWidth + 1 && !inScrollable(el) && getComputedStyle(el).position !== "fixed") {
          wideOffenders.push(
            `${el.tagName}.${String(el.className).split(" ")[0] || ""} ${Math.round(r.width)}px`
          );
        }
      });

      const smallTargets = [];
      document
        .querySelectorAll('a, button, input, select, textarea, [role="button"], summary')
        .forEach((el) => {
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          if (cs.display === "none" || cs.visibility === "hidden") return;
          if (el.closest('[data-lighthouse-ignore]')) return;
          if (r.width === 0 && r.height === 0) return;
          if (r.width < 43.5 || r.height < 43.5) {
            const label = (el.getAttribute("aria-label") || el.textContent || "")
              .trim()
              .slice(0, 24);
            smallTargets.push(
              `${el.tagName} ${r.width.toFixed(0)}x${r.height.toFixed(0)} "${label}"`
            );
          }
        });

      return {
        overflow,
        wideOffenders: [...new Set(wideOffenders)].slice(0, 8),
        smallTargets: [...new Set(smallTargets)].slice(0, 20),
        smallCount: new Set(smallTargets).size,
      };
    });

    const tag =
      result.overflow > 0 || result.wideOffenders.length > 0 ? "OVERFLOW!" : "ok";
    console.log(
      `[${width}px] ${route}  h-scroll=${result.overflow}px ${tag}  small-targets=${result.smallCount}`
    );
    if (result.overflow > 0) {
      console.log("   wide:", result.wideOffenders.join(" | "));
    }
    if (result.smallCount > 0) {
      console.log("   small:", result.smallTargets.join(" ; "));
    }

    await page.screenshot({
      path: `D:/Development/Temp/opencode/shots/${width}-${route.replace(/[/?=]/g, "_")}.png`,
      fullPage: true,
    });

    if (width === 375 && route === "/") {
      await page.click('button[aria-label*="Open cart"]').catch(() => {});
      await page.waitForTimeout(400);
      const drawerResult = await page.evaluate(() => {
        const de = document.documentElement;
        const small = [];
        document.querySelectorAll('[role="dialog"] button').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.width < 43.5 || r.height < 43.5)
            small.push(`${el.tagName} ${r.width.toFixed(0)}x${r.height.toFixed(0)} "${(el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 24)}"`);
        });
        return { overflow: de.scrollWidth - de.clientWidth, small };
      });
      console.log(`   [cart drawer open] overflow=${drawerResult.overflow}px small=${drawerResult.small.length ? drawerResult.small.join(" ; ") : "none"}`);
      await page.screenshot({ path: "D:/Development/Temp/opencode/shots/375-cart-drawer.png" });
    }

    if (width === 375 && route === "/") {
      await page.keyboard.press("Escape");
      await page.click('button[aria-label="Open menu"]').catch(() => {});
      await page.waitForTimeout(300);
      const navResult = await page.evaluate(() => {
        const de = document.documentElement;
        return { overflow: de.scrollWidth - de.clientWidth };
      });
      console.log(`   [mobile nav open] h-scroll=${navResult.overflow}px`);
      await page.screenshot({ path: "D:/Development/Temp/opencode/shots/375-mobile-nav.png" });
    }
  }
  await page.close();
}

await browser.close();
console.log("\nDone. Screenshots in D:/Development/Temp/opencode/shots/");
