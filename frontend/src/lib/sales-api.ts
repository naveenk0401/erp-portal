import api from './api';

export interface SalesItemBase {
  item_id: string;
  qty: number;
  price: number;
  tax_ids: string[];
}

export interface SalesItemRead extends SalesItemBase {
  name: string;
  unit: string;
  tax_amount: number;
  line_total: number;
}

export interface Quotation {
  _id: string;
  quote_number: string;
  customer_id: string;
  customer_name: string;
  items: SalesItemRead[];
  subtotal: number;
  tax_total: number;
  grand_total: number;
  status: string;
  valid_until?: string;
  notes?: string;
  created_at: string;
}

export const salesApi = {
  // Quotations
  getQuotations: (params?: any) => api.get('/quotations/', { params }),
  getQuotation: (id: string) => api.get(`/quotations/${id}`),
  createQuotation: (data: any) => api.post('/quotations/', data),
  acceptQuotation: (id: string) => api.post(`/quotations/${id}/accept`),

  // Sales Orders
  getSalesOrders: (params?: any) => api.get('/sales-orders/', { params }),
  getSalesOrder: (id: string) => api.get(`/sales-orders/${id}`),
  createSalesOrder: (data: any) => api.post('/sales-orders/', data),
  confirmSalesOrder: (id: string) => api.post(`/sales-orders/${id}/confirm`),

  // Invoices
  getInvoices: (params?: any) => api.get('/invoices/', { params }),
  getInvoice: (id: string) => api.get(`/invoices/${id}`),
  createInvoice: (data: any) => api.post('/invoices/', data),
  issueInvoice: (id: string) => api.post(`/invoices/${id}/issue`),
};
