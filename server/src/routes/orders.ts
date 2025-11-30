import express, { Request, Response } from 'express';
import { auth, roleAuth, AuthRequest } from '../middleware/auth';
import Order, { Stage } from '../models/Order';
import Log from '../models/Log';

const router = express.Router();

// Get orders for buyer (only their active order)
router.get('/buyer', auth, roleAuth(['buyer']), async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findOne({ buyer: req.user._id, isDeleted: false }).populate('seller', 'name email');
    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch order', error });
  }
});

// Create order (buyer)
router.post('/', auth, roleAuth(['buyer']), async (req: AuthRequest, res: Response) => {
  try {
    const activeOrder = await Order.findOne({ buyer: req.user._id, isDeleted: false });
    if (activeOrder) {
      return res.status(400).json({ message: 'Buyer can only have one active order' });
    }
    const { items } = req.body;
    const orderId = `ORD-${Date.now()}`;
    const order = new Order({ orderId, items, buyer: req.user._id });
    await order.save();
    const log = new Log({ order: order._id, action: 'Order Created', performedBy: req.user._id });
    await log.save();
    req.app.locals.emitOrderUpdate(order._id.toString());
    res.status(201).json({ order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create order', error });
  }
});

// Get orders for seller
router.get('/seller', auth, roleAuth(['seller']), async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find({ seller: req.user._id, isDeleted: false }).populate('buyer', 'name email');
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error });
  }
});

// Move to next stage (seller)
router.put('/:id/next-stage', auth, roleAuth(['seller']), async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order || order.seller?.toString() !== req.user._id.toString() || order.isDeleted) {
      return res.status(404).json({ message: 'Order not found or not assigned' });
    }
    const stages: Stage[] = ['Order Placed', 'Buyer Associated', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
    const currentIndex = stages.indexOf(order.currentStage);
    if (currentIndex >= stages.length - 1) {
      return res.status(400).json({ message: 'Order already delivered' });
    }
    const nextStage = stages[currentIndex + 1];
    order.currentStage = nextStage;
    order.stageTimestamps[nextStage] = new Date();
    await order.save();
    const log = new Log({ order: order._id, action: `Stage changed to ${nextStage}`, performedBy: req.user._id });
    await log.save();
    req.app.locals.emitOrderUpdate(order._id.toString());
    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update stage', error });
  }
});

// Delete order (seller)
router.delete('/:id', auth, roleAuth(['seller']), async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order || order.seller?.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Order not found' });
    }
    order.isDeleted = true;
    await order.save();
    const log = new Log({ order: order._id, action: 'Order Deleted', performedBy: req.user._id });
    await log.save();
    res.json({ message: 'Order deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete order', error });
  }
});

export default router;
