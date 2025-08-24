import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchNotifications, markAsRead, markAllAsRead } from '../../store/slices/notificationSlice';
import { Bell, Check } from 'lucide-react';
import Spinner from '../../components/common/Spinner';

const Notifications: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, isLoading } = useSelector((state: RootState) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleMarkAsRead = (id: number) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {notifications.length > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">No notifications</h2>
          <p className="mt-2 text-gray-600">
            We'll notify you when something important happens.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm divide-y">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="p-4 flex items-start hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <p className="text-gray-900">{notification.description}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(notification.date).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleMarkAsRead(notification.id)}
                className="ml-4 p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-full"
              >
                <Check className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;