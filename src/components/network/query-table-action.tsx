'use client';

import { Card } from "@/components/ui/card";
import { QueryFilters } from "./query-filters";

export default function QueryTableAction() {
  return (
    <Card className="p-4">
      <QueryFilters onFiltersChange={(filters) => {
        // Handle filter changes
        console.log(filters);
      }} />
    </Card>
  );
}
