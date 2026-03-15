import type { Metadata } from "next";
import { notFound } from "next/navigation";

/**
 * Internal rewrite target used by `proxy.ts` for route-enumeration prevention.
 *
 * We never link to this route directly. The request proxy rewrites blocked
 * protected-route hits here so unauthorized and non-existent routes resolve to
 * the same Not Found boundary and status code.
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function OpaqueNotFoundPage() {
  notFound();
}
