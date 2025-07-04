import { transporter } from "./mail";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export const sendOrderConfirmationEmail = async (
  email: string,
  customerName: string,
  orderId: string,
  items: OrderItem[],
  total: number,
  paymentMethod: string
) => {
  const itemRows = items.map(item => `
    <tr>
      <td style="padding:8px 12px;border:1px solid #eee;">${item.name}</td>
      <td style="padding:8px 12px;border:1px solid #eee;text-align:center;">${item.quantity}</td>
      <td style="padding:8px 12px;border:1px solid #eee;text-align:right;">₹${item.price.toFixed(2)}</td>
      <td style="padding:8px 12px;border:1px solid #eee;text-align:right;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fafafa;padding:32px;border-radius:8px;border:1px solid #eee;">
      <h2 style="color:#2e7d32;text-align:center;">✅ Order Confirmed!</h2>
      <p style="font-size:16px;color:#444;text-align:center;">Hi ${customerName}, thanks for shopping with us.</p>
      <p style="font-size:14px;text-align:center;">Your order <strong>#${orderId}</strong> has been successfully placed.</p>

      <table style="width:100%;border-collapse:collapse;margin:20px 0;">
        <thead style="background:#e8f5e9;">
          <tr>
            <th style="padding:10px;border:1px solid #eee;">Product</th>
            <th style="padding:10px;border:1px solid #eee;">Qty</th>
            <th style="padding:10px;border:1px solid #eee;">Unit Price</th>
            <th style="padding:10px;border:1px solid #eee;">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <p style="text-align:right;font-size:16px;font-weight:bold;margin-top:10px;">Grand Total: ₹${total.toFixed(2)}</p>
      <p style="text-align:right;font-size:14px;">Payment Method: ${paymentMethod}</p>

      <p style="font-size:12px;color:#777;text-align:center;margin-top:40px;">You’ll receive another email when your order ships.</p>
    </div>
  `;

  await transporter.sendMail({
    from: '"E-COM" <no-reply@ecom.com>',
    to: email,
    subject: '🧾 Order Confirmation - E-COM',
    html,
  });
};
