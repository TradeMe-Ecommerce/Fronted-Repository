import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { roomService, RoomListData } from '../../services/roomService';
import { userService } from '../../services/userService';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { User } from '../../types';
import MessageRoom from './MessageRoom';
import { Search, X, MessageSquare } from 'lucide-react';
import { getUserId } from '../../utils/auth';

const Messages = () => {
  const { id: roomIdFromParams } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState<RoomListData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const token = useSelector((state: RootState) => state.auth.token);
  const currentUserId = getUserId();

  useEffect(() => {
    if (roomIdFromParams) {
      setSelectedRoomId(roomIdFromParams);
    }
  }, [roomIdFromParams]);

  useEffect(() => {
    const fetchRooms = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const userRooms = await roomService.getMyRooms();
        setRooms(userRooms);
        setError(null);
      } catch (err) {
        setError('Failed to load chats.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [token]); 

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === '') {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const users = await userService.searchUsers(query);
      // Filter out the current user from search results
      setSearchResults(users.filter(u => u.id !== currentUserId));
    } catch (error) {
      console.error('Failed to search users', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectRoom = (roomId: number) => {
    setSelectedRoomId(roomId.toString());
    navigate(`/messages/${roomId}`);
  };

  const handleCreateRoom = async (peer: User) => {
    // Check if a room with this user already exists
    const existingRoom = rooms.find(room => room.otherUserId === peer.id);
    if (existingRoom) {
      handleSelectRoom(existingRoom.id);
      clearSearch();
      return;
    }

    try {
      const newRoom = await roomService.createRoom(peer.id);
      const newRoomForList: RoomListData = {
        id: newRoom.id,
        otherUserId: peer.id,
        otherUserName: peer.username,
        otherUserEmail: peer.email,
        lastMessage: undefined,
      };
      setRooms([newRoomForList, ...rooms]);
      handleSelectRoom(newRoom.id);
      clearSearch();
    } catch (error) {
      console.error('Failed to create room', error);
      setError('Could not start a new chat.');
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Column: Chat List and Search */}
      <div className={`w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 bg-gray-50 flex-col ${selectedRoomId ? 'hidden md:flex' : 'flex'}`}>
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 sticky top-0 bg-gray-50 z-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 border rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800">
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
        
        {/* Content: Search results or Room list */}
        <div className="flex-grow overflow-y-auto">
          {searchQuery ? (
            // Search Results
            <div>
              {isSearching ? (
                <div className="p-4 text-center text-gray-500">Searching...</div>
              ) : searchResults.length > 0 ? (
                <ul>
                  {searchResults.map((foundUser) => (
                    <li
                      key={foundUser.id}
                      className={`p-4 border-b border-gray-200 ${!foundUser.id ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'}`}
                      onClick={() => foundUser.id && handleCreateRoom(foundUser)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                           {(foundUser.username ?? foundUser.firstName ?? foundUser.email ?? '?')
                           .charAt(0)
                           .toUpperCase()}
                        </div>
                        <p className="font-medium text-gray-800">{foundUser.username || foundUser.firstName || 'Usuario desconocido'}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-gray-500">No users found.</div>
              )}
            </div>
          ) : (
            // Room List
            <div>
              {loading && <div className="p-4 text-center">Loading chats...</div>}
              {error && <div className="p-4 text-red-500">{error}</div>}
              {!loading && !error && (
                <ul>
                  {rooms.length === 0 ? (
                    <p className="p-4 text-gray-500">You have no active chats. Start a conversation by searching for a user.</p>
                  ) : (
                    rooms.map((room) => (
                      <li
                        key={room.id}
                        className={`p-4 cursor-pointer border-b border-gray-200 ${selectedRoomId === room.id.toString() ? 'bg-primary-100' : 'hover:bg-gray-100'}`}
                        onClick={() => handleSelectRoom(room.id)}
                      >
                        <div className="flex items-center space-x-3">
                           <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                            {(room.otherUserName || '?').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{room.otherUserName || 'Unknown User'}</p>
                            <p className="text-sm text-gray-500 truncate">
                              {room.lastMessage?.content || `Chat with ${room.otherUserEmail}`}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Message Room */}
      <div className={`w-full md:w-2/3 lg:w-3/4 flex-col ${selectedRoomId ? 'flex' : 'hidden md:flex'}`}>
        {selectedRoomId ? (
          <MessageRoom 
            key={selectedRoomId} 
            roomId={selectedRoomId}
            onBack={() => setSelectedRoomId(null)}
          />
        ) : (
          <div className="flex-col items-center justify-center h-full bg-white text-gray-500 hidden md:flex">
            <MessageSquare size={64} className="mb-4" />
            <h2 className="text-xl font-semibold">Select a chat</h2>
            <p className="mt-2">Or search for a user to start a new conversation.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;