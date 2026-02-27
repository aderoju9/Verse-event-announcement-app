import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { Event } from '../data/events';
import VerseLogo from './VerseLogo';

interface AdminDashboardProps {
  onClose: () => void;
  onAddEvent: (event: Event) => void;
  onUpdateEvent: (event: Event) => void;
  editingEvent?: Event | null;
}

export default function AdminDashboard({ onClose, onAddEvent, onUpdateEvent, editingEvent }: AdminDashboardProps) {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');

  const [eventData, setEventData] = useState<Partial<Event>>({
    name: '',
    host: '',
    startTime: '',
    endTime: '',
    description: '',
    joinUrl: 'https://verse.bitcoin.com',
    category: 'Community',
  });

  useEffect(() => {
    if (editingEvent) {
      setIsAuthenticated(true); // Skip login if we're already editing from the card
      setEventData(editingEvent);
    }
  }, [editingEvent]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '0000') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventData.name || !eventData.startTime || !eventData.endTime) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingEvent) {
      onUpdateEvent({ ...editingEvent, ...eventData } as Event);
      alert('Event updated successfully!');
    } else {
      const event: Event = {
        ...eventData as Event,
        id: Math.random().toString(36).substr(2, 9),
      };
      onAddEvent(event);
      alert('Event added successfully!');
    }

    onClose();
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Admin Login</h2>
            <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-500 mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Enter admin password"
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button 
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-zinc-50 dark:bg-black overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <VerseLogo size="md" />
            <h1 className="text-3xl font-black tracking-tight">Admin <span className="text-blue-600">Dashboard</span></h1>
          </div>
          <div className="px-4 py-1 bg-blue-600/10 text-blue-600 rounded-full text-xs font-bold uppercase tracking-widest border border-blue-600/20">
            Authenticated
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            {editingEvent ? <Save className="w-5 h-5 text-blue-600" /> : <Plus className="w-5 h-5 text-blue-600" />}
            {editingEvent ? 'Edit Event' : 'Add New Event'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Event Name *</label>
                <input 
                  required
                  type="text" 
                  value={eventData.name}
                  onChange={(e) => setEventData({...eventData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="e.g. Verse Research Call"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Host Name</label>
                <input 
                  type="text" 
                  value={eventData.host}
                  onChange={(e) => setEventData({...eventData, host: e.target.value})}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="e.g. Verse Core Team"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Start Time (UTC) *</label>
                <input 
                  required
                  type="datetime-local" 
                  value={eventData.startTime?.slice(0, 16)}
                  onChange={(e) => setEventData({...eventData, startTime: new Date(e.target.value).toISOString()})}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">End Time (UTC) *</label>
                <input 
                  required
                  type="datetime-local" 
                  value={eventData.endTime?.slice(0, 16)}
                  onChange={(e) => setEventData({...eventData, endTime: new Date(e.target.value).toISOString()})}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Description</label>
              <textarea 
                rows={3}
                value={eventData.description}
                onChange={(e) => setEventData({...eventData, description: e.target.value})}
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Briefly describe the event..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Join URL</label>
                <input 
                  type="url" 
                  value={eventData.joinUrl}
                  onChange={(e) => setEventData({...eventData, joinUrl: e.target.value})}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Category</label>
                <select 
                  value={eventData.category}
                  onChange={(e) => setEventData({...eventData, category: e.target.value})}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Community">Community</option>
                  <option value="Research">Research</option>
                  <option value="Development">Development</option>
                  <option value="Governance">Governance</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {editingEvent ? 'Update Event' : 'Publish Event'}
            </button>
          </form>
        </div>

        <div className="mt-12 text-center">
          <p className="text-zinc-500 text-sm">
            Admin access is restricted. Changes are saved to local storage for this session.
          </p>
        </div>
      </div>
    </div>
  );
}
