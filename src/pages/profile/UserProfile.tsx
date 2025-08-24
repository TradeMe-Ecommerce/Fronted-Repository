import React, { useEffect, useState } from 'react';
import { userService } from '../../services/userService';
import { getUserId } from '../../utils/auth';
import { User, Mail, Phone, Calendar, Save, X } from 'lucide-react';
import Spinner from '../../components/common/Spinner';

interface UserProfileData {
  id: number;
  name: string;
  email: string;
  phone: string;
  date: string;
}

const UserProfile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfileData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const userId = getUserId();
        if (!userId) {
          throw new Error('No user ID found');
        }
        const data = await userService.getUserProfile(userId);
        setProfile(data);
        setEditedProfile(data);
      } catch (err) {
        console.error('Error loading profile:', err);
        setError(err instanceof Error ? err.message : 'Error loading profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile(profile);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile(profile);
  };

  const handleSave = async () => {
    if (!editedProfile) return;

    try {
      setIsSaving(true);
      setError(null);
      const userId = getUserId();
      if (!userId) {
        throw new Error('No user ID found');
      }

      const updatedProfile = await userService.updateUserProfile(userId, {
        name: editedProfile.name,
        email: profile.email,
        phone: editedProfile.phone,
      });

      setProfile(updatedProfile);
      setEditedProfile(updatedProfile);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof UserProfileData, value: string) => {
    if (!editedProfile) return;
    setEditedProfile({
      ...editedProfile,
      [field]: value
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-app py-12">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!profile || !editedProfile) {
    return (
      <div className="container-app py-12">
        <div className="text-center">
          <p>No profile found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Profile Header */}
          <div className="bg-primary-600 px-6 py-8 sm:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-primary-700 flex items-center justify-center border-4 border-white">
                    <User className="h-12 w-12 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
                  <p className="text-primary-100">Member since {new Date(profile.date).toLocaleDateString()}</p>
                </div>
              </div>
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-white text-primary-600 rounded-md hover:bg-primary-50 transition-colors"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-white text-gray-600 rounded-md hover:bg-gray-50 transition-colors flex items-center"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-white text-primary-600 rounded-md hover:bg-primary-50 transition-colors flex items-center"
                  >
                    {isSaving ? (
                      <Spinner size="sm" className="mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="form-label">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={editedProfile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!isEditing}
                    className={`form-input pl-10 ${!isEditing ? 'bg-gray-50' : 'bg-white'}`}
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="form-label">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="form-input pl-10 bg-gray-50"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="form-label">Phone Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={editedProfile.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    className={`form-input pl-10 ${!isEditing ? 'bg-gray-50' : 'bg-white'}`}
                  />
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="form-label">Member Since</label>
                <div className="relative">
                  <input
                    type="text"
                    value={new Date(profile.date).toLocaleDateString()}
                    disabled
                    className="form-input pl-10 bg-gray-50"
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;