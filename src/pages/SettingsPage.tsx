import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { ImageUpload } from '../components/settings/ImageUpload';
import { SettingsSection } from '../components/settings/SettingsSection';
import { DefaultAvatarPicker } from '../components/settings/DefaultAvatarPicker';
import { useNavigate } from 'react-router-dom';
import type { UserSettings } from '../types/settings';
import type { UserProfile } from '../types/models';

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public - Anyone can view' },
  { value: 'private', label: 'Private - Only you can view' },
  { value: 'limited', label: 'Limited - Only registered users can view' }
];

const PREFERENCE_LABELS = {
  showProfilePicture: 'Profile Picture',
  showCompanyLogo: 'Company Logo',
  showCompanyName: 'Company Name',
  showSocialLinks: 'Social Links',
  showContactInfo: 'Contact Information'
};

export function SettingsPage() {
  const { user, profile, updateUser, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    fullName: '',
    bio: '',
    companyName: '',
    socialLinks: {
      website: '',
      linkedin: '',
      twitter: '',
      github: '',
      instagram: '',
      youtube: ''
    },
    contactInfo: {
      email: ''
    },
    displayPreferences: {
      showProfilePicture: true,
      showCompanyLogo: false,
      showSocialLinks: true,
      showContactInfo: false,
      profileVisibility: 'public'
    },
    profilePicture: '',
    companyLogo: ''
  });

  // Initialize settings when profile or user changes
  useEffect(() => {
    if (profile || user) {
      setSettings({
        fullName: profile?.displayName || user?.name || '',
        bio: profile?.bio || '',
        companyName: profile?.company || '',
        socialLinks: {
          website: profile?.website || '',
          linkedin: profile?.socialLinks?.linkedin || '',
          twitter: profile?.socialLinks?.twitter || '',
          github: profile?.socialLinks?.github || '',
          instagram: profile?.socialLinks?.instagram || '',
          youtube: profile?.socialLinks?.youtube || ''
        },
        contactInfo: {
          email: user?.email || ''
        },
        displayPreferences: {
          showProfilePicture: profile?.displayPreferences?.showProfilePicture ?? true,
          showCompanyLogo: profile?.displayPreferences?.showCompanyLogo ?? false,
          showCompanyName: profile?.displayPreferences?.showCompanyName ?? false,
          showSocialLinks: profile?.displayPreferences?.showSocialLinks ?? true,
          showContactInfo: profile?.displayPreferences?.showContactInfo ?? false,
          profileVisibility: profile?.displayPreferences?.profileVisibility || 'public'
        },
        profilePicture: profile?.avatarUrl || user?.avatar || '',
        companyLogo: profile?.companyLogo || '/images/bolt.jpg'
      });
    }
  }, [profile, user]);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Update user data first
      const userData = {
        name: settings.fullName,
        email: settings.contactInfo.email,
        avatar: settings.profilePicture
      };
      
      // Update user first to ensure email is updated
      updateUser(userData);

      // Then update profile
      const profileData: Partial<UserProfile> = {
        displayName: settings.fullName,
        avatarUrl: settings.profilePicture,
        company: settings.companyName,
        website: settings.socialLinks.website,
        bio: settings.bio,
        socialLinks: settings.socialLinks,
        displayPreferences: settings.displayPreferences,
        companyLogo: settings.companyLogo
      };
      
      await updateProfile(profileData);
      
      toast.success('Settings saved successfully!');
      
      // Navigate to profile after successful save
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <SettingsIcon className="w-8 h-8 text-purple-400" />
              <h1 className="text-2xl font-bold text-white">Settings</h1>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-xl shadow-lg ring-2 ring-purple-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
          
          <div className="space-y-6">
            <SettingsSection
              title="Basic Information"
              description="Your public profile information"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={settings.fullName}
                    onChange={(e) => setSettings(s => ({ ...s, fullName: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Bio/Description
                  </label>
                  <textarea
                    value={settings.bio}
                    onChange={(e) => setSettings(s => ({ ...s, bio: e.target.value }))}
                    maxLength={250}
                    rows={3}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white resize-none"
                  />
                  <p className="text-xs text-gray-400">
                    {(settings.bio?.length || 0)}/250 characters
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageUpload
                  label="Profile Picture"
                  currentImage={settings.profilePicture}
                  onImageSelect={(file) => {
                    const url = URL.createObjectURL(file);
                    setSettings(s => ({ ...s, profilePicture: url }));
                  }}
                  onImageRemove={() => setSettings(s => ({ ...s, profilePicture: '' }))}
                />
                
                <div className="space-y-6">
                  <DefaultAvatarPicker
                    currentImage={settings.profilePicture}
                    onSelect={(url) => setSettings(s => ({ ...s, profilePicture: url }))}
                  />
                </div>
              </div>
              
              <hr className="border-white/10 my-8" />
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Company Name
                </label>
                <input
                  type="text"
                  value={settings.companyName}
                  onChange={(e) => setSettings(s => ({ ...s, companyName: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  placeholder="Enter company name"
                />
              </div>
              
              <div className="space-y-4">
                <span className="block text-sm font-medium text-gray-300">Company Logo</span>
                {settings.companyLogo ? (
                  <div className="space-y-4">
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-white">
                      <img
                        src={settings.companyLogo}
                        alt="Company Logo"
                        className="w-full h-full object-contain bg-white"
                      />
                    </div>
                    <button
                      onClick={() => setSettings(s => ({ ...s, companyLogo: '' }))}
                      className="w-32 py-2 px-4 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Remove</span>
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="company-logo-upload"
                    className="w-32 h-32 border border-dashed border-white rounded-lg flex flex-col items-center justify-center space-y-2 hover:border-purple-400/50 transition-colors"
                  >
                    <Upload className="w-6 h-6 text-gray-400" />
                    <span className="text-sm text-gray-400">Click to upload</span>
                  </label>
                )}
                <input
                  id="company-logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setSettings(s => ({ ...s, companyLogo: url }));
                    }
                  }}
                  className="hidden"
                />
              </div>
            </SettingsSection>

            <SettingsSection
              title="Social Media Links"
              description="Connect your social media profiles"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['website', 'linkedin', 'twitter', 'github', 'instagram', 'youtube'].map((platform) => (
                  <div key={platform} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300 capitalize">
                      {platform === 'website' ? 'Website URL' : `${platform} Profile`}
                    </label>
                    <input
                      type="url"
                      value={settings.socialLinks[platform as keyof typeof settings.socialLinks] || ''}
                      onChange={(e) => setSettings(s => ({
                        ...s,
                        socialLinks: { ...s.socialLinks, [platform]: e.target.value }
                      }))}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                      placeholder={`https://${platform}.com/...`}
                    />
                  </div>
                ))}
              </div>
            </SettingsSection>

            <SettingsSection
              title="Contact Information"
              description="How others can reach you"
              tooltip="This information will be displayed based on your privacy settings"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    value={settings.contactInfo.email}
                    onChange={(e) => setSettings(s => ({
                      ...s,
                      contactInfo: { ...s.contactInfo, email: e.target.value }
                    }))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
              </div>
            </SettingsSection>

            <SettingsSection
              title="Display Preferences"
              description="Control what information is visible to others"
              tooltip="These settings affect how your profile appears to other users"
            >
              <div className="space-y-4">
                {Object.entries(settings.displayPreferences)
                  .filter(([key]) => key !== 'profileVisibility')
                  .map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">
                        {PREFERENCE_LABELS[key as keyof typeof PREFERENCE_LABELS]}
                      </span>
                      <button
                        onClick={() => setSettings(s => ({
                          ...s,
                          displayPreferences: {
                            ...s.displayPreferences,
                            [key]: !value
                          }
                        }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                          value ? 'bg-purple-500' : 'bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                            value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                {user?.role !== 'user' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Profile Visibility
                    </label>
                    <select
                      value={settings.displayPreferences.profileVisibility}
                      onChange={(e) => setSettings(s => ({
                        ...s,
                        displayPreferences: {
                          ...s.displayPreferences,
                          profileVisibility: e.target.value as any
                        }
                      }))}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                    >
                      {VISIBILITY_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </SettingsSection>
          </div>
        </div>
      </div>
    </div>
  );
}