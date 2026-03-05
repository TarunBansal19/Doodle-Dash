import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Canvas from './components/canvas';

const socket = io('http://localhost:4000'); //socket connection to our server

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);

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

  return (
    <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'sans-serif' }}>
      <h1>DoodleDash</h1>
      <h2>
        Connection Status: {isConnected ? "Connected" : "Disconnected"}
      </h2>
      <Canvas socket={socket}/>
    </div>
  );
}

export default App;