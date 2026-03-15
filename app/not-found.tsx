import { OpaqueNotFoundView } from "@/components/state/OpaqueNotFoundView";

// Rule FE-001: MANDATORY custom 404.
// Must NOT reveal: route paths, stack traces, framework version, or whether route exists.
export default function NotFound() {
  return <OpaqueNotFoundView />;
}
