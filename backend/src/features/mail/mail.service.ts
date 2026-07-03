import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com';
    const port = this.configService.get<number>('SMTP_PORT') || 587;
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      });
      this.logger.log('Nodemailer SMTP Transporter initialized successfully.');
    } else {
      this.logger.warn(
        'SMTP variables (SMTP_HOST, SMTP_USER, SMTP_PASS) are not set in .env. MailService will run in mock/log mode.',
      );
    }
  }

  /**
   * Send order confirmation email using Nodemailer.
   * You can customize your HTML template and transport configurations here.
   */
  async sendOrderConfirmationEmail(to: string, orderDetails: any): Promise<boolean> {
    const from = this.configService.get<string>('SMTP_FROM') || '"ZSurban Pakistan" <no-reply@zsurban.com>';
    const subject = `ZSurban - Order Confirmed! (ID: #${orderDetails._id})`;

    // Generate product list HTML markup
    const itemsHtml = orderDetails.items
      .map(
        (item: any) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.title}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">PKR ${item.price.toLocaleString()}</td>
      </tr>
    `,
      )
      .join('');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 16px;">
        <div style="text-align: center; border-bottom: 2px solid #00b884; padding-bottom: 15px;">
          <h2 style="color: #18181b; margin: 0;">ZSurban Pakistan</h2>
          <p style="color: #71717a; margin: 5px 0 0 0; font-size: 11px; font-weight: bold; text-transform: uppercase; tracking-wider: 1px;">Order Confirmation</p>
        </div>
        
        <div style="padding: 20px 0;">
          <p style="font-size: 14px; color: #3f3f46;">Dear <strong>${orderDetails.fullName}</strong>,</p>
          <p style="font-size: 14px; color: #3f3f46; line-height: 1.5;">Thank you for shopping with us! We have successfully registered your order. Here is your summary:</p>
          
          <div style="background-color: #f9fafb; border-radius: 12px; padding: 15px; margin: 20px 0; border: 1px solid #f1f5f9;">
            <p style="margin: 0; font-size: 12px; font-weight: bold; color: #00b884;">ORDER ID: #${orderDetails._id}</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #71717a;">Payment Method: <strong>${orderDetails.paymentMethod.toUpperCase()}</strong></p>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="background-color: #f4f4f5; text-align: left; font-weight: bold; color: #71717a;">
                <th style="padding: 8px;">Product</th>
                <th style="padding: 8px; text-align: center;">Qty</th>
                <th style="padding: 8px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="margin-top: 15px; font-size: 13px; color: #3f3f46; text-align: right; line-height: 1.8;">
            <p style="margin: 0;">Subtotal: <strong>PKR ${orderDetails.subtotal.toLocaleString()}</strong></p>
            <p style="margin: 0;">Shipping Fee: <strong>PKR ${orderDetails.shippingFee.toLocaleString()}</strong></p>
            ${orderDetails.discount > 0 ? `<p style="margin: 0; color: #00b884;">Discount: <strong>- PKR ${orderDetails.discount.toLocaleString()}</strong></p>` : ''}
            <p style="margin: 5px 0 0 0; font-size: 15px; font-weight: bold; color: #18181b; border-top: 1px solid #e4e4e7; padding-top: 5px; display: inline-block;">
              Total Charged: PKR ${orderDetails.total.toLocaleString()}
            </p>
          </div>

          <div style="margin-top: 20px; font-size: 13px; color: #3f3f46; border-top: 1px solid #e4e4e7; padding-top: 15px;">
            <p style="margin: 0; font-weight: bold;">Shipping Destination Address:</p>
            <p style="margin: 5px 0 0 0; color: #71717a; line-height: 1.5;">
              ${orderDetails.address}, ${orderDetails.city}, ${orderDetails.province} - ${orderDetails.postalCode}
            </p>
          </div>
        </div>

        <div style="text-align: center; border-top: 1px solid #f4f4f5; padding-top: 15px; font-size: 11px; color: #a1a1aa;">
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} ZSurban Pakistan. All rights reserved.</p>
        </div>
      </div>
    `;

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to,
          subject,
          html: htmlContent,
        });
        this.logger.log(`Order confirmation email sent successfully to ${to}`);
        return true;
      } catch (error) {
        this.logger.error(`Failed to send email to ${to}: ${error.message}`);
        return false;
      }
    } else {
      this.logger.log('--- [MOCK EMAIL LOGGER MODE] ---');
      this.logger.log(`To: ${to}`);
      this.logger.log(`Subject: ${subject}`);
      this.logger.log(`Total: PKR ${orderDetails.total}`);
      this.logger.log('---------------------------------');
      return true;
    }
  }
}
