"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Database } from "lucide-react";

import config from "../../../sanity.config";

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

/**
 * NextStudio mounts a large client-side application. Loading it with
 * `ssr: false` avoids the server-render + hydration double-mount that can
 * trigger the "removeChild" Suspense cleanup error in dev (a React 18.3 /
 * Next.js dev-mode issue). The admin panel is client-only by design.
 */
const Studio = dynamic(
  () => import("next-sanity/studio").then((m) => m.NextStudio),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Loading studio…
      </div>
    ),
  }
);

export default function StudioPage() {
  if (!PROJECT_ID) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
          <Database className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-4 text-xl font-semibold">Sanity is not configured</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Set <code className="rounded bg-muted px-1.5 py-0.5">NEXT_PUBLIC_SANITY_PROJECT_ID</code> in{" "}
            <code className="rounded bg-muted px-1.5 py-0.5">.env.local</code> and restart the dev server to
            open the Studio.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Create a free project at{" "}
            <Link
              href="https://www.sanity.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-2 hover:underline"
            >
              sanity.io
            </Link>{" "}
            and copy the Project ID.
          </p>
        </div>
      </div>
    );
  }

  return <Studio config={config} />;
}
