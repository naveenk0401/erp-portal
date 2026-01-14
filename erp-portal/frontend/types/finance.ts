export interface Company {
  name: string;
  address: string;
  gst: string;
  contact_person: string;
  email: string;
}

export interface LineItem {
  description: string;
  hsn_sac: string;
  quantity: number;
  rate: number;
  tax_rate: number;
}

export interface PaymentDetails {
  bank_name: string;
  account_no: string;
  ifsc: string;
  mode: string;
}

export interface OrderDetails {
  po_number: string;
  po_date: string;
}

export interface Invoice {
  _id?: string;
  id?: string; // Fallback for some APIs
  invoice_number?: string;
  client_name?: string; // Legacy fallback
  from_company: Company;
  to_company: Company;
  items: LineItem[];
  payment_details: PaymentDetails;
  order_details: OrderDetails;
  due_date: string;
  notes: string;
  status?: 'paid' | 'pending' | 'overdue';
  grand_total?: number;
  amount?: number; // Legacy fallback
  subtotal?: number;
  tax_total?: number;
}
