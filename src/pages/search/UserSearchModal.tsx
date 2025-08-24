// components/UserSearchModal.tsx
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Search, X, User, MessageCircle } from 'lucide-react';
import { AppDispatch } from '../../store';
import { createRoom } from '../../store/slices/messageSlice';
import { userService } from '../../services/userService'; // Asume que tienes este servicio
import { User as UserType } from '../../types';

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoomCreated: (roomId: number) => void;
}

const UserSearchModal: React.FC<UserSearchModalProps> = ({ isOpen, onClose, onRoomCreated }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      searchUsers();
    } else {
      setUsers([]);
    }
  }, [searchTerm]);

  const searchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await userService.searchUsers(searchTerm);
      setUsers(response);
    } catch (error) {
      console.error('Error searching users:', error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRoom = async (userId: number) => {
    setIsCreatingRoom(true);
    try {
      const result = await dispatch(createRoom(userId)).unwrap();
      onRoomCreated(result.id);
      onClose();
      setSearchTerm('');
      setUsers([]);
    } catch (error) {
      console.error('Error creating room:', error);
    } finally {
      setIsCreatingRoom(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Start New Conversation</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="max-h-64 overflow-y-auto">
          {isLoading && (
            <div className="p-4 text-center text-gray-500">
              Searching...
            </div>
          )}

          {!isLoading && searchTerm.trim().length >= 2 && users.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              No users found
            </div>
          )}

          {!isLoading && searchTerm.trim().length < 2 && (
            <div className="p-4 text-center text-gray-500">
              Type at least 2 characters to search
            </div>
          )}

          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 hover:bg-gray-50 border-b last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              
              <button
                onClick={() => handleCreateRoom(user.id)}
                disabled={isCreatingRoom}
                className="flex items-center space-x-1 px-3 py-1 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Chat</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserSearchModal;