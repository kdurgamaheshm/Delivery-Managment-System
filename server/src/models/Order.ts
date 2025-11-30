import mongoose, { Document, Schema } from 'mongoose';

export type Stage = 'Order Placed' | 'Buyer Associated' | 'Processing' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered';

export interface IOrder extends Document {
  orderId: string;
  items: string[];
  buyer?: mongoose.Types.ObjectId;
  seller?: mongoose.Types.ObjectId;
  currentStage: Stage;
  stageTimestamps: Record<string, Date>;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

const OrderSchema: Schema = new Schema({
  orderId: { type: String, required: true, unique: true },
  items: [{ type: String, required: true }],
  buyer: { type: Schema.Types.ObjectId, ref: 'User' },
  seller: { type: Schema.Types.ObjectId, ref: 'User' },
  currentStage: { type: String, enum: ['Order Placed', 'Buyer Associated', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'], default: 'Order Placed' },
  stageTimestamps: {
    type: Object,
    default: { 'Order Placed': new Date() }
  },
  isDeleted: { type: Boolean, default: false },
}, {
  timestamps: true,
});

export default mongoose.model<IOrder>('Order', OrderSchema);
