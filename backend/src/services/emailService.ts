import nodemailer from 'nodemailer';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(process.env.SMTP_PORT) || 587,
        auth: { user, pass }
      });
      this.isConfigured = true;
    }
  }

  public async sendEmail({ to, subject, html }: EmailPayload): Promise<boolean> {
    if (this.isConfigured && this.transporter) {
      try {
        await this.transporter.sendMail({
          from: process.env.SMTP_FROM || '"VedicVeda Heritage" <orders@vedicveda.com>',
          to,
          subject,
          html
        });
        console.log(`[EmailService] Sent email to ${to}: "${subject}"`);
        return true;
      } catch (error) {
        console.error('[EmailService] SMTP error, falling back to mock delivery:', error);
      }
    }

    // Mock development mode logger
    console.log('\n================== ✉️ MOCK EMAIL DISPATCHED ==================');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('------------------------------------------------------------');
    console.log(html.replace(/<[^>]+>/g, ' ').substring(0, 300) + '...');
    console.log('============================================================\n');
    return true;
  }

  public async sendOrderConfirmation(order: any): Promise<boolean> {
    const itemsHtml = order.items.map((item: any) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.productName} (${item.size})</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.price.toLocaleString('en-IN')}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.total.toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #E2D9C8; border-radius: 8px; background-color: #FCFAF5;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #D4AF37;">
          <h1 style="color: #0F172A; margin: 0; font-size: 26px;">🕉️ VedicVeda Heritage</h1>
          <p style="color: #64748B; margin: 4px 0 0 0;">Consecrated Sacred Yantras, Gemstones & Spiritual Artefacts</p>
        </div>
        <div style="padding: 20px 0;">
          <h2 style="color: #0F172A;">Pranam ${order.customerName},</h2>
          <p>Thank you for choosing VedicVeda. Your order <strong>#${order.orderNumber}</strong> has been successfully placed and received by our temple consecration desk.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #0F172A; color: #FFFFFF;">
                <th style="padding: 10px; text-align: left;">Item</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Price</th>
                <th style="padding: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 8px; text-align: right; font-weight: bold;">Subtotal:</td>
                <td style="padding: 8px; text-align: right;">₹${order.subtotal.toLocaleString('en-IN')}</td>
              </tr>
              ${order.discount > 0 ? `
              <tr>
                <td colspan="3" style="padding: 8px; text-align: right; color: #16A34A; font-weight: bold;">Discount Applied:</td>
                <td style="padding: 8px; text-align: right; color: #16A34A;">-₹${order.discount.toLocaleString('en-IN')}</td>
              </tr>` : ''}
              <tr>
                <td colspan="3" style="padding: 8px; text-align: right; font-weight: bold;">Shipping:</td>
                <td style="padding: 8px; text-align: right;">${order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</td>
              </tr>
              <tr style="font-size: 16px; font-weight: bold; background-color: #E2D9C8;">
                <td colspan="3" style="padding: 10px; text-align: right;">Grand Total:</td>
                <td style="padding: 10px; text-align: right; color: #0F172A;">₹${order.totalAmount.toLocaleString('en-IN')}</td>
              </tr>
            </tfoot>
          </table>

          <div style="background-color: #FFFFFF; padding: 15px; border-radius: 6px; border: 1px solid #E2E8F0; margin-top: 20px;">
            <h4 style="margin: 0 0 8px 0; color: #0F172A;">Delivery Details:</h4>
            <p style="margin: 0; color: #475569; font-size: 14px;">
              ${JSON.parse(order.shippingAddress || '{}').addressLine1 || ''}, 
              ${JSON.parse(order.shippingAddress || '{}').city || ''}, 
              ${JSON.parse(order.shippingAddress || '{}').state || ''} - 
              ${JSON.parse(order.shippingAddress || '{}').pincode || ''}
            </p>
          </div>
          
          <p style="margin-top: 25px; color: #475569; font-size: 14px;">
            Every artefact undergoes traditional sanctification prior to dispatch. You will receive a tracking link as soon as your package is handed to our insured logistics partner.
          </p>
        </div>
        <div style="border-top: 1px solid #E2D9C8; padding-top: 15px; text-align: center; color: #94A3B8; font-size: 12px;">
          © 2026 VedicVeda Heritage Pvt. Ltd. | Customer Support: support@vedicveda.com
        </div>
      </div>
    `;

    return this.sendEmail({
      to: order.customerEmail,
      subject: `🕉️ Order Confirmed: #${order.orderNumber} - VedicVeda Heritage`,
      html
    });
  }

  public async sendStatusUpdate(order: any, status: string, trackingNumber?: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #E2D9C8; border-radius: 8px; background-color: #FCFAF5;">
        <h2 style="color: #0F172A;">Update on Order #${order.orderNumber}</h2>
        <p>Your order status has been updated to: <strong style="color: #D4AF37;">${status}</strong></p>
        ${trackingNumber ? `<p><strong>Courier Tracking Number:</strong> ${trackingNumber}</p>` : ''}
        <p>Thank you for choosing VedicVeda Heritage.</p>
      </div>
    `;

    return this.sendEmail({
      to: order.customerEmail,
      subject: `Order #${order.orderNumber} Status Update: ${status}`,
      html
    });
  }
}

export const emailService = new EmailService();
