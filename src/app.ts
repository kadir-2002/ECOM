import express, { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth.route';
import adminRoutes from './routes/admin.route';
import userRoutes from './routes/user.route';
import passwordResetRoutes from './routes/passwordReset.route';
import productRoutes from './routes/product.route';
import categoryRoutes from './routes/category.route';
import cartRoutes from './routes/cart.route';
import addressRoutes from './routes/address.route';
import orderRoutes from './routes/order.route';
import paymentRoutes from './routes/payment.route';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/', (_req, res) => {
  res.send(`<h1 style="font-family:sans-serif" >Part of what makes programming difficult is most of the time we’re doing stuff we’ve never done before.</h1>`);
});


app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/password-reset', passwordResetRoutes);
app.use('/product', productRoutes);
app.use('/category', categoryRoutes);
app.use('/cart', cartRoutes);
app.use('/address', addressRoutes);
app.use('/order', orderRoutes);
app.use('/payment', paymentRoutes);

// helps catch unhandled errors
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong.' });
});

export default app;
