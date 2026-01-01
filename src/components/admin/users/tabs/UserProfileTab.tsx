'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Camera, User, Bell, Moon, Globe, Mail, MessageSquare, Save, X } from 'lucide-react'
import type { FullUserData } from '@/types/admin'

interface UserProfileTabProps {
  user: FullUserData
}

/**
 * User Profile Tab - Avatar, bio, preferences
 */
export function UserProfileTab({ user }: UserProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false)

  // Profile data from user
  const profile = user.profile || {
    avatar_url: null,
    bio: null,
    timezone: 'America/New_York',
    locale: 'en-US',
  }

  // Preferences from user
  const preferences = user.preferences || {
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    dark_mode: false,
    compact_view: false,
  }

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??'
  }

  return (
    <div className="space-y-6">
      {/* Avatar & Basic Info */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-charcoal-600">
              Profile Information
            </CardTitle>
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button size="sm" onClick={() => setIsEditing(false)}>
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={user.full_name}
                  className="w-24 h-24 rounded-full object-cover border-2 border-charcoal-100"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gold-100 flex items-center justify-center text-gold-700 text-2xl font-semibold border-2 border-charcoal-100">
                  {getInitials(user.full_name)}
                </div>
              )}
              {isEditing && (
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-hublot-900 text-white rounded-full flex items-center justify-center hover:bg-hublot-800 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Profile Fields */}
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="text-xs font-medium text-charcoal-600">Display Name</Label>
                {isEditing ? (
                  <Input defaultValue={user.full_name} className="mt-1" />
                ) : (
                  <p className="font-medium text-charcoal-900">{user.full_name}</p>
                )}
              </div>

              <div className="col-span-2">
                <Label className="text-xs font-medium text-charcoal-600">Bio</Label>
                {isEditing ? (
                  <Textarea
                    defaultValue={profile.bio || ''}
                    placeholder="Tell us about yourself..."
                    className="mt-1"
                    rows={3}
                  />
                ) : (
                  <p className="text-charcoal-700">
                    {profile.bio || <span className="text-charcoal-400 italic">No bio provided</span>}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-xs font-medium text-charcoal-600">Title / Position</Label>
                {isEditing ? (
                  <Input defaultValue={user.title || ''} placeholder="Job title..." className="mt-1" />
                ) : (
                  <p className="text-charcoal-700">
                    {user.title || <span className="text-charcoal-400">—</span>}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-xs font-medium text-charcoal-600">Department</Label>
                {isEditing ? (
                  <Input defaultValue={user.department || ''} placeholder="Department..." className="mt-1" />
                ) : (
                  <p className="text-charcoal-700">
                    {user.department || <span className="text-charcoal-400">—</span>}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Locale & Regional Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-charcoal-600">
            Regional Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-charcoal-100 flex items-center justify-center">
                <Globe className="w-5 h-5 text-charcoal-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-charcoal-900">Timezone</p>
                {isEditing ? (
                  <select className="w-full mt-1 h-9 px-3 rounded-md border border-charcoal-200 text-sm">
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="UTC">UTC</option>
                  </select>
                ) : (
                  <p className="text-sm text-charcoal-500">{profile.timezone || 'America/New_York'}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-charcoal-100 flex items-center justify-center">
                <Globe className="w-5 h-5 text-charcoal-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-charcoal-900">Language</p>
                {isEditing ? (
                  <select className="w-full mt-1 h-9 px-3 rounded-md border border-charcoal-200 text-sm">
                    <option value="en-US">English (US)</option>
                    <option value="en-GB">English (UK)</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                ) : (
                  <p className="text-sm text-charcoal-500">{profile.locale || 'en-US'}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-charcoal-600">
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-charcoal-500" />
                <div>
                  <p className="font-medium text-charcoal-900">Email Notifications</p>
                  <p className="text-sm text-charcoal-500">Receive updates via email</p>
                </div>
              </div>
              <Switch
                checked={preferences.email_notifications}
                disabled={!isEditing}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-charcoal-500" />
                <div>
                  <p className="font-medium text-charcoal-900">Push Notifications</p>
                  <p className="text-sm text-charcoal-500">Browser push notifications</p>
                </div>
              </div>
              <Switch
                checked={preferences.push_notifications}
                disabled={!isEditing}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-charcoal-500" />
                <div>
                  <p className="font-medium text-charcoal-900">SMS Notifications</p>
                  <p className="text-sm text-charcoal-500">Text message alerts</p>
                </div>
              </div>
              <Switch
                checked={preferences.sms_notifications}
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Display Preferences */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-charcoal-600">
            Display Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-charcoal-500" />
                <div>
                  <p className="font-medium text-charcoal-900">Dark Mode</p>
                  <p className="text-sm text-charcoal-500">Use dark color theme</p>
                </div>
              </div>
              <Switch
                checked={preferences.dark_mode}
                disabled={!isEditing}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-charcoal-500" />
                <div>
                  <p className="font-medium text-charcoal-900">Compact View</p>
                  <p className="text-sm text-charcoal-500">Denser UI with smaller spacing</p>
                </div>
              </div>
              <Switch
                checked={preferences.compact_view}
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
