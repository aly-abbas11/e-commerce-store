### Task 5: Client bootstrap queue

**Files:**
- Create: `lib/first-party-analytics.ts`
- Test: `lib/first-party-analytics.test.ts`

**Interfaces:**
- Consumes: Task 1 sanitizers (or duplicate pathname-only helper to keep this module browser-safe without pulling server secrets â€” **import only pure functions** from ingest-rules)
- Produces: `createFirstPartyClient`, `shouldCollectPath`, `captureLandingAttribution`

`shouldCollectPath(pathname)`: false for `/admin`, `/home2`, `/product2` (use `isGadgetPreviewPath`).

`createFirstPartyClient({ fetch, getHref, getReferrer })`:

- On construct, `captureLandingAttribution()` from href search + sanitized referrer **synchronously**.
- `track(event)` returns immediately (fail-open). Pushes onto a queue.
- A single worker: first request sends with `attribution`. Later requests wait until the first `fetch` promise settles, then send **without** requiring attribution (server ignores after first-touch).
- Each `track` gets a new `event_id` (`crypto.randomUUID`). Retry of the same queue item reuses that id.
- `fetch` errors swallowed.

- [ ] **Step 1: Failing test â€” cookie-less double fire**

Fake `fetch` that resolves only after both `track` calls were invoked:

```ts
it("sends the first event before the second on a cookie-less PDP", async () => {
  const calls: string[] = [];
  let release!: () => void;
  const gate = new Promise<void>((r) => (release = r));
  const client = createFirstPartyClient({
    fetch: async (_url, init) => {
      const body = JSON.parse(String(init?.body));
      calls.push(body.name);
      if (calls.length === 1) await gate;
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    },
    getHref: () => "https://shop.test/product/pad?utm_source=tiktok&ttclid=abc",
    getReferrer: () => "https://www.tiktok.com/t/x?foo=1",
  });
  const p1 = client.track({ name: "page_view", path: "/product/pad", page_type: "product" });
  const p2 = client.track({
    name: "product_view",
    path: "/product/pad",
    page_type: "product",
    product_id: "11111111-1111-4111-8111-111111111111",
  });
  await Promise.resolve();
  assert.deepEqual(calls, ["page_view"]);
  release();
  await Promise.all([p1, p2]);
  assert.deepEqual(calls, ["page_view", "product_view"]);
  // first body has attribution.utm_source tiktok and sanitized referrer without query
});
```

Also: `shouldCollectPath("/home2") === false`, `/admin/analytics` false, `/product/pad` true.

- [ ] **Step 2â€“4:** RED â†’ implement sequential queue â†’ PASS
