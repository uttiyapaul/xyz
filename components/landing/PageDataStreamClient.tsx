"use client";

import dynamic from "next/dynamic";

const PageDataStream = dynamic(
  () => import("@/components/landing/PageDataStream"),
  { ssr: false }
);

export default function PageDataStreamClient() {
  return <PageDataStream />;
}
