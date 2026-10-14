import * as L from "lucide-react";
import type { LucideProps } from "lucide-react";

/** Render a lucide icon by name (names are stored in the DB for business types). */
export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const C = (L as unknown as Record<string, React.ComponentType<LucideProps>>)[name] ?? L.Store;
  return <C aria-hidden="true" {...props} />;
}
