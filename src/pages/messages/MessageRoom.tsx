import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setMessages, webSocketMessageReceived } from '../../store/slices/messageSlice'; // Importa tus acciones
import { webSocketService } from '../../services/webSocketService';
import { messageService } from '../../services/messageService';
import { Message } from '../../types';
import { ArrowLeft } from 'lucide-react';
import { getUserId } from '../../utils/auth';

interface MessageRoomProps {
  roomId: string;
  onBack?: () => void;
}

const MessageRoom: React.FC<MessageRoomProps> = ({ roomId, onBack }) => {
  const dispatch = useDispatch();
  const currentUserId = getUserId();

  const messages = useSelector((state: RootState) => state.messages.messages); // El componente lee desde Redux

  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    if (!roomId) return;

    const fetchHistory = async () => {
      const roomMessages = messages.filter(m => m.roomId === parseInt(roomId, 10));
      if (roomMessages.length === 0) {
        try {
          setLoading(true);
          const history = await messageService.getMessagesForRoom(roomId);
          dispatch(setMessages(history)); // Carga el historial inicial
        } catch (error) {
          console.error('Failed to fetch message history', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false); 
      }
    };
    
    fetchHistory();

  }, [roomId, dispatch]); 

  // Efecto para hacer scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && roomId && webSocketService.isConnected()) {
      webSocketService.sendMessage({
        roomId: parseInt(roomId, 10),
        message: newMessage,
      });
      setNewMessage('');
    }
  };
  
  if (loading) return <div>Loading message history...</div>;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Room Header */}
      <div className="p-4 border-b border-gray-200 flex items-center space-x-4">
        {onBack && (
          <button onClick={onBack} className="md:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft size={20} />
          </button>
        )}
        <h2 className="text-lg font-semibold">Chat</h2>
      </div>

      <div className="flex-grow overflow-y-auto mb-4 p-4">
        {messages.filter(msg => msg.roomId === parseInt(roomId, 10)).map((msg) => {
          const isSender = msg.userId === currentUserId;
          
          console.log(`Message: ${msg.id}, SenderID: ${msg.senderId}, UserID: ${currentUserId}, IsSender: ${isSender}`);

          return (
            <div
              key={msg.id}
              className={`flex my-2 ${isSender ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`px-3 py-2 rounded-lg max-w-xs lg:max-w-md shadow-sm ${
                  isSender
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <p className="text-sm">{msg.message}</p>
                <p className={`text-xs opacity-90 mt-1 ${isSender ? 'text-blue-100' : 'text-gray-600'} text-right`}>
                  {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="flex p-4 border-t border-gray-200 bg-gray-50">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-grow border rounded-l-lg p-2 bg-white"
          placeholder="Type your message..."
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-r-lg">
          Send
        </button>
      </form>
    </div>
  );
};

export default MessageRoom;