import mongoose, { Document, Schema } from 'mongoose';

export interface ILog extends Document {
  order: mongoose.Types.ObjectId;
  action: string;
  performedBy: mongoose.Types.ObjectId;
  timestamp: Date;
}

const LogSchema: Schema = new Schema({
  order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  action: { type: String, required: true },
  performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model<ILog>('Log', LogSchema);
