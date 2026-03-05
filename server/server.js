import express from 'express'
import http, { METHODS } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

const app = express();
app.use(cors());

app.use((req , res , next)=> {
  next();
})

const server = http.createServer(app);

//io allows us to set up a WebSocket server
const io = new Server(server , {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET" , "POST"]
    }
});

//Listen for incoming socket connections from clients
io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on('start-drawing', (data)=> {
    socket.broadcast.emit('start-drawing',data); //broadcast the start-drawing event to all other clients except the one that initiated it
  })

  socket.on('drawing', (data)=> {
    socket.broadcast.emit('drawing',data); //broadcast the drawing event to all other clients except the one that initiated it
  })
  socket.on('disconnect', () => {
    console.log(`User Disconnected: ${socket.id}`);
  });
}); 

const PORT = 4000
server.listen(PORT , ()=>{
    console.log(`Server is listening on PORT ${PORT}`)
});