import { Badge } from "@/components/ui/badge";
import type { ProductStatus } from "@/types/catalog";

export function ActiveStatusBadge({ active }: { active: boolean }) {
  return active ? (
    <Badge variant="success">Active</Badge>
  ) : (
    <Badge variant="secondary">Archived</Badge>
  );
}

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  switch (status) {
    case "active":
      return <Badge variant="success">Active</Badge>;
    case "draft":
      return <Badge variant="outline">Draft</Badge>;
    case "archived":
      return <Badge variant="secondary">Archived</Badge>;
  }
}