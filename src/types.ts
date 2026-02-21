export interface User {
  id: number;
  username: string;
  role: 'admin' | 'operator';
  status: 'active' | 'inactive';
  language: 'fr' | 'ar';
  created_at: string;
}

export interface Property {
  id: string;
  name: string;
  province: string;
  region: string;
  status: 'rented' | 'available' | 'maintenance';
  rent_amount: number;
  payment_status: 'paid' | 'unpaid' | 'overdue' | 'doubtful';
  type: 'apartment' | 'villa' | 'shop' | 'office' | 'warehouse';
  area: number;
  rooms: number;
  description: string;
  created_at: string;
}

export interface Tenant {
  id: number;
  name: string;
  whatsapp: string;
  property_id: string;
  payment_status: string;
  id_card: string;
  rating: 'excellent' | 'good' | 'average' | 'bad';
  notes: string;
}

export interface Payment {
  id: number;
  property_id: string;
  tenant_id: number;
  amount: number;
  date: string;
  operator_id: number;
  method: 'cash' | 'bank' | 'check' | 'mobile';
  status: string;
  receipt_path: string;
  property_name?: string;
  tenant_name?: string;
  operator_name?: string;
}

export interface Stats {
  totalProperties: number;
  rentedProperties: number;
  totalRent: number;
  totalDebt: number;
  activeUsers: number;
}
