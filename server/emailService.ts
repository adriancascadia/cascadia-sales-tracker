import nodemailer from 'nodemailer';
import * as db from './db';

// Configure email transporter
// In production, use environment variables for SMTP configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface OrderEmailData {
  orderId: number;
  orderNumber: string;
  orderDate: Date;
  customerName: string;
  customerAddress?: string;
  salesRepName: string;
  salesRepEmail?: string;
  items: Array<{
    productName: string;
    sku: string;
    quantity: number;
    price: string;
    total: string;
  }>;
  totalAmount: string;
  specialInstructions?: string;
  distributorName?: string; // Added for multi-distributor context
}

export async function sendOrderToDistributor(
  distributorEmail: string,
  distributorName: string,
  orderData: OrderEmailData
): Promise<boolean> {
  try {
    // If SMTP is not configured, log the order details instead
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('📧 [EMAIL SERVICE] SMTP not configured. Order details:');
      console.log('To:', distributorEmail);
      console.log('Distributor:', distributorName);
      console.log('Order:', orderData.orderNumber);
      console.log('Customer:', orderData.customerName);
      console.log('Total:', orderData.totalAmount);
      console.log('Items:', orderData.items.length);
      
      // Return true to simulate successful send
      return true;
    }

    const itemsHtml = orderData.items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.productName}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.sku}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${item.price}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${item.total}</td>
      </tr>
    `).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .section { margin-bottom: 20px; }
          .label { font-weight: bold; color: #555; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; background-color: white; }
          th { background-color: #f3f4f6; padding: 12px; text-align: left; border-bottom: 2px solid #ddd; }
          .total-row { font-weight: bold; background-color: #f3f4f6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Order Received</h1>
            <p>Order #${orderData.orderNumber}</p>
            ${orderData.distributorName ? `<p style="font-size: 14px; margin-top: 10px;">Items for: ${orderData.distributorName}</p>` : ''}
          </div>
          
          <div class="content">
            <div class="section">
              <h2>Order Details</h2>
              <p><span class="label">Order Number:</span> ${orderData.orderNumber}</p>
              <p><span class="label">Order Date:</span> ${orderData.orderDate.toLocaleDateString()}</p>
              <p><span class="label">Sales Representative:</span> ${orderData.salesRepName}</p>
              ${orderData.salesRepEmail ? `<p><span class="label">Rep Email:</span> ${orderData.salesRepEmail}</p>` : ''}
            </div>
            
            <div class="section">
              <h2>Customer Information</h2>
              <p><span class="label">Customer:</span> ${orderData.customerName}</p>
              ${orderData.customerAddress ? `<p><span class="label">Address:</span> ${orderData.customerAddress}</p>` : ''}
            </div>
            
            <div class="section">
              <h2>Order Items</h2>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: right;">Unit Price</th>
                    <th style="text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                  <tr class="total-row">
                    <td colspan="4" style="padding: 12px; text-align: right;">Total Amount:</td>
                    <td style="padding: 12px; text-align: right;">$${orderData.totalAmount}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            ${orderData.specialInstructions ? `
            <div class="section">
              <h2>Special Instructions</h2>
              <p>${orderData.specialInstructions}</p>
            </div>
            ` : ''}
            
            <div class="section" style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #ddd;">
              <p style="color: #666; font-size: 14px;">
                This order was submitted via SalesForce Tracker. 
                Please process this order and confirm receipt.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: distributorEmail,
      subject: `New Order #${orderData.orderNumber} from ${orderData.customerName}`,
      html: emailHtml,
    });

    console.log('📧 Order email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Failed to send order email:', error);
    return false;
  }
}

/**
 * Send order emails to multiple distributors by splitting the order
 * Returns array of distributor IDs that were successfully emailed
 */
export async function sendOrderEmailsMultiDistributor(orderId: number): Promise<number[]> {
  try {
    // Get order details
    const order = await db.getOrderById(orderId);
    if (!order) {
      console.error('Order not found:', orderId);
      return [];
    }

    // Get customer
    const customer = await db.getCustomerById(order.customerId);
    if (!customer) {
      console.error('Customer not found:', order.customerId);
      return [];
    }

    // Get sales rep
    const salesRep = await db.getUserByOpenId(String(order.userId));
    
    // Get order items with product details
    const items = await db.getOrderItemsByOrderId(orderId);
    const itemsWithDetails = await Promise.all(
      items.map(async (item) => {
        const product = await db.getProductById(item.productId);
        return {
          ...item,
          productName: product?.name || 'Unknown Product',
          sku: product?.sku || '',
          distributorId: product?.distributorId || null,
        };
      })
    );

    // Group items by distributor
    const itemsByDistributor = new Map<number, typeof itemsWithDetails>();
    for (const item of itemsWithDetails) {
      if (!item.distributorId) {
        console.warn(`Product ${item.productName} has no distributor assigned`);
        continue;
      }
      
      if (!itemsByDistributor.has(item.distributorId)) {
        itemsByDistributor.set(item.distributorId, []);
      }
      itemsByDistributor.get(item.distributorId)!.push(item);
    }

    if (itemsByDistributor.size === 0) {
      console.error('No items with assigned distributors found');
      return [];
    }

    console.log(`📦 Order #${order.orderNumber} split into ${itemsByDistributor.size} distributor(s)`);

    // Send email to each distributor
    const successfulDistributors: number[] = [];
    
    for (const [distributorId, distributorItems] of Array.from(itemsByDistributor.entries())) {
      const distributor = await db.getDistributorById(distributorId);
      if (!distributor) {
        console.error('Distributor not found:', distributorId);
        continue;
      }

      // Calculate total for this distributor's items
      const distributorTotal = distributorItems.reduce((sum: number, item: typeof itemsWithDetails[0]) => {
        return sum + parseFloat(item.lineTotal);
      }, 0).toFixed(2);

      const orderData: OrderEmailData = {
        orderId: order.id,
        orderNumber: order.orderNumber,
        orderDate: new Date(order.orderDate),
        customerName: customer.name,
        customerAddress: customer.address ? 
          `${customer.address}, ${customer.city || ''}, ${customer.state || ''} ${customer.zipCode || ''}`.trim() 
          : undefined,
        salesRepName: salesRep?.name || 'Unknown Rep',
        salesRepEmail: salesRep?.email || undefined,
        items: distributorItems.map((item: typeof itemsWithDetails[0]) => ({
          productName: item.productName,
          sku: item.sku,
          quantity: item.quantity,
          price: item.unitPrice,
          total: item.lineTotal,
        })),
        totalAmount: distributorTotal,
        specialInstructions: order.specialInstructions || undefined,
        distributorName: itemsByDistributor.size > 1 ? distributor.name : undefined, // Only show if multi-distributor
      };

      const success = await sendOrderToDistributor(
        distributor.email,
        distributor.name,
        orderData
      );

      if (success) {
        successfulDistributors.push(distributorId);
        console.log(`✅ Sent ${distributorItems.length} items to ${distributor.name}`);
      } else {
        console.error(`❌ Failed to send items to ${distributor.name}`);
      }
    }

    // Update order status if at least one email was sent
    if (successfulDistributors.length > 0) {
      await db.updateOrder(orderId, {
        sentToDistributor: 1,
        sentAt: new Date(),
        status: 'submitted',
      });
    }

    return successfulDistributors;
  } catch (error) {
    console.error('Failed to send order emails:', error);
    return [];
  }
}

/**
 * Legacy function for backward compatibility
 * Now uses multi-distributor logic internally
 */
export async function sendOrderEmail(orderId: number): Promise<boolean> {
  const successfulDistributors = await sendOrderEmailsMultiDistributor(orderId);
  return successfulDistributors.length > 0;
}
