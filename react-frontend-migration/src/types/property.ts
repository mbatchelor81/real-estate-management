export enum PropertyType {
  Residential = 'residential',
  Commercial = 'commercial',
  Industrial = 'industrial',
  Land = 'land',
}

export enum TransactionType {
  ForSale = 'sale',
  ForRent = 'rent',
}

export enum PaymentFrequency {
  Yearly = 'yearly',
  Quarterly = 'quarterly',
  Monthly = 'monthly',
  BiWeekly = 'bi-weekly',
  Weekly = 'weekly',
  Daily = 'daily',
}

export enum PropertiesDisplayOption {
  CardView = 'cards',
  ListView = 'list',
}

export interface Coord {
  lat: number;
  lng: number;
}

export interface Property {
  property_id: string;
  name: string;
  address: string;
  description?: string;
  type: PropertyType;
  transactionType: TransactionType;
  position: Coord;
  price: number;
  paymentFrequency?: PaymentFrequency;
  enquiries?: string[];
  features?: string[];
  images?: string[];
  currency?: string;
  contactNumber?: string;
  contactEmail?: string;
  createdAt?: string;
  updatedAt?: string;
  user_id: string;
}

export interface PropertiesResponse {
  items: Property[];
  lastCreatedAt?: string;
  lastPrice?: string;
  lastName?: string;
  hasMore?: boolean;
}

export interface PropertyFilters {
  sort?: string;
  filter?: string;
  search?: string;
  limit?: number;
  lastCreatedAt?: string;
  lastPrice?: string;
  lastName?: string;
}
