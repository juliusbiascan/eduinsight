import { useState, useEffect } from 'react';
import { getTopDomains, getTopClients, getQueryTypes, getUpstreamServers, getHistory, getClientHistory, getSummary } from "@/lib/pihole";

export const useNetworkData = (interval = 5000) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [
        permitted,
        blocked,
        topClients,
        topBlockedClients,
        queryTypes,
        upstreamServers,
        history,
        clientHistory,
        summary
      ] = await Promise.all([
        getTopDomains(10, false),
        getTopDomains(10, true),
        getTopClients(10, false),
        getTopClients(10, true),
        getQueryTypes(),
        getUpstreamServers(),
        getHistory(),
        getClientHistory(0),
        getSummary()
      ]);

      const formattedHistory = history.map(entry => ({
        ...entry,
        timestamp: new Date(entry.timestamp * 1000).toISOString()
      }));

      setData({
        permitted,
        blocked,
        topClients,
        topBlockedClients,
        queryTypes,
        upstreamServers,
        history: formattedHistory,
        clientHistory,
        summary
      });
    } catch (error) {
      console.error('Error fetching network data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, interval);
    return () => clearInterval(timer);
  }, [interval]);

  return { data, loading, refresh: fetchData };
};
