import { useState, useEffect } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Button, Card, CardContent, CardHeader, Input } from '../../components/ui';
import { UserStats, UserRecipeList, SavedRecipeList } from '../../components/profile';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

export function ProfilePage() {
  const { user, updateProfile, loading } = useAuth();
  const { showToast } = useUI();
  
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Load user data
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setBio(user.bio || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (avatarUrl && !/^https?:\/\/.+/.test(avatarUrl)) {
      newErrors.avatarUrl = 'Avatar URL must be a valid URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const success = await updateProfile({
      displayName: displayName || undefined,
      bio: bio || undefined,
      avatarUrl: avatarUrl || undefined,
    });
    
    if (success) {
      showToast('Profile updated successfully', 'success');
      setIsEditing(false);
    }
  };
  
  if (!user) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Please log in to view your profile</h2>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Your Profile</h2>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center space-x-6">
                      <div className="flex-shrink-0">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={displayName || user.username}
                            className="h-24 w-24 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-24 w-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <Input
                          id="avatar-url"
                          name="avatar-url"
                          type="text"
                          label="Avatar URL"
                          value={avatarUrl}
                          onChange={(e) => setAvatarUrl(e.target.value)}
                          error={errors.avatarUrl}
                          placeholder="https://example.com/avatar.jpg"
                        />
                      </div>
                    </div>
                    
                    <Input
                      id="display-name"
                      name="display-name"
                      type="text"
                      label="Display Name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      error={errors.displayName}
                      placeholder="Your display name"
                    />
                    
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about yourself"
                      />
                      {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio}</p>}
                    </div>
                    
                    <div className="flex space-x-4">
                      <Button type="submit" isLoading={loading}>
                        Save Changes
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setDisplayName(user.displayName || '');
                          setBio(user.bio || '');
                          setAvatarUrl(user.avatarUrl || '');
                          setIsEditing(false);
                          setErrors({});
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-6">
                      <div className="flex-shrink-0">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.displayName || user.username}
                            className="h-24 w-24 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-24 w-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">
                          {user.displayName || user.username}
                        </h3>
                        <p className="text-gray-500">@{user.username}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium mb-2">Email</h4>
                      <p>{user.email}</p>
                    </div>
                    
                    {user.bio && (
                      <div>
                        <h4 className="text-lg font-medium mb-2">Bio</h4>
                        <p>{user.bio}</p>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="text-lg font-medium mb-2">Member Since</h4>
                      <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* User's Recipes */}
            <div className="mt-6">
              <UserRecipeList limit={5} showViewAll={true} />
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Stats */}
            <UserStats />
            
            {/* Saved Recipes */}
            <SavedRecipeList limit={5} showViewAll={true} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
