export interface Spec {
  key: string;
  value: string;
}

export interface Variant {
  label: string;
  price?: number;
  stock?: number;
  sku?: string;
  images?: string[];
  video?: string;
  image?: string; // legacy single image
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
  video?: string;
  stock: number;
  sku: string;
  specs: Spec[];
  hasVariants?: boolean;
  variantLabel?: string;
  variants?: Variant[];
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

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  country: string;
  featured: boolean;
}

export interface OrderItem {
  kind: 'product' | 'bundle';
  refId: string;
  name: string;
  slug: string;
  image: string;
  variant?: string;
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
  paymentChannel?: string;
  paymentNumber?: string;
  transactionId?: string;
  amountPaid?: number;
  dueAmount?: number;
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

export interface Settings {
  dhakaDeliveryFee: number;
  outsideDeliveryFee: number;
  freeShippingThreshold: number;
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber: string;
  paymentInstructions: string;
}
