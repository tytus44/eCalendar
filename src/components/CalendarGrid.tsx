import React from 'react';
import { CalendarEvent, CalendarView } from '../types/calendar';

interface CalendarGridProps {
  currentDate: Date;
  view: CalendarView;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  view,
  events,
  onDateClick,
  onEventClick,
}) => {
  const weekdays = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from the Sunday of the week containing the first day
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // End at the Saturday of the week containing the last day
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    const days = [];
    const currentDay = new Date(startDate);
    
    while (currentDay <= endDate) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isCurrentMonth = (date: Date) => {
    return (
      date.getMonth() === currentDate.getMonth() &&
      date.getFullYear() === currentDate.getFullYear()
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEventTypeClass = (type: string) => {
    switch (type) {
      case 'task':
        return 'calendar-event task';
      case 'appointment':
        return 'calendar-event appointment';
      case 'meeting':
        return 'calendar-event';
      default:
        return 'calendar-event';
    }
  };

  if (view === 'month') {
    const monthDays = getMonthDays(currentDate);

    return (
      <div className="calendar-grid-container">
        {/* Weekday Headers */}
        <div className="calendar-weekdays">
          {weekdays.map((day) => (
            <div key={day} className="calendar-weekday">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="calendar-grid">
          {monthDays.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonthDay = isCurrentMonth(day);
            const isTodayDay = isToday(day);

            return (
              <div
                key={index}
                className={`calendar-day ${
                  !isCurrentMonthDay ? 'other-month' : ''
                } ${isTodayDay ? 'today' : ''}`}
                onClick={() => onDateClick(day)}
              >
                <div className="calendar-day-number">
                  {day.getDate()}
                </div>
                <div className="calendar-events">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className={getEventTypeClass(event.type)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      title={`${event.title} ${!event.allDay ? `- ${formatTime(event.startDate)}` : ''}`}
                    >
                      {event.allDay ? event.title : `${formatTime(event.startDate)} ${event.title}`}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="calendar-event-more">
                      +{dayEvents.length - 3} altro/i
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Week view
  if (view === 'week') {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }

    return (
      <div className="calendar-grid-container">
        <div className="calendar-weekdays">
          {weekDays.map((day, index) => (
            <div key={index} className="calendar-weekday">
              <div className="text-sm font-medium">{weekdays[day.getDay()]}</div>
              <div className={`text-lg ${isToday(day) ? 'font-bold text-primary' : ''}`}>
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>
        <div className="calendar-grid">
          {weekDays.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            return (
              <div
                key={index}
                className={`calendar-day ${isToday(day) ? 'today' : ''}`}
                onClick={() => onDateClick(day)}
              >
                <div className="calendar-events">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className={getEventTypeClass(event.type)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      title={event.title}
                    >
                      {event.allDay ? event.title : `${formatTime(event.startDate)} ${event.title}`}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Day view
  const dayEvents = getEventsForDate(currentDate).sort((a, b) => 
    a.startDate.getTime() - b.startDate.getTime()
  );

  return (
    <div className="calendar-day-view p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">
          {currentDate.toLocaleDateString('it-IT', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </h3>
      </div>
      <div className="space-y-2">
        {dayEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nessun evento per oggi
          </div>
        ) : (
          dayEvents.map((event) => (
            <div
              key={event.id}
              className="bg-card border rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onEventClick(event)}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{event.title}</h4>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  event.type === 'task' ? 'bg-amber-100 text-amber-800' :
                  event.type === 'appointment' ? 'bg-cyan-100 text-cyan-800' :
                  'bg-indigo-100 text-indigo-800'
                }`}>
                  {event.type === 'task' ? 'Task' : 
                   event.type === 'appointment' ? 'Appuntamento' : 'Evento'}
                </span>
              </div>
              {!event.allDay && (
                <div className="text-sm text-muted-foreground mt-1">
                  {formatTime(event.startDate)} - {formatTime(event.endDate)}
                </div>
              )}
              {event.description && (
                <div className="text-sm text-muted-foreground mt-2">
                  {event.description}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <button
        onClick={() => onDateClick(currentDate)}
        className="btn btn-primary mt-4 w-full"
      >
        Aggiungi Evento
      </button>
    </div>
  );
};

export default CalendarGrid;