import { Request, Response } from 'express';
import prisma from '../db/prisma';
import { CustomRequest } from '../middlewares/authenticate';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import dayjs from 'dayjs';
import PDFDocument from 'pdfkit';


type OrderItemInput = {
  productId?: number;
  variantId?: number;
  quantity: number;
  price: number;
};

// Create new order for authenticated user
export const createOrder = async (req: CustomRequest, res: Response) => {
  const userId = req.user?.userId;
  const {
    items,
    addressId,
    totalAmount,
    paymentMethod,
  }: {
    items: OrderItemInput[];
    addressId: number;
    totalAmount: number;
    paymentMethod: string;
  } = req.body;

  if (!userId) {
     res.status(401).json({ message: 'Unauthorized' });
     return
  }

  try {
    const createItems = items.map((item, idx) => {
      const hasProduct = typeof item.productId === 'number';
      const hasVariant = typeof item.variantId === 'number';

      if (!hasProduct && !hasVariant) {
        throw new Error(`Item ${idx + 1}: Must have either productId or variantId.`);
      }

      if (hasProduct && hasVariant) {
        throw new Error(`Item ${idx + 1}: Cannot have both productId and variantId.`);
      }

      return {
        productId: hasProduct ? item.productId : null,
        variantId: hasVariant ? item.variantId : null,
        quantity: item.quantity,
        price: item.price,
      };
    });

    const payment = await prisma.payment.create({
      data: {
        method: paymentMethod,
        status: PaymentStatus.PENDING,
      },
    });

    const order = await prisma.order.create({
      data: {
        userId,
        addressId,
        totalAmount,
        status: OrderStatus.PENDING,
        paymentId: payment.id,
        items: {
          create: createItems,
        },
      },
      include: {
        items: true,
        payment: true,
      },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order failed:', error);
    res.status(500).json({ message: 'Failed to create order', error });
  }
};

// Get orders for logged in user
export const getUserOrders = async (req: CustomRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
     res.status(401).json({ message: 'Unauthorized' });
     return
  }

  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        payment: true,
        address: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  } catch (error) {
    console.error('Fetch orders failed:', error);
    res.status(500).json({ message: 'Failed to fetch orders', error });
  }
};

// Get a specific order by ID for the logged-in user
export const getOrderById = async (req: CustomRequest, res: Response) => {
  const userId = req.user?.userId;
  const { id } = req.params;

  if (!userId) {
     res.status(401).json({ message: 'Unauthorized' });
     return;
  }

  try {
    const order = await prisma.order.findFirst({
      where: {
        id: Number(id),
        userId,
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        payment: true,
        address: true,
      },
    });

    if (!order) {
       res.status(404).json({ message: 'Order not found' });
        return;
    }

    res.json(order);
  } catch (error) {
    console.error('Fetch order by ID failed:', error);
    res.status(500).json({ message: 'Failed to fetch order', error });
  }
};

// Helper to format address safely
function formatAddress(address: any): string {
  if (!address) return 'N/A';

  return [
    address.addressLine,
    address.landmark,
    address.city,
    address.state,
    address.country || 'India',
    address.pincode,
  ].filter(Boolean).join(', ');
}

// GET single order info as JSON invoice response
export const getSingleOrder = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const orderIdStr = req.params.id;

    if (!userId) {
       res.status(401).json({ message: 'Unauthorized' });
       return
    }

    // Validate orderId param as number
    const orderId = Number(orderIdStr);
    if (!orderIdStr || isNaN(orderId)) {
       res.status(400).json({ message: 'Invalid or missing order ID' });
       return
    }
    console.log(orderIdStr, orderId);

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: {
          include: {
            product: { include: { category: true } },
            variant: { include: { images: true } },
          },
        },
        user: { include: { profile: true } },
        address: true,
        payment: true,
      },
    });

    if (!order) {
       res.status(404).json({ message: 'Order not found' });
       return
    }

    const invoiceResponse = {
      message: '',
      total_pages: 1,
      current_page: 1,
      page_size: 20,
      results: [
        {
          id: `COM-${order.id}-${order.user.profile?.firstName || 'USER'}`,
          purchased_item_count: order.items.length,
          customer_info: {
            first_name: order.user.profile?.firstName || '',
            last_name: order.user.profile?.lastName || '',
            country_code_for_phone_number: null,
            phone_number: order.address.phone,
            email: order.user.email,
            billing_address: formatAddress(order.address),
            delivery_address: formatAddress(order.address),
          },
          order_info: {
            sub_total: order.totalAmount,
            abendoned_price: 0,
            tax: 0,
            discount: 0,
            discount_coupon_type: '',
            discount_coupon_code: '',
            discount_coupon_value: 0,
            discount_speding_title: '',
            discount_speding_discount_percentage: '',
            discount_speding_discount_price: '',
            delivery_charge: 0,
            final_total: order.totalAmount,
            order_status: order.status,
            invoice_url: `/order/invoice?id=COM-${order.id}-${order.user.profile?.firstName}`,
            created_at_formatted: dayjs(order.createdAt).format('DD/MM/YYYY, hh:mmA'),
            created_at: dayjs(order.createdAt).format('DD MMMM YYYY, hh:mmA'),
          },
          payment_info: {
            is_payment_done: order.payment?.status === 'SUCCESS',
            payment_transaction_id: order.payment?.transactionId || '',
            payment_type: order.payment?.method || 'N/A',
          },
          items: order.items.map(item => ({
            id: item.id,
            variant_id: item.variantId || null,
            name: item.variant?.name || item.product?.name || 'Unnamed Product',
            SKU: `SKU-${item.variantId || item.productId || item.id}`,
            image: item.variant?.images[0]?.url || item.product?.imageUrl || '',
            unit_price: item.price.toFixed(2),
            quantity: item.quantity,
            category: item.product?.category?.name || 'General',
            specification: item.variant?.name || '',
          })),
        },
      ],
    };

    res.status(200).json(invoiceResponse);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// PDF invoice generator endpoint
