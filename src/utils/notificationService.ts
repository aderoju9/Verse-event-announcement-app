export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications.');
    return false;
  }

  try {
    if (Notification.permission === 'granted') {
      return true;
    }

    // Some browsers might not support the promise-based requestPermission
    const permission = await new Promise<NotificationPermission>((resolve) => {
      const result = Notification.requestPermission(resolve);
      if (result) {
        result.then(resolve);
      }
    });
    
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

export const sendNotification = (title: string, options?: NotificationOptions) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/vite.svg',
      ...options,
    });
  }
};

export const scheduleNotification = (title: string, time: Date, body: string) => {
  const now = new Date().getTime();
  const targetTime = time.getTime();
  const delay = targetTime - now;

  if (delay > 0) {
    setTimeout(() => {
      sendNotification(title, { body });
    }, delay);
    return true;
  }
  return false;
};

// Local Storage for Reminders
const REMINDERS_KEY = 'verse_event_reminders';

export const getReminders = (): string[] => {
  const stored = localStorage.getItem(REMINDERS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const toggleReminder = (eventId: string): boolean => {
  const reminders = getReminders();
  const index = reminders.indexOf(eventId);
  let isSet = false;

  if (index === -1) {
    reminders.push(eventId);
    isSet = true;
  } else {
    reminders.splice(index, 1);
    isSet = false;
  }

  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  return isSet;
};

export const isReminderSet = (eventId: string): boolean => {
  return getReminders().includes(eventId);
};
