import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import guestRoutes from './routes/guest.route';
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
import discountCodeRoutes from './routes/discountCode.routes';
import helmet from 'helmet';
import { errorHandler } from './middlewares/errorHandler';
import './jobs/abandonedCartReminder'; 
import './jobs/cancelPendingOrders'; 

dotenv.config();
const app = express();

app.use(helmet());
app.use(cors(
    {
  origin: ['https://mymango-new-wz5s.vercel.app'],
}
));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));


app.use('/guest', guestRoutes);
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
app.use('/discount-codes', discountCodeRoutes);


app.use(errorHandler);


export default app;
