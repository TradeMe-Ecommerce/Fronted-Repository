import api from './api';
import { Message } from '../types';

class MessageService {
  /** Historial completo de la sala. */
  async getMessagesForRoom(roomId: number | string): Promise<Message[]> {
    const { data } = await api.get<Message[]>(`/message/room/${roomId}`);
    return data;
  }

  async sendMessageREST(
    roomId: number,
    message: string,
    userId?: number,
  ): Promise<Message> {
    const payload = { roomId, message, userId };
    const { data } = await api.post<Message>('/message', payload);
    return data;
  }

  async deleteMessage(id: number): Promise<void> {
    await api.delete(`/message/${id}`);
  }

  async updateMessage(id: number, newText: string): Promise<Message> {
    const { data } = await api.patch<Message>('/message', {
      id,
      message: newText,
    });
    return data;
  }
}

export const messageService = new MessageService();
