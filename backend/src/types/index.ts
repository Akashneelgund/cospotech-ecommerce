import { Request } from 'express';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'STAFF' | 'CUSTOMER';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export interface AddressData {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface CheckoutPayload {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: AddressData;
  billingAddress?: AddressData;
  deliveryMethod?: string;
  paymentMethod: 'RAZORPAY' | 'UPI' | 'CARD' | 'COD' | 'MOCK';
  couponCode?: string;
  notes?: string;
  items?: Array<{
    productId: string;
    variantId: string;
    quantity: number;
  }>;
}
