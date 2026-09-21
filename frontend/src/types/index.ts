export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF' | 'CUSTOMER';
  avatar?: string;
  status?: string;
  createdAt?: string;
  addresses?: Address[];
}

export interface Address {
  id?: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  _count?: { products: number };
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: string;
  sku: string;
  price: number;
  specialPrice?: number | null;
  stock: number;
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  images?: string;
  helpfulCount?: number;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  productCode: string;
  name: string;
  slug: string;
  description?: string;
  spiritualSignificance?: string;
  specifications?: string;
  categoryId: string;
  category: Category;
  basePrice: number;
  specialPrice?: number | null;
  isActive: boolean;
  isFeatured: boolean;
  isBestseller: boolean;
  isLimitedDrop?: boolean;
  mood?: string;
  viewCount?: number;
  rating: number;
  reviewCount: number;
  variants: ProductVariant[];
  images: ProductImage[];
  reviews?: Review[];
}

export interface CartItem {
  id: string;
  variantId: string;
  productId: string;
  name: string;
  code: string;
  size: string;
  sku: string;
  price: number;
  originalPrice: number;
  stock: number;
  quantity: number;
  total: number;
  image: string;
}

export interface OrderItem {
  id: string;
  productName: string;
  productCode: string;
  size: string;
  price: number;
  quantity: number;
  total: number;
  product?: {
    images?: ProductImage[];
  };
}

export interface Payment {
  id: string;
  transactionId: string;
  provider: string;
  amount: number;
  status: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  billingAddress: string;
  subtotal: number;
  discount: number;
  taxAmount: number;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  trackingNumber?: string;
  courierName?: string;
  notes?: string;
  createdAt: string;
  items: OrderItem[];
  payments?: Payment[];
}

export interface InvoiceDetails {
  invoiceNumber: string;
  invoiceDate: string;
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: any;
  billingAddress: any;
  items: Array<{
    name: string;
    code: string;
    size: string;
    hsn: string;
    qty: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  cgst: number;
  sgst: number;
  igst: number;
  shippingFee: number;
  grandTotal: number;
  paymentMethod: string;
  paymentStatus: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  placement: string;
  isActive: boolean;
  displayOrder: number;
}

export interface Announcement {
  id: string;
  text: string;
  link?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface FlashSale {
  id: string;
  title: string;
  description?: string;
  bannerImage?: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  productIds?: string;
  products?: Product[];
}

export interface RewardHistory {
  id: string;
  points: number;
  type: string;
  notes?: string;
  createdAt: string;
}

export interface ReferralInfo {
  code: string;
  totalReferrals: number;
  rewardPerReferral: number;
}

export interface AbandonedCartRecord {
  id: string;
  customerEmail?: string;
  customerPhone?: string;
  subtotal: number;
  itemsSnapshot: string;
  isRecovered: boolean;
  lastActiveAt: string;
  createdAt: string;
}
