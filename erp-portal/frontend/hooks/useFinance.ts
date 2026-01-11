import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Invoice } from '../types/finance';

export const useFinance = (period: string) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryRes, invoicesRes] = await Promise.all([
        api.get(`/finance/summary?period=${period}`),
        api.get('/finance/invoices')
      ]);
      setStats(summaryRes.data);
      setInvoices(invoicesRes.data);
    } catch (error) {
      console.error('Error fetching finance:', error);
      toast.error('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  return { loading, stats, invoices, refetch: fetchData };
};
