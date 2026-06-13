export interface Spec {
  key: string;
  value: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  category: string;
  price: number;
  compareAtPrice: number;
  images: string[];
  stock: number;
  sku: string;
  specs: Spec[];
  tags: string[];
  featured: boolean;
  isActive: boolean;
  rating: number;
  numReviews: number;
}

export interface BundleItem {
  product: Product;
  quantity: number;
}

export interface Bundle {
  _id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  items: BundleItem[];
  bundlePrice: number;
  regularPrice: number;
  savings: number;
  isActive: boolean;
  featured: boolean;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

export interface OrderItem {
  kind: 'product' | 'bundle';
  refId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
}

export interface StatusEvent {
  status: string;
  note: string;
  at: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: { name: string; email: string; phone: string };
  shippingAddress: {
    address: string;
    area?: string;
    city: string;
    postcode?: string;
  };
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  trackingCarrier?: string;
  trackingCode?: string;
  statusHistory: StatusEvent[];
  customerNote?: string;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}
