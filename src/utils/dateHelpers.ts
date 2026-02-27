import { format, isAfter, isBefore, intervalToDuration } from 'date-fns';

export type EventStatus = 'Upcoming' | 'Live' | 'Past';

export const getEventStatus = (startTime: string, endTime: string): EventStatus => {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isBefore(now, start)) {
    return 'Upcoming';
  } else if (isAfter(now, end)) {
    return 'Past';
  } else {
    return 'Live';
  }
};

export const formatEventDate = (dateString: string) => {
  return format(new Date(dateString), 'MMM d, yyyy • HH:mm');
};

export const getCountdown = (targetDate: string) => {
  const now = new Date();
  const target = new Date(targetDate);

  if (isAfter(now, target)) {
    return null;
  }

  const duration = intervalToDuration({ start: now, end: target });
  
  const parts = [];
  if (duration.days) parts.push(`${duration.days}d`);
  if (duration.hours || duration.days) parts.push(`${duration.hours}h`);
  if (duration.minutes || duration.hours || duration.days) parts.push(`${duration.minutes}m`);
  parts.push(`${duration.seconds}s`);

  return parts.join(' ');
};

export const generateGoogleCalendarLink = (event: { name: string; startTime: string; endTime: string; description: string }) => {
  const start = new Date(event.startTime).toISOString().replace(/-|:|\.\d\d\d/g, '');
  const end = new Date(event.endTime).toISOString().replace(/-|:|\.\d\d\d/g, '');
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.name,
    dates: `${start}/${end}`,
    details: event.description,
    location: 'Online',
  });

  return `https://www.google.com/calendar/render?${params.toString()}`;
};

export const downloadIcsFile = (event: { name: string; startTime: string; endTime: string; description: string }) => {
  const start = new Date(event.startTime).toISOString().replace(/-|:|\.\d\d\d/g, '');
  const end = new Date(event.endTime).toISOString().replace(/-|:|\.\d\d\d/g, '');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.name}`,
    `DESCRIPTION:${event.description}`,
    'LOCATION:Online',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${event.name.replace(/\s+/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
