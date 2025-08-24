import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { webSocketService } from '../services/webSocketService';
import { AppDispatch } from '../store';
import { webSocketMessageReceived } from '../store/slices/messageSlice';

const useWebSocket = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const handleMessage = (message: any) => {
      // Dispatch an action to update the Redux store with the new message
      dispatch(webSocketMessageReceived(message));
    };

    webSocketService.connect(handleMessage);

    // Cleanup on component unmount
    return () => {
      webSocketService.disconnect();
    };
  }, [dispatch]);

  const sendMessage = (message: any) => {
    webSocketService.sendMessage(message);
  };

  return { sendMessage };
};

export default useWebSocket;