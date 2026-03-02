import { useState, useMemo, useEffect, useRef } from 'react';
import { events as initialEvents, Event } from '../data/events';
import { getEventStatus, EventStatus } from '../utils/dateHelpers';
import EventCard from '../components/EventCard';
import NotificationToggle from '../components/NotificationToggle';
import AdminDashboard from '../components/AdminDashboard';
import { LayoutGrid, List, Plus, Search, Settings, Trash2, BarChart3, Activity, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const LOCAL_EVENTS_KEY = 'verse_local_events_v2';

import VerseLogo from '../components/VerseLogo';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<EventStatus | 'All'>('Upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdmin, setShowAdmin] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [userCount, setUserCount] = useState<number>(1);
  const [totalVisitors, setTotalVisitors] = useState<number>(0);
  const socketRef = useRef<WebSocket | null>(null);

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

    // WebSocket for active users and total visitors
    let socket: WebSocket;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      socket = new WebSocket(`${protocol}//${window.location.host}`);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('WebSocket connection established');
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received WS message:', data);
          if (data.type === 'STATS_UPDATE') {
            setUserCount(data.activeCount);
            setTotalVisitors(data.totalCount);
          }
        } catch (err) {
          console.error('WS parse error', err);
        }
      };

      socket.onclose = () => {
        console.log('WebSocket connection closed. Reconnecting in 3s...');
        reconnectTimeout = setTimeout(connect, 3000);
      };

      socket.onerror = (err) => {
        console.error('WebSocket error:', err);
        socket.close();
      };
    };

    connect();

    return () => {
      if (socket) socket.close();
      socketRef.current = null;
      clearTimeout(reconnectTimeout);
    };
  }, []);

  const handleIncrementVisitors = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'INCREMENT_VISITORS' }));
    }
  };

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

  // Simulated chart data based on real total
  const chartData = useMemo(() => {
    const base = Math.floor(totalVisitors / 7);
    return [
      { day: 'Mon', visits: base + Math.floor(Math.random() * 20) },
      { day: 'Tue', visits: base + Math.floor(Math.random() * 30) },
      { day: 'Wed', visits: base + Math.floor(Math.random() * 15) },
      { day: 'Thu', visits: base + Math.floor(Math.random() * 40) },
      { day: 'Fri', visits: base + Math.floor(Math.random() * 25) },
      { day: 'Sat', visits: base + Math.floor(Math.random() * 10) },
      { day: 'Sun', visits: totalVisitors - (base * 6) }, // Remainder to match total
    ];
  }, [totalVisitors]);

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

        {/* Verse Analytics Section */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold uppercase tracking-tight">Verse Analytics</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <div className="lg:col-span-1 grid grid-cols-1 gap-4">
              <div className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">+12%</span>
                </div>
                <div className="text-3xl font-black tracking-tighter mb-1">{totalVisitors.toLocaleString()}</div>
                <div className="text-zinc-500 text-sm font-medium uppercase tracking-wider">Total Reach</div>
              </div>

              <div className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase">Live</span>
                  </div>
                </div>
                <div className="text-3xl font-black tracking-tighter mb-1">{userCount}</div>
                <div className="text-zinc-500 text-sm font-medium uppercase tracking-wider">Active Nodes</div>
              </div>

              <div className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-purple-500/10 text-purple-500 rounded-xl">
                    <LayoutGrid className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black tracking-tighter mb-1">{allEvents.length}</div>
                <div className="text-zinc-500 text-sm font-medium uppercase tracking-wider">Total Events</div>
              </div>
            </div>

            {/* Chart Card */}
            <div className="lg:col-span-2 p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div className="text-sm font-bold uppercase tracking-widest text-zinc-400">Weekly Engagement</div>
                <div className="text-xs text-zinc-500">Last 7 Days</div>
              </div>
              <div className="flex-1 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#71717a' }}
                      dy={10}
                    />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ 
                        backgroundColor: '#18181b', 
                        border: 'none', 
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="visits" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 6 ? '#2563eb' : '#3f3f46'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

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
                    onJoin={handleIncrementVisitors}
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

      {/* Footer with User Count and Total Visitors */}
      <footer className="mt-20 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <VerseLogo size="sm" />
            <span className="font-bold tracking-tight text-zinc-400">VERSE ECOSYSTEM</span>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-4">
            <div className="flex flex-wrap justify-center md:justify-end gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider">
                  {userCount} {userCount === 1 ? 'User' : 'Users'} Online
                </span>
              </div>
              
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-500 rounded-full border border-blue-500/20">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {totalVisitors.toLocaleString()} Total Visitors
                </span>
              </div>
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
