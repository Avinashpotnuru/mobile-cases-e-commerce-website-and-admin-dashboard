import { Badge } from "@/components/ui/badge";

export function ActiveStatusBadge({ active }: { active: boolean }) {
  return active ? (
    <Badge variant="success">Active</Badge>
  ) : (
    <Badge variant="secondary">Archived</Badge>
  );
}