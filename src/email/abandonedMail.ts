import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendAbandonedCartEmail = async (
  email: string,
  products: { name: string | number; discount: number }[]
) => {
  const productList = products
    .map(
      p =>
        `<tr>
          <td style="padding:8px 12px;border:1px solid #eee;">${p.name}</td>
          <td style="padding:8px 12px;border:1px solid #eee;text-align:center;color:#388e3c;font-weight:bold;">${p.discount}% OFF</td>
        </tr>`
    )
    .join('');

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fafafa;padding:32px 24px;border-radius:8px;border:1px solid #eee;">
    <h2 style="color:#222;text-align:center;">🛒 Don't miss out! You have items waiting in your cart.</h2>
    <p style="font-size:16px;color:#444;text-align:center;">
      Complete your purchase now and enjoy exclusive discounts on these products:
    </p>
    <table style="width:100%;border-collapse:collapse;margin:24px 0;">
      <thead>
        <tr>
          <th style="background:#f5f5f5;padding:10px 12px;border:1px solid #eee;text-align:left;">Product</th>
          <th style="background:#f5f5f5;padding:10px 12px;border:1px solid #eee;text-align:center;">Discount</th>
        </tr>
      </thead>
      <tbody>
        ${productList}
      </tbody>
    </table>
    <p style="font-size:15px;color:#d32f2f;text-align:center;">
      Hurry, this offer is valid only for a limited time!
    </p>
    <p style="font-size:12px;color:#888;text-align:center;margin-top:32px;">
      If you have already completed your purchase, please ignore this email.
    </p>
  </div>
  `;

  await transporter.sendMail({
    from: '"E-COM" <no-reply@ecom.com>',
    to: email,
    subject: 'You have items waiting! Enjoy 10% OFF on your abandoned cart',
    html,
  });
};