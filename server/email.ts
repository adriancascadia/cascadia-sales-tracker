import { ENV } from './_core/env';
import { logger } from './_core/logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface OrderConfirmationData {
  orderNumber: string;
  customerName: string;
  totalAmount: string;
  itemCount: number;
  specialInstructions?: string;
  repName: string;
}

interface VisitReminderData {
  customerName: string;
  visitDate: string;
  visitTime: string;
  repName: string;
  address?: string;
}

interface AlertNotificationData {
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  actionUrl?: string;
}

/**
 * Send email using the built-in notification API
 * This uses the Manus platform's email service
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const response = await fetch(`${ENV.forgeApiUrl}/notification/email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ENV.forgeApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ''),
      }),
    });

    if (!response.ok) {
      logger.error('Email send failed:', { error: await response.text() });
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Error sending email:', { error });
    return false;
  }
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(
  recipientEmail: string,
  data: OrderConfirmationData
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
          .order-details { background-color: white; padding: 15px; border-radius: 4px; margin: 15px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-row:last-child { border-bottom: none; }
          .label { font-weight: bold; color: #666; }
          .value { color: #333; }
          .total { font-size: 18px; font-weight: bold; color: #2563eb; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation</h1>
            <p>Order #${data.orderNumber}</p>
          </div>
          <div class="content">
            <p>Hi ${data.customerName},</p>
            <p>Thank you for your order! Here are the details:</p>
            
            <div class="order-details">
              <div class="detail-row">
                <span class="label">Order Number:</span>
                <span class="value">${data.orderNumber}</span>
              </div>
              <div class="detail-row">
                <span class="label">Items:</span>
                <span class="value">${data.itemCount} product(s)</span>
              </div>
              <div class="detail-row">
                <span class="label">Total Amount:</span>
                <span class="value total">$${data.totalAmount}</span>
              </div>
              <div class="detail-row">
                <span class="label">Sales Rep:</span>
                <span class="value">${data.repName}</span>
              </div>
              ${data.specialInstructions ? `
              <div class="detail-row">
                <span class="label">Special Instructions:</span>
                <span class="value">${data.specialInstructions}</span>
              </div>
              ` : ''}
            </div>
            
            <p>Your order has been received and will be processed shortly. You will receive a shipping confirmation once your order ships.</p>
            
            <p>If you have any questions, please contact your sales representative ${data.repName}.</p>
          </div>
          <div class="footer">
            <p>© 2025 SalesForce Tracker. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: recipientEmail,
    subject: `Order Confirmation - ${data.orderNumber}`,
    html,
  });
}

/**
 * Send visit reminder email
 */
export async function sendVisitReminderEmail(
  recipientEmail: string,
  data: VisitReminderData
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f59e0b; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
          .visit-details { background-color: white; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #f59e0b; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .label { font-weight: bold; color: #666; }
          .value { color: #333; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Upcoming Visit Reminder</h1>
          </div>
          <div class="content">
            <p>Hi ${data.customerName},</p>
            <p>This is a reminder that your sales representative will be visiting you soon.</p>
            
            <div class="visit-details">
              <div class="detail-row">
                <span class="label">Date:</span>
                <span class="value">${data.visitDate}</span>
              </div>
              <div class="detail-row">
                <span class="label">Time:</span>
                <span class="value">${data.visitTime}</span>
              </div>
              <div class="detail-row">
                <span class="label">Sales Rep:</span>
                <span class="value">${data.repName}</span>
              </div>
              ${data.address ? `
              <div class="detail-row">
                <span class="label">Location:</span>
                <span class="value">${data.address}</span>
              </div>
              ` : ''}
            </div>
            
            <p>If you need to reschedule or have any questions, please contact ${data.repName} directly.</p>
          </div>
          <div class="footer">
            <p>© 2025 SalesForce Tracker. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: recipientEmail,
    subject: `Visit Reminder - ${data.visitDate}`,
    html,
  });
}

/**
 * Send alert notification email to manager
 */
export async function sendAlertEmail(
  recipientEmail: string,
  data: AlertNotificationData
): Promise<boolean> {
  const severityColors = {
    info: '#3b82f6',
    warning: '#f59e0b',
    error: '#ef4444',
  };

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: ${severityColors[data.severity]}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
          .alert-box { background-color: white; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid ${severityColors[data.severity]}; }
          .severity-badge { display: inline-block; background-color: ${severityColors[data.severity]}; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; }
          .button { display: inline-block; background-color: ${severityColors[data.severity]}; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; margin-top: 15px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${data.title}</h1>
            <span class="severity-badge">${data.severity.toUpperCase()}</span>
          </div>
          <div class="content">
            <div class="alert-box">
              <p>${data.message}</p>
            </div>
            
            ${data.actionUrl ? `
            <a href="${data.actionUrl}" class="button">View Details</a>
            ` : ''}
          </div>
          <div class="footer">
            <p>© 2025 SalesForce Tracker. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: recipientEmail,
    subject: `[${data.severity.toUpperCase()}] ${data.title}`,
    html,
  });
}
