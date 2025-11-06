const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

// プロジェクトのルートディレクトリにある静的ファイル（new_game.htmlなど）を配信するように設定します
app.use(express.static(__dirname));

// ルートURL ("/") にアクセスがあった場合に new_game.html を表示します
app.get('/', (req, res) => { res.sendFile(__dirname + '/new_game.html'); });

io.on('connection', (socket) => {
  // Chat functionality (for index.html)
  socket.on('user connected', (clientId) => {
    socket.clientId = clientId;
    console.log(clientId + ' connected');
    socket.emit('welcome', clientId);
    socket.broadcast.emit('user joined', clientId);
  });

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
  
  // Room functionality (for sensor apps)
  socket.on('join', (room) => {
    socket.join(room);
    console.log(`Client joined room: ${room}`);
  });
  
  // Sensor data handling
  socket.on('sensor', (data) => {
    // センサーデータを'game'ルームにいる他のクライアントに送信する
    socket.to('game').emit('sensor', data);
  });

  socket.on('disconnect', () => {
    if (socket.clientId) {
      console.log(socket.clientId + ' disconnected');
      io.emit('user left', socket.clientId);
    } else {
      console.log('Client disconnected');
    }
  });
});

// Renderが指定するポートでリッスンするように修正します
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});