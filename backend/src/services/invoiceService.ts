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

export class InvoiceService {
  public generateInvoiceData(order: any): InvoiceDetails {
    const shipping = typeof order.shippingAddress === 'string' ? JSON.parse(order.shippingAddress) : order.shippingAddress;
    const billing = typeof order.billingAddress === 'string' ? JSON.parse(order.billingAddress) : (order.billingAddress || shipping);
    
    // Tax calculations (inclusive 3% for precious gemstones/metals or 12% for artisanal crafts)
    const isInterState = (shipping?.state || '').toLowerCase() !== 'karnataka';
    const taxRate = 0.03; // 3% GST on sacred idols, yantras and jewellery
    const taxableSubtotal = order.subtotal - (order.discount || 0);
    const totalTax = Math.round(taxableSubtotal * taxRate);
    
    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (isInterState) {
      igst = totalTax;
    } else {
      cgst = Math.round(totalTax / 2);
      sgst = Math.round(totalTax / 2);
    }

    const items = (order.items || []).map((item: any) => ({
      name: item.productName,
      code: item.productCode || 'V-ART',
      size: item.size || 'Standard',
      hsn: item.productCode?.startsWith('006') || item.productCode?.startsWith('007') ? '7113' : '8306', // 7113 jewellery, 8306 statuettes/ornaments
      qty: item.quantity,
      unitPrice: item.price,
      total: item.total
    }));

    return {
      invoiceNumber: `INV-${order.orderNumber.replace('VEDA-', '')}`,
      invoiceDate: new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      orderNumber: order.orderNumber,
      orderDate: new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      shippingAddress: shipping,
      billingAddress: billing,
      items,
      subtotal: order.subtotal,
      discount: order.discount || 0,
      cgst,
      sgst,
      igst,
      shippingFee: order.shippingFee || 0,
      grandTotal: order.totalAmount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus
    };
  }
}

export const invoiceService = new InvoiceService();
