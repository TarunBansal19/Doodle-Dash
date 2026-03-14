import { useEffect , useState , useRef } from "react";

export default function Chat({socket , roomId}){
    const [messages , setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
    }

    useEffect(()=>{
        scrollToBottom();
    }, [messages]); //when page reloads or message changes we scroll to the bottom of the chat

    useEffect(()=> {
        if(!socket) return;

        socket.on('receive-message' , (message)=> {
            setMessages((previousMessages) => [...previousMessages, message]);
        })

        return ()=> {
            socket.off('receive-message');
        }
    } , [socket]);

    const sendMessage = (e) => {
        e.preventDefault();
        if(currentMessage.trim()!==''){
            socket.emit('send-message' , {roomId, message: currentMessage});
            setCurrentMessage('');
        }
    }
    return (
    <div style={{ width: '300px', height: '600px', border: '2px solid #333', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', marginLeft: '20px' }}>
      <div style={{ padding: '10px', backgroundColor: '#3b82f6', color: 'white', fontWeight: 'bold', borderBottom: '2px solid #333' }}>
        Room Chat: {roomId}
      </div>
      
      {/* Messages Area */}
      <div style={{ flex: 1, padding: '10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ textAlign: 'left', backgroundColor: '#f3f4f6', padding: '8px', borderRadius: '5px' }}>
            <span style={{ fontWeight: 'bold', color: '#555', fontSize: '12px' }}>{msg.sender}: </span>
            <span>{msg.text}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} style={{ display: 'flex', borderTop: '2px solid #333' }}>
        <input
          type="text"
          placeholder="Type your guess..."
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          style={{ flex: 1, padding: '10px', border: 'none', outline: 'none' }}
        />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
          Send
        </button>
      </form>
    </div>
  );
}