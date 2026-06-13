import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

const TK = '৳';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  private getTransporter() {
    if (this.transporter) return this.transporter;
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      this.logger.warn('SMTP not configured — emails will be logged only.');
      return null;
    }
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return this.transporter;
  }

  async send(to: string, subject: string, html: string) {
    const transporter = this.getTransporter();
    const from = process.env.MAIL_FROM || 'GadgetGhor <no-reply@gadgetghor.com>';
    if (!transporter) {
      this.logger.log(`[MAIL:dev] To=${to} Subject=${subject}`);
      return { mocked: true };
    }
    try {
      const info = await transporter.sendMail({ from, to, subject, html });
      this.logger.log(`Email sent to ${to}: ${info.messageId}`);
      return { messageId: info.messageId };
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}`, err as any);
      return { error: true };
    }
  }

  private layout(title: string, body: string) {
    return `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#f1f5f6;padding:24px;">
      <div style="max-width:600px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
        <div style="background:#2C8198;padding:20px 28px;">
          <h1 style="color:#fff;margin:0;font-size:22px;">GadgetGhor</h1>
          <p style="color:#d9eef2;margin:4px 0 0;font-size:13px;">Imported gadgets &amp; accessories, delivered across Bangladesh</p>
        </div>
        <div style="padding:28px;color:#1f2937;">
          <h2 style="margin-top:0;color:#234a58;font-size:18px;">${title}</h2>
          ${body}
        </div>
        <div style="background:#f8fafc;padding:18px 28px;color:#64748b;font-size:12px;text-align:center;">
          © GadgetGhor · Dhaka, Bangladesh · support@gadgetghor.com
        </div>
      </div>
    </div>`;
  }

  private itemsTable(order: any) {
    const rows = order.items
      .map(
        (it: any) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;">${it.name} ${
            it.kind === 'bundle' ? '<span style="color:#2C8198;">(Bundle)</span>' : ''
          } × ${it.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${TK}${(
            it.price * it.quantity
          ).toLocaleString('en-BD')}</td>
        </tr>`,
      )
      .join('');
    return `
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0;">
        ${rows}
        <tr><td style="padding:8px 0;text-align:right;color:#64748b;">Subtotal</td><td style="padding:8px 0;text-align:right;">${TK}${order.subtotal.toLocaleString('en-BD')}</td></tr>
        <tr><td style="padding:4px 0;text-align:right;color:#64748b;">Shipping</td><td style="padding:4px 0;text-align:right;">${TK}${order.shippingFee.toLocaleString('en-BD')}</td></tr>
        <tr><td style="padding:8px 0;text-align:right;font-weight:bold;font-size:16px;">Total</td><td style="padding:8px 0;text-align:right;font-weight:bold;font-size:16px;color:#2C8198;">${TK}${order.total.toLocaleString('en-BD')}</td></tr>
      </table>`;
  }

  async sendOrderConfirmation(order: any) {
    const body = `
      <p>Hi ${order.customer.name}, thank you for your order! 🎉</p>
      <p>Your order <strong>#${order.orderNumber}</strong> has been received and is now being processed.</p>
      ${this.itemsTable(order)}
      <p><strong>Delivery address:</strong><br/>
        ${order.shippingAddress.address}, ${order.shippingAddress.area || ''}<br/>
        ${order.shippingAddress.city} ${order.shippingAddress.postcode || ''}<br/>
        📞 ${order.customer.phone}
      </p>
      <p>Payment method: <strong>${order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}</strong></p>
      <p>Track your order anytime at
        <a href="${process.env.FRONTEND_URL}/track?order=${order.orderNumber}" style="color:#2C8198;">gadgetghor.com/track</a>.
      </p>`;
    return this.send(
      order.customer.email,
      `Order Confirmed · #${order.orderNumber} · GadgetGhor`,
      this.layout('Your order is confirmed', body),
    );
  }

  async sendStatusUpdate(order: any, note?: string) {
    const labels: Record<string, string> = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      out_for_delivery: 'Out for delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      returned: 'Returned',
    };
    const body = `
      <p>Hi ${order.customer.name}, your order <strong>#${order.orderNumber}</strong> status is now:</p>
      <p style="font-size:20px;font-weight:bold;color:#2C8198;">${labels[order.status] || order.status}</p>
      ${note ? `<p style="color:#475569;">${note}</p>` : ''}
      ${order.trackingCarrier ? `<p>Carrier: <strong>${order.trackingCarrier}</strong>${order.trackingCode ? ` · Tracking #: <strong>${order.trackingCode}</strong>` : ''}</p>` : ''}
      <p>Follow live updates at
        <a href="${process.env.FRONTEND_URL}/track?order=${order.orderNumber}" style="color:#2C8198;">gadgetghor.com/track</a>.
      </p>`;
    return this.send(
      order.customer.email,
      `Order #${order.orderNumber} · ${labels[order.status] || order.status} · GadgetGhor`,
      this.layout('Order status updated', body),
    );
  }

  async sendContactMessage(data: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
  }) {
    const inbox = process.env.CONTACT_INBOX || process.env.SMTP_USER;
    const body = `
      <p><strong>From:</strong> ${data.name} &lt;${data.email}&gt;</p>
      ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ''}
      ${data.subject ? `<p><strong>Subject:</strong> ${data.subject}</p>` : ''}
      <p style="white-space:pre-wrap;background:#f8fafc;padding:14px;border-radius:8px;">${data.message}</p>`;
    return this.send(
      inbox,
      `Contact form: ${data.subject || 'New message'} — ${data.name}`,
      this.layout('New contact message', body),
    );
  }
}
