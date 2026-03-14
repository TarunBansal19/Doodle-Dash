import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

const app = express();
app.use(cors());

app.use((req, res, next) => {
  next();
})

const server = http.createServer(app);

//io allows us to set up a WebSocket server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const gameStates = {};
const WORDS = ['apple', 'banana', 'sunflower', 'mountain', 'guitar'];








//Listen for incoming socket connections from clients
io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`User Disconnected: ${socket.id}`);
  });

  socket.on('join-room', (roomId) => { //when a client emit the 'join-room' event with a roomId , we add the client to that room
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);

    if(!gameStates[roomId]){
      const randomWord = WORDS[Math.floor(Math.random()*WORDS.length)]
      gameStates[roomId] = {secretWord: randomWord};
      console.log(`Secret word for room ${roomId} is : ${randomWord}`)
    }
    console.log(`User ${socket.id} joined room ${roomId}`);
  })
  socket.on('start-drawing', ({ roomId, data }) => {
    socket.to(roomId).emit('start-drawing', data); //broadcast the start-drawing event to all clients in the room except the one that initiated it
  })

  socket.on('drawing', ({ roomId, data }) => {
    socket.to(roomId).emit('drawing', data); //broadcast the drawing event to all other clients except the one that initiated it
  })

  socket.on('clear-canvas', ({ roomId }) => {
    socket.to(roomId).emit('clear-canvas');
  })

  socket.on('send-message' , ({roomId,message})=> {
    const senderName = `Player_${socket.id.substring(0,3)}`;
    const roomState = gameStates[roomId];

    const guess = message.trim().toLowerCase();

    if(roomState && guess === roomState.secretWord.toLowerCase())
    {
      io.to(roomId).emit('receive-message', {
        sender: 'Inky',
        text: `${senderName} guessed the word! 🎉`
      })
      //io.to(roomId).emit('correct-guess', senderName);
    }else{
      io.to(roomId).emit('receive-message' , {
      sender : senderName,
      text: message
    })
    }
  })
});


const PORT = 4000
server.listen(PORT, () => {
  console.log(`Server is listening on PORT ${PORT}`)
});