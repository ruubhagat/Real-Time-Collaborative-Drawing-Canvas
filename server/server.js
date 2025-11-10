const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, '../client')));

let users = {};

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  const color = '#' + Math.floor(Math.random() * 16777215).toString(16);
  users[socket.id] = { color };
  io.emit('user-list', users);

  socket.on('draw', (data) => {
    socket.broadcast.emit('draw', data);
  });

  socket.on('cursor', (data) => {
    socket.broadcast.emit('cursor', { ...data, id: socket.id, color });
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
    delete users[socket.id];
    io.emit('user-list', users);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🌐 Server running at http://localhost:${PORT}`));
