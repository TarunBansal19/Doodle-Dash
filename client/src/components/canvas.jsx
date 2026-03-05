import { useEffect, useRef, useState } from 'react';

export default function Canvas({socket}) {
  // We use refs here because we need to mutate these values directly 
  // without triggering a full component re-render every time the mouse moves.
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current; 
    
    // We multiply by 2 and scale to prevent blurry lines on high-resolution screens (like Retina displays)
    canvas.width = 800 * 2;
    canvas.height = 600 * 2;
    canvas.style.width = "800px";
    canvas.style.height = "600px";

    const context = canvas.getContext("2d");
    context.scale(2, 2);
    context.lineCap = "round";
    context.strokeStyle = "black";
    context.lineWidth = 5;
    
    // Store the context in a ref so our drawing functions can access it
    contextRef.current = context;
  }, []);

  useEffect(()=> {
    // Listen for incoming drawing data from the server and draw it on the canvas
    if(!socket) return;

    socket.on('start-drawing', ({offsetX,offsetY})=> {
      contextRef.current.beginPath();
      contextRef.current.moveTo(offsetX,offsetY);
    });

    socket.on('drawing', ({offsetX,offsetY})=> {
      contextRef.current.lineTo(offsetX,offsetY);
      contextRef.current.stroke();
    });

    socket.on('clear-canvas', clearCanvas)

    return () => {
      socket.off('start-drawing');
      socket.off('drawing');
    }
  }, [socket]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    context.clearRect(0,0, canvas.width,canvas.height);

    socket.emit('clear-canvas');
  }

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    // Move the "pen" to the exact coordinates of the mouse click
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);

    //Broadcast the start of a new drawing to the server
    socket.emit('start-drawing', {offsetX,offsetY}); //we send the coordinates of the mouse click to the server so it can broadcast it to other clients
  };

  const finishDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    
    // If we are drawing, draw a line to the new mouse coordinates and add ink (stroke)
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke(); 

    //Broadcast the drawing data
    socket.emit('drawing' , {offsetX,offsetY});
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
      <button 
        onClick={clearCanvas}
        style={{
          marginBottom: '10px',
          padding: '10px 20px',
          backgroundColor: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        🗑️ 
      </button>

      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseMove={draw}
        onMouseLeave={finishDrawing}
        style={{ border: "2px solid #333", cursor: "crosshair", backgroundColor: "#fff" }}
      />
    </div>
  );
}