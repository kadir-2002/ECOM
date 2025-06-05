import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTPEmail = async (to: string, otp: string) => {
  await transporter.sendMail({
    from: `"MyApp Support" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Reset Password OTP',
    html: `
      <p>Hello,</p>
      <p>Your OTP code to reset your password is:</p>
      <h2>${otp}</h2>
      <p>This code will expire in 10 minutes.</p>
    `,
  });
};
