import { useState, useEffect } from 'react';
import { Bell, BellOff, ShieldCheck } from 'lucide-react';
import { requestNotificationPermission } from '../utils/notificationService';

export default function NotificationToggle() {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const handleRequest = async () => {
    console.log('Notification request initiated');
    try {
      const granted = await requestNotificationPermission();
      console.log('Notification permission result:', granted);
      setPermission(granted ? 'granted' : 'denied');
      
      if (granted) {
        new Notification('Notifications Enabled!', {
          body: 'You will now receive reminders for Verse events.',
          icon: '/vite.svg'
        });
      } else {
        alert('Notification permission denied or blocked by browser. Please check your site settings.');
      }
    } catch (err) {
      console.error('Failed to enable notifications:', err);
      alert('Could not enable notifications in this environment. Browsers often block notifications in iframes.');
    }
  };

  if (permission === 'granted') {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium border border-blue-600/20">
        <ShieldCheck className="w-4 h-4" />
        <span>Notifications Active</span>
      </div>
    );
  }

  return (
    <button 
      onClick={handleRequest}
      className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
    >
      <Bell className="w-4 h-4" />
      <span>Enable Notifications</span>
    </button>
  );
}
