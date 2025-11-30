import express, { Request, Response } from 'express';
import { auth, roleAuth, AuthRequest } from '../middleware/auth';
import Order from '../models/Order';
import Log from '../models/Log';
import User from '../models/User';

const router = express.Router();

// Get all orders (admin)
router.get('/orders', auth, roleAuth(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find({ isDeleted: false }).populate('buyer', 'name email').populate('seller', 'name email');
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error });
  }
});

// Associate buyer to order (admin)
router.put('/orders/:id/associate-buyer', auth, roleAuth(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { buyerId } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order || order.isDeleted) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.currentStage !== 'Order Placed') {
      return res.status(400).json({ message: 'Buyer can only be associated at Order Placed stage' });
    }
    const buyer = await User.findById(buyerId);
    if (!buyer || buyer.role !== 'buyer') {
      return res.status(400).json({ message: 'Invalid buyer' });
    }
    order.buyer = buyerId;
    order.currentStage = 'Buyer Associated';
    order.stageTimestamps['Buyer Associated'] = new Date();
    await order.save();
    const log = new Log({ order: order._id, action: 'Buyer Associated', performedBy: req.user._id });
    await log.save();
    req.app.locals.emitOrderUpdate(order._id.toString());
    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to associate buyer', error });
  }
});

// Associate seller to order (admin)
router.put('/orders/:id/associate-seller', auth, roleAuth(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { sellerId } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order || order.isDeleted) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.currentStage !== 'Buyer Associated') {
      return res.status(400).json({ message: 'Seller can only be associated at Buyer Associated stage' });
    }
    const seller = await User.findById(sellerId);
    if (!seller || seller.role !== 'seller') {
      return res.status(400).json({ message: 'Invalid seller' });
    }
    order.seller = sellerId;
    order.currentStage = 'Processing';
    order.stageTimestamps['Processing'] = new Date();
    await order.save();
    const log = new Log({ order: order._id, action: 'Seller Associated', performedBy: req.user._id });
    await log.save();
    req.app.locals.emitOrderUpdate(order._id.toString());
    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to associate seller', error });
  }
});

// View order details (admin)
router.get('/orders/:id/details', auth, roleAuth(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id).populate('buyer', 'name email').populate('seller', 'name email');
    if (!order || order.isDeleted) {
      return res.status(404).json({ message: 'Order not found' });
    }
    const logs = await Log.find({ order: order._id }).populate('performedBy', 'name email role');
    const stageDurations = calculateStageDurations(order.stageTimestamps);
    res.json({ order, logs, stageDurations });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch details', error });
  }
});

// Get buyers (admin)
router.get('/buyers', auth, roleAuth(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const buyers = await User.find({ role: 'buyer' }, 'name email');
    res.json({ buyers });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch buyers', error });
  }
});

// Get sellers (admin)
router.get('/sellers', auth, roleAuth(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const sellers = await User.find({ role: 'seller' }, 'name email');
    res.json({ sellers });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch sellers', error });
  }
});

// Get stats (admin)
router.get('/stats', auth, roleAuth(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const totalOrders = await Order.countDocuments({ isDeleted: false });
    const ordersByStage = await Order.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$currentStage', count: { $sum: 1 } } }
    ]);
    const avgDeliveryTime = await calculateAvgDeliveryTime();
    res.json({ totalOrders, ordersByStage, avgDeliveryTime });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats', error });
  }
});

const calculateStageDurations = (stageTimestamps: Record<string, Date>) => {
  const stages = ['Order Placed', 'Buyer Associated', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
  const durations: Record<string, number> = {};
  for (let i = 0; i < stages.length - 1; i++) {
    const start = stageTimestamps[stages[i]];
    const end = stageTimestamps[stages[i + 1]];
    if (start && end) {
      durations[`${stages[i]} to ${stages[i + 1]}`] = end.getTime() - start.getTime();
    }
  }
  return durations;
};

const calculateAvgDeliveryTime = async () => {
  const deliveredOrders = await Order.find({ currentStage: 'Delivered', isDeleted: false });
  if (deliveredOrders.length === 0) return 0;
  const totalTime = deliveredOrders.reduce((sum, order) => {
    const start = order.stageTimestamps['Order Placed'];
    const end = order.stageTimestamps['Delivered'];
    if (start && end) {
      return sum + (end.getTime() - start.getTime());
    }
    return sum;
  }, 0);
  return totalTime / deliveredOrders.length;
};

export default router;
