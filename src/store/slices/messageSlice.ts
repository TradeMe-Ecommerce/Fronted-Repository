import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { roomService }        from '../../services/roomService';
import { messageService }     from '../../services/messageService';
import { webSocketService }   from '../../services/webSocketService';
import type { RootState }     from '../../store';
import type { Room, Message } from '../../types';


interface MessageState {
  rooms: Room[];
  currentRoom: Room | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

const initialState: MessageState = {
  rooms: [],
  currentRoom: null,
  messages: [],
  isLoading: false,
  error: null,
};


export const fetchRooms = createAsyncThunk<
  Room[],
  void,
  { state: RootState; rejectValue: string }
>('messages/fetchRooms', async (_, { getState, rejectWithValue }) => {
  const userId = getState().auth.userId;
  if (!userId) return rejectWithValue('Usuario no autenticado');

  try {
    return await roomService.getRoomsForUser(userId);
  } catch {
    return rejectWithValue('No se pudieron cargar las salas');
  }
});

export const fetchRoom = createAsyncThunk<
  Room,
  number,
  { rejectValue: string }
>('messages/fetchRoom', async (roomId, { rejectWithValue }) => {
  try {
    return await roomService.getRoomById(roomId);
  } catch {
    return rejectWithValue('No se pudo cargar la sala');
  }
});

export const createRoom = createAsyncThunk<
  Room,
  number,
  { rejectValue: string }
>('messages/createRoom', async (peerUserId, { rejectWithValue }) => {
  try {
    return await roomService.createRoom(peerUserId);
  } catch {
    return rejectWithValue('No se pudo crear la sala');
  }
});

export const sendMessage = createAsyncThunk<
  Message | void,
  { roomId: number; message: string },
  { state: RootState; rejectValue: string }
>('messages/sendMessage', async ({ roomId, message }, { getState, rejectWithValue }) => {
  const userId = getState().auth.userId;

  try {
    if (webSocketService.isConnected()) {
      webSocketService.sendMessage({ roomId, message, userId });
    }

    return await messageService.sendMessageREST(roomId, message, userId);
  } catch {
    return rejectWithValue('Error enviando el mensaje');
  }
});

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setMessages(state, { payload }: PayloadAction<Message[]>) {
      state.messages = payload;
    },
    webSocketMessageReceived(state, { payload }: PayloadAction<Message>) {
      state.messages.push(payload);
      const idx = state.rooms.findIndex(r => r.id === payload.roomId);
      if (idx >= 0) state.rooms[idx].messages.push(payload);
    },
    setCurrentRoom(state, { payload }: PayloadAction<Room | null>) {
      state.currentRoom = payload;
      state.messages    = payload?.messages || [];
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchRooms.pending,  s => { s.isLoading = true;  s.error = null; })
      .addCase(fetchRooms.fulfilled,(s,a)=>{ s.isLoading = false; s.rooms = a.payload; })
      .addCase(fetchRooms.rejected, (s,a)=>{ s.isLoading = false; s.error = a.payload ?? 'Error desconocido'; });

    builder
      .addCase(fetchRoom.pending,  s => { s.isLoading = true;  s.error = null; })
      .addCase(fetchRoom.fulfilled,(s,a)=>{ s.isLoading = false; s.currentRoom = a.payload; s.messages = a.payload.messages; })
      .addCase(fetchRoom.rejected, (s,a)=>{ s.isLoading = false; s.error = a.payload ?? 'Error desconocido'; });

    builder
      .addCase(createRoom.pending,  s => { s.isLoading = true;  s.error = null; })
      .addCase(createRoom.fulfilled,(s,a)=>{ s.isLoading = false; s.rooms.unshift(a.payload); s.currentRoom = a.payload; s.messages = a.payload.messages; })
      .addCase(createRoom.rejected, (s,a)=>{ s.isLoading = false; s.error = a.payload ?? 'Error desconocido'; });

    builder
      .addCase(sendMessage.pending,  s => { s.isLoading = true;  s.error = null; })
      .addCase(sendMessage.fulfilled,(s,a)=>{ 
        s.isLoading = false;
        if (a.payload) {
          s.messages.push(a.payload);
          const idx = s.rooms.findIndex(r => r.id === a.payload.roomId);
          if (idx >= 0) s.rooms[idx].messages.push(a.payload);
        }
      })
      .addCase(sendMessage.rejected, (s,a)=>{ s.isLoading = false; s.error = a.payload ?? 'Error desconocido'; });
  },
});

export const {
  setMessages,
  webSocketMessageReceived,
  setCurrentRoom,
} = messageSlice.actions;

export default messageSlice.reducer;
