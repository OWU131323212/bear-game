const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

// publicディレクトリ内の静的ファイル（HTMLやCSSなど）を配信するように設定します
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');

  // 'join' イベントでルームに参加
  socket.on('join', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });

  // 'chat message' イベントでメッセージをブロードキャスト
  socket.on('chat message', (data) => {
    io.emit('chat message', data);
  });

  // 'sensor' イベントでセンサーデータを'game'ルームにブロードキャスト
  socket.on('sensor', (data) => {
    io.to('game').emit('sensor', data);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
