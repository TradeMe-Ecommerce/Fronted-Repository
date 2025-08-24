import api from './api';
import { Room } from '../types';

/**
 * DTO compacto que usamos para poblar la lista de chats
 * (el backend puede exponerlo como RoomDTO o similar).
 */
export interface RoomListData {
  id: number;
  otherUserId: number;
  otherUserName: string;
  otherUserEmail: string;
  lastMessage?: { content: string };
}

class RoomService {
  /** Devuelve TODAS las salas del usuario indicado. */
  async getRoomsForUser(userId: number): Promise<Room[]> {
    // Backend: GET /users/{id}/rooms
    const { data } = await api.get<Room[]>(`/users/${userId}/rooms`);
    return data;
  }

  /** Devuelve la sala completa (incluye mensajes). */
  async getRoomById(roomId: number): Promise<Room> {
    // Backend: GET /room/{roomId}
    const { data } = await api.get<Room>(`/room/${roomId}`);
    return data;
  }

  /** Crea (o devuelve) una sala contra el peer indicado. */
  async createRoom(peerId: number): Promise<Room> {
    // Backend: POST /room  { peerId }
    const { data } = await api.post<Room>('/room', { peerUserId: peerId });
    return data;
  }

  /* --- Legacy helper: aún puedes llamarlo si ya existe en tu backend --- */
  async getMyRooms(): Promise<RoomListData[]> {
    const { data } = await api.get<RoomListData[]>('/room');
    return data;
  }
}

export const roomService = new RoomService();
