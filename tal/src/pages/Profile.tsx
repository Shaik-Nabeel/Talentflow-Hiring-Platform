import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';

const DEFAULT_PROFILE = {
  name: 'Alex Johnson',
  email: 'alex.johnson@company.com',
  phone: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
  role: 'HR Manager',
  department: 'Human Resources',
  avatar: '',
  memberSince: 'January 2023',
};

export default function Profile() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [editing, setEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [originalProfile, setOriginalProfile] = useState(DEFAULT_PROFILE);

  useEffect(() => {
    // Load profile from DB if exists
    db.profile?.get('main').then((data) => {
      if (data) setProfile(data);
      if (data?.avatar) setAvatarPreview(data.avatar);
    });
  }, []);
  
  useEffect(() => {
    // keep a copy to allow cancel
    setOriginalProfile(profile);
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAvatarPreview(ev.target?.result as string);
        setProfile((p) => ({ ...p, avatar: ev.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    await db.profile?.put({ ...profile, id: 'main' });
    setEditing(false);
    setOriginalProfile(profile);
    toast({ title: 'Profile saved', description: 'Your profile has been updated' });
  };

  const handleEdit = () => {
    setEditing(true);
    // ensure originalProfile has current persisted values
    db.profile?.get('main').then((data) => {
      if (data) setOriginalProfile(data);
    });
  };

  const handleCancel = () => {
    // restore from original
    setProfile(originalProfile);
    setAvatarPreview(originalProfile.avatar || '');
    setEditing(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card className="p-8 rounded-2xl">
        <h2 className="text-2xl font-bold mb-2">Profile Information</h2>
        <p className="text-muted-foreground mb-6">Update your personal information and profile picture</p>
        <div className="flex gap-8 items-center mb-8 flex-wrap">
          <div className="flex flex-col items-center gap-2">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-3xl font-bold text-muted-foreground overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span>{profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}</span>
              )}
            </div>
            <div className="flex flex-col items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={!editing}>
                Change Avatar
              </Button>
              {!editing && <div className="text-xs text-muted-foreground">Enable edit to change avatar</div>}
            </div>
            <input
              type="file"
              accept="image/png,image/jpeg,image/gif"
              className="hidden"
              ref={fileInputRef}
              onChange={handleAvatarChange}
            />
            <span className="text-xs text-muted-foreground">JPG, PNG or GIF (MAX. 800x800px)</span>
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <Input name="name" value={profile.name} onChange={handleChange} disabled={!editing} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input name="email" value={profile.email} onChange={handleChange} type="email" disabled={!editing} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <Input name="phone" value={profile.phone} onChange={handleChange} disabled={!editing} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <Input name="location" value={profile.location} onChange={handleChange} disabled={!editing} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <Input name="role" value={profile.role} onChange={handleChange} disabled={!editing} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Department</label>
              <Input name="department" value={profile.department} onChange={handleChange} disabled={!editing} />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-6">
          <span className="text-xs text-muted-foreground">Member since {profile.memberSince}</span>
          <div className="flex items-center gap-3">
            {!editing ? (
              <Button onClick={handleEdit} className="px-6 py-2 rounded-lg">
                Edit
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
                <Button onClick={handleSave} className="px-6 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition">Save</Button>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
