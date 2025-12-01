import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app';
import setupSocket from './socket';

const PORT = process.env.PORT || 5000;

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'https://maheshdeliverymanagmentsystem.netlify.app/',
    methods: ['GET', 'POST'],
  },
});

const { emitOrderUpdate } = setupSocket(io);
app.locals.emitOrderUpdate = emitOrderUpdate;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
