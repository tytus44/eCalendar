export type CalendarView = 'month' | 'week' | 'day';

export type EventType = 'appointment' | 'task' | 'meeting' | 'reminder';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  type: EventType;
  color?: string;
  allDay?: boolean;
  location?: string;
  attendees?: string[];
  reminder?: number; // minutes before event
}