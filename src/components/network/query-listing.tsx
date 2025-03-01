'use client';

import { DataTable } from "@/components/ui/data-table";
import { Query, getQueries } from "@/lib/pihole";
import { useEffect, useState } from "react";
import { columns } from "./columns";
import { QueryDetails } from "./query-details";

const ITEMS_PER_PAGE = 25;

export default function QueryListingPage() {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);

  const loadQueries = async () => {
    setLoading(true);
    try {
      const response = await getQueries({
        length: ITEMS_PER_PAGE
      });
      setQueries(response.queries);
    } catch (error) {
      console.error('Failed to load queries:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadQueries();
  }, []);

  return (
    <DataTable<Query, any>
      columns={columns}
      data={queries}
      isLoading={loading}
      renderExpanded={(query) => (
        <div className="py-2">
          <QueryDetails query={query} />
        </div>
      )}
    />
  );
}