export const generateInvoicePDF = async (req: Request, res: Response) => {
  try {
    const orderIdStr = req.query.id as string;

    if (!orderIdStr || !orderIdStr.includes('-')) {
      res.status(400).send('Invalid invoice ID format');
      return;
    }

    const parts = orderIdStr.split('-');
    const orderId = Number(parts[1]);

    if (isNaN(orderId)) {
      res.status(400).send('Invalid order ID');
      return;
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: { include: { category: true } },
            variant: { include: { images: true } },
          },
        },
        user: { include: { profile: true } },
        address: true,
        payment: true,
      },
    });

    if (!order) {
      res.status(404).send('Order not found');
      return;
    }

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.id}.pdf`);
    doc.pipe(res);

    // Colors
    const primaryColor = '#007bff'; // blue
    const headerBgColor = '#e9ecef'; // light gray for header background
    const rowAltColor = '#f8f9fa'; // very light gray for alternating rows

    // ==== Header ====
    doc
      .fillColor(primaryColor)
      .fontSize(20)
      .text('INVOICE', { align: 'center' })
      .moveDown();

    doc.fillColor('black');

    // ==== Customer Info ====
    doc.fontSize(12)
      .text(`Invoice ID: COM-${order.id}-${order.user.profile?.firstName || ''}`)
      .text(`Customer: ${order.user.profile?.firstName || ''} ${order.user.profile?.lastName || ''}`)
      .text(`Email: ${order.user.email}`)
      .text(`Phone: ${order.address.phone}`)
      .text(`Address: ${formatAddress(order.address)}`)
      .text(`Date: ${new Date(order.createdAt).toLocaleString()}`)
      .text(`Payment Method: ${order.payment?.method || 'N/A'}`)
      .text(`Order Status: ${order.status}`)
      .moveDown();

    // ==== Items Table Header Background ====
    const tableTop = doc.y;
    doc.rect(50, tableTop, 500, 20).fill(headerBgColor);

    // Header Text in Bold
    doc
      .fillColor('black')
      .font('Helvetica-Bold')
      .fontSize(12)
      .text('Item', 55, tableTop + 5)
      .text('Qty', 255, tableTop + 5)
      .text('Unit Price', 320, tableTop + 5)
      .text('Total', 420, tableTop + 5);

    doc.moveDown();

    // Reset font and fill color for rows
    doc.font('Helvetica').fontSize(12);

    // ==== Table Rows with alternating background colors ====
    let y = tableTop + 20;
    order.items.forEach((item, index) => {
      const isEven = index % 2 === 0;
      if (isEven) {
        doc.rect(50, y, 500, 20).fill(rowAltColor);
      }
      doc.fillColor('black');

      const name = item.variant?.name || item.product?.name || 'Unnamed Product';
      const qty = item.quantity;
      const unitPrice = item.price;
      const totalPrice = qty * unitPrice;

      doc.text(name, 55, y + 5);
      doc.text(qty.toString(), 255, y + 5);
      doc.text(`₹${unitPrice.toFixed(2)}`, 320, y + 5);
      doc.text(`₹${totalPrice.toFixed(2)}`, 420, y + 5);

      y += 20;
    });

    // Draw line below table
    doc
      .strokeColor(primaryColor)
      .lineWidth(1)
      .moveTo(50, y)
      .lineTo(550, y)
      .stroke();

    doc.moveDown();

    // ==== Grand Total ====
    doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .fillColor(primaryColor)
      .text(`Grand Total: ₹${order.totalAmount.toFixed(2)}`, { align: 'right' });

    doc.end();
  } catch (error) {
    console.error('PDF generation failed:', error);
    res.status(500).send('Internal Server Error');
  }
};

