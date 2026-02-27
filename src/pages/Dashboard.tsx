import { useState, useMemo, useEffect } from 'react';
import { events as initialEvents, Event } from '../data/events';
import { getEventStatus, EventStatus } from '../utils/dateHelpers';
import EventCard from '../components/EventCard';
import NotificationToggle from '../components/NotificationToggle';
import AdminDashboard from '../components/AdminDashboard';
import { LayoutGrid, List, Plus, Search, Settings, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const LOCAL_EVENTS_KEY = 'verse_local_events_v2';

import VerseLogo from '../components/VerseLogo';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<EventStatus | 'All'>('Upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdmin, setShowAdmin] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [userCount, setUserCount] = useState<number>(1);

  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);

  // Load events on mount
  useEffect(() => {
    const storedEvents = localStorage.getItem(LOCAL_EVENTS_KEY);
    if (storedEvents) {
      setAllEvents(JSON.parse(storedEvents));
    } else {
      setAllEvents(initialEvents);
      localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(initialEvents));
    }

    // WebSocket for active users
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}`);

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'USER_COUNT') {
          setUserCount(data.count);
        }
      } catch (err) {
        console.error('WS parse error', err);
      }
    };

    return () => socket.close();
  }, []);

  const handleAddEvent = (newEvent: Event) => {
    const updatedEvents = [newEvent, ...allEvents];
    setAllEvents(updatedEvents);
    localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(updatedEvents));
  };

  const handleUpdateEvent = (updatedEvent: Event) => {
    const updatedEvents = allEvents.map(e => e.id === updatedEvent.id ? updatedEvent : e);
    setAllEvents(updatedEvents);
    localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(updatedEvents));
  };

  const confirmDelete = () => {
    if (!deleteConfirmation) return;
    const updatedEvents = allEvents.filter(e => e.id !== deleteConfirmation);
    setAllEvents(updatedEvents);
    localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(updatedEvents));
    setDeleteConfirmation(null);
  };

  const handleEditClick = (event: Event) => {
    setEditingEvent(event);
    setShowAdmin(true);
  };

  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      const status = getEventStatus(event.startTime, event.endTime);
      const matchesTab = activeTab === 'All' || status === activeTab;
      const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           event.host.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [allEvents, activeTab, searchQuery]);

  const tabs: (EventStatus | 'All')[] = ['Upcoming', 'Live', 'Past', 'All'];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 pb-20">
      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 text-center">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Delete Event?</h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-8">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteConfirmation(null)}
                className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Dashboard Overlay */}
      {showAdmin && (
        <AdminDashboard 
          onClose={() => {
            setShowAdmin(false);
            setEditingEvent(null);
          }} 
          onAddEvent={handleAddEvent}
          onUpdateEvent={handleUpdateEvent}
          editingEvent={editingEvent}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <VerseLogo />
            <h1 className="text-2xl font-bold tracking-tight hidden sm:block">VERSE EVENTS/ANNOUNCEMENT HUB</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <NotificationToggle />
            <button 
              onClick={() => {
                setEditingEvent(null);
                setShowAdmin(true);
              }}
              className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all border border-transparent hover:border-blue-600/20"
              title="Admin Panel"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Hero / Intro */}
        <div className="mb-12">
          <h2 className="text-4xl sm:text-5xl font-black mb-4 tracking-tighter uppercase">
            Verse Events / <span className="text-blue-600 italic">Announcement Hub</span>
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl text-lg">
            Stay connected with the Verse community. Join research calls, debates, and live coding sessions.
          </p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-6 mb-10 items-center justify-between">
          <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl w-full md:w-auto overflow-x-auto no-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab 
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text"
              placeholder="Search events or hosts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredEvents.length > 0 ? (
              filteredEvents.map(event => (
                <div key={event.id}>
                  <EventCard 
                    event={event} 
                    onEdit={() => handleEditClick(event)} 
                    onDelete={() => setDeleteConfirmation(event.id)}
                  />
                </div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-20 text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-900 mb-4">
                  <Search className="w-8 h-8 text-zinc-400" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">No events found</h3>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2">Try adjusting your filters or search query.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer with User Count */}
      <footer className="mt-20 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <VerseLogo size="sm" />
            <span className="font-bold tracking-tight text-zinc-400">VERSE ECOSYSTEM</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider">
                {userCount} {userCount === 1 ? 'User' : 'Users'} Online
              </span>
            </div>
            <p className="text-zinc-500 text-sm">
              © {new Date().getFullYear()} Verse Events Hub
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
