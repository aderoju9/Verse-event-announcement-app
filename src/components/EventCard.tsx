import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ExternalLink, Bell, BellOff, Share2, Download, Edit3, Trash2 } from 'lucide-react';
import { Event } from '../data/events';
import { 
  getEventStatus, 
  formatEventDate, 
  generateGoogleCalendarLink, 
  downloadIcsFile 
} from '../utils/dateHelpers';
import { isReminderSet, toggleReminder, requestNotificationPermission, scheduleNotification } from '../utils/notificationService';
import CountdownTimer from './CountdownTimer';
import { motion } from 'motion/react';

import VerseLogo from './VerseLogo';

interface EventCardProps {
  event: Event;
  onEdit?: () => void;
  onDelete?: () => void;
  onJoin?: () => void;
}

export default function EventCard({ event, onEdit, onDelete, onJoin }: EventCardProps) {
  const [status, setStatus] = useState(getEventStatus(event.startTime, event.endTime));
  const [hasReminder, setHasReminder] = useState(isReminderSet(event.id));

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getEventStatus(event.startTime, event.endTime));
    }, 60000); // Check status every minute
    return () => clearInterval(interval);
  }, [event.startTime, event.endTime]);

  const handleToggleReminder = async (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Toggle reminder for event:', event.id);
    
    // Toggle the local state immediately for responsiveness
    const isNowSet = toggleReminder(event.id);
    setHasReminder(isNowSet);

    if (isNowSet) {
      // Attempt to get permission in the background, but don't block the UI
      requestNotificationPermission().then(granted => {
        console.log('Notification permission result:', granted);
        if (granted) {
          const startTime = new Date(event.startTime);
          const tenMinsBefore = new Date(startTime.getTime() - 10 * 60 * 1000);
          scheduleNotification(
            `Event Starting Soon: ${event.name}`,
            tenMinsBefore,
            `${event.name} starts in 10 minutes!`
          );
        }
      }).catch(err => console.error('Silent notification error:', err));
      
      // Provide immediate visual feedback since system notifications might be blocked
      alert(`Reminder set for "${event.name}"!`);
    }
  };

  const statusColors = {
    Upcoming: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    Live: 'bg-red-500/10 text-red-500 border-red-500/20',
    Past: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[status]}`}>
          {status}
        </span>
        <div className="flex gap-2">
          {onEdit && (
            <button 
              onClick={onEdit}
              className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title="Edit Event"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete();
              }}
              className="p-2.5 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all z-20"
              title="Delete Event"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleToggleReminder(e);
            }}
            className={`p-2.5 rounded-full transition-all z-20 ${
              hasReminder 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
            title={hasReminder ? 'Remove Reminder' : 'Set Reminder'}
          >
            {hasReminder ? <Bell className="w-5 h-5 fill-current" /> : <BellOff className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <VerseLogo size="sm" className="shadow-none" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Hosted by {event.host}</p>
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 transition-colors">
            {event.name}
          </h3>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>{formatEventDate(event.startTime)} UTC</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Duration: 1 hour</span>
          </div>
        </div>

        <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
          {event.description}
        </p>

        {status === 'Upcoming' && <CountdownTimer targetDate={event.startTime} />}

        {hasReminder && (
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-600">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            Reminder Set
          </div>
        )}

        <div className="pt-4 flex flex-wrap gap-3">
          <a 
            href={event.joinUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onJoin}
            className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            Join Event
            <ExternalLink className="w-4 h-4" />
          </a>
          
          <div className="flex gap-2">
            <a 
              href={generateGoogleCalendarLink(event)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              title="Add to Google Calendar"
            >
              <Share2 className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            </a>
            <button 
              onClick={() => downloadIcsFile(event)}
              className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              title="Download .ics file"
            >
              <Download className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
