import { Server as SocketServer } from 'socket.io';
import Order from './models/Order';

const setupSocket = (io: SocketServer) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', (userId: string) => {
      socket.join(userId);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  // Function to emit order updates
  const emitOrderUpdate = async (orderId: string) => {
    const order = await Order.findById(orderId).populate('buyer', 'name email').populate('seller', 'name email');
    if (order) {
      if (order.buyer) {
        io.to(order.buyer.toString()).emit('orderUpdate', order);
      }
      if (order.seller) {
        io.to(order.seller.toString()).emit('orderUpdate', order);
      }
      io.emit('adminOrderUpdate', order); // For admin dashboard
    }
  };

  return { emitOrderUpdate };
};

export default setupSocket;
