import type { Metadata } from "next";
import { SavedCasesView } from "@/components/storefront/saved-cases-view";

export const metadata: Metadata = {
  title: "Saved cases",
  description: "Cases you've saved for later.",
};

export default function SavedCasesPage() {
  return <SavedCasesView />;
}