import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Canvas from './components/canvas';
import Chat from './components/chat'
import bg from './assets/bg.jpg'

const socket = io('http://localhost:4000'); //socket connection to our server

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [roomId , setRoomId] = useState(null);
  const [inputRoomId , setInputRoomId] = useState('');

  useEffect(() => {
    function onConnect() {
      console.log("Connected to server!");
      setIsConnected(true);
    }

    function onDisconnect() {
      console.log("Disconnected from server!");
      setIsConnected(false);
    }
    // Listen for connection and disconnection events from the sever
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    //Clean up the event listeners when the component unmounts
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  const joinRoom = (e) => {
    e.preventDefault(); //stop the form from submitting and refreshig the page
    if(inputRoomId.trim() !== ''){
      socket.emit('join-room' , inputRoomId); //emit the join-room event to server with the roomId as data
      setRoomId(inputRoomId);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px', fontFamily: 'sans-serif', minHeight: '100vh' }}>
      <h1>DoodleDash 🎨</h1>
      <p style={{ color: isConnected ? 'green' : 'red', fontWeight: 'bold' }}>
        {isConnected ? "🟢 Connected to Server" : "🔴 Disconnected"}
      </p>
      
      {!roomId ? (
        <div style={{ marginTop: '50px' }}>
          <h2>Join a Game Room</h2>
          <form onSubmit={joinRoom}>
            <input 
              type="text" 
              placeholder="Enter Room Code" 
              value={inputRoomId}
              onChange={(e) => setInputRoomId(e.target.value)}
              style={{ padding: '10px', fontSize: '16px', marginRight: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
            <button type="submit" style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Join Room
            </button>
          </form>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', marginTop: '20px' }}>
          <Canvas socket={socket} roomId={roomId} />
          <Chat socket={socket} roomId={roomId} />
        </div>
      )}
    </div>
  );
}

export default App;