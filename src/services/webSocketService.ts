import { store } from '../store';
import { webSocketMessageReceived } from '../store/slices/messageSlice';
import { Message } from '../types';

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectInterval = 3_000;
  private isConnecting = false;

  /* ------------ PUBLIC API ------------ */
  async connect(token: string): Promise<void> {
    // Ya conectado
    if (this.isConnected()) return;

    // Conexión en progreso
    if (this.isConnecting) return;

    this.isConnecting = true;

    const wsUrl = `ws://localhost:8080/ws/chat?token=${encodeURIComponent(
      token,
    )}`;

    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('WebSocket connected ✔');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        resolve();
      };

      this.socket.onmessage = e => {
        try {
          const msg: Message = JSON.parse(e.data);
          store.dispatch(webSocketMessageReceived(msg));
        } catch (err) {
          console.error('Invalid WS message:', err);
        }
      };

      this.socket.onclose = ev => {
        console.warn('WS closed:', ev.code);
        this.isConnecting = false;

        if (
          ev.code !== 1000 &&
          this.reconnectAttempts < this.maxReconnectAttempts
        ) {
          this.scheduleReconnect(token);
        }
      };

      this.socket.onerror = err => {
        console.error('WS error:', err);
        this.isConnecting = false;
        reject(new Error('WebSocket failed'));
      };
    });
  }

  sendMessage(payload: { roomId: number; message: string; userId: number }) {
    if (!this.isConnected()) throw new Error('WS not connected');
    this.socket!.send(JSON.stringify(payload));
  }

  disconnect() {
    this.reconnectAttempts = this.maxReconnectAttempts;
    this.socket?.close(1000, 'Client disconnect');
    this.socket = null;
  }

  isConnected(): boolean {
    return (
      this.socket !== null && this.socket.readyState === WebSocket.OPEN
    );
  }

  /* ------------ PRIVATE ------------ */
  private scheduleReconnect(token: string) {
    setTimeout(() => {
      this.reconnectAttempts++;
      console.log(
        `Reconnecting… (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
      );
      this.connect(token).catch(err =>
        console.error('Reconnect failed:', err.message),
      );
    }, this.reconnectInterval);
  }
}

export const webSocketService = new WebSocketService();
