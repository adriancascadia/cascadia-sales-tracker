import PDFDocument from "pdfkit";
import { getOrderById, getOrderItemsByOrderId, getCustomerById, getProductById } from "./db";

interface InvoiceData {
  orderId: number;
  customerName: string;
  customerAddress?: string;
  orderDate: Date;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: string;
    lineTotal: number;
  }>;
  total: number;
  specialInstructions?: string;
}

export async function generateInvoicePDF(orderId: number): Promise<Buffer> {
  // Fetch order data
  const order = await getOrderById(orderId);
  if (!order) {
    throw new Error("Order not found");
  }

  // Fetch customer info
  const customer = await getCustomerById(order.customerId);
  const customerName = customer?.name || "Unknown Customer";
  const customerAddress = customer ? `${customer.address || ""}, ${customer.city || ""}, ${customer.state || ""} ${customer.zipCode || ""}`.trim() : undefined;

  const items = await getOrderItemsByOrderId(orderId);
  
  // Fetch product names for each item
  const itemsWithNames = await Promise.all(
    items.map(async (item) => {
      const product = await getProductById(item.productId);
      return {
        productName: product?.name || "Unknown Product",
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.quantity * parseFloat(item.unitPrice),
      };
    })
  );
  
  const invoiceData: InvoiceData = {
    orderId: order.id,
    customerName,
    customerAddress,
    orderDate: order.createdAt,
    items: itemsWithNames,
    total: order.totalAmount ? parseFloat(order.totalAmount) : 0,
    specialInstructions: order.specialInstructions || undefined,
  };

  return createPDFDocument(invoiceData);
}

function createPDFDocument(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
    doc.on("error", reject);

    // Header
    doc
      .fontSize(20)
      .text("SALES INVOICE", 50, 50, { align: "center" })
      .moveDown();

    // Invoice details
    doc
      .fontSize(10)
      .text(`Invoice #: ${data.orderId}`, 50, 120)
      .text(`Date: ${data.orderDate.toLocaleDateString()}`, 50, 135)
      .moveDown();

    // Customer info
    doc
      .fontSize(12)
      .text("Bill To:", 50, 170)
      .fontSize(10)
      .text(data.customerName, 50, 190);
    
    if (data.customerAddress) {
      doc.text(data.customerAddress, 50, 205);
    }

    // Table header
    const tableTop = 250;
    doc
      .fontSize(10)
      .text("Product", 50, tableTop, { width: 200 })
      .text("Qty", 270, tableTop, { width: 50 })
      .text("Unit Price", 340, tableTop, { width: 80 })
      .text("Total", 440, tableTop, { width: 100, align: "right" });

    // Draw line under header
    doc
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();

    // Table rows
    let yPosition = tableTop + 30;
    data.items.forEach((item) => {
      doc
        .fontSize(9)
        .text(item.productName, 50, yPosition, { width: 200 })
        .text(item.quantity.toString(), 270, yPosition, { width: 50 })
        .text(`$${parseFloat(item.unitPrice).toFixed(2)}`, 340, yPosition, { width: 80 })
        .text(`$${item.lineTotal.toFixed(2)}`, 440, yPosition, { width: 100, align: "right" });
      
      yPosition += 25;
    });

    // Draw line before total
    doc
      .moveTo(50, yPosition + 10)
      .lineTo(550, yPosition + 10)
      .stroke();

    // Total
    doc
      .fontSize(12)
      .text("TOTAL:", 340, yPosition + 25, { width: 100 })
      .text(`$${data.total.toFixed(2)}`, 440, yPosition + 25, { width: 100, align: "right" });

    // Special Instructions section (if they exist)
    if (data.specialInstructions && data.specialInstructions.trim()) {
      const notesY = yPosition + 60;
      doc
        .fontSize(10)
        .text("Special Instructions:", 50, notesY, { underline: true })
        .fontSize(9)
        .text(data.specialInstructions, 50, notesY + 20, { width: 500, align: "left" });
    }

    // Footer
    doc
      .fontSize(8)
      .text(
        "Thank you for your business!",
        50,
        700,
        { align: "center", width: 500 }
      );

    doc.end();
  });
}
