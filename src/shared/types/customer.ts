export interface Customer {
  id: string;
  qbId: string;
  name: string;
  phone: string;
  altPhone?: string;
  email?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  notes?: string;
  lastSynced: string;
}
