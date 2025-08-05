import { CalendarEvent } from '../types/calendar';

export const exportToICS = (events: CalendarEvent[]) => {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const formatText = (text: string): string => {
    return text.replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  };

  let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Google Calendar Clone//Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;

  events.forEach(event => {
    const uid = `${event.id}@calendar-clone.local`;
    const dtstart = formatDate(event.startDate);
    const dtend = formatDate(event.endDate);
    const summary = formatText(event.title);
    const description = formatText(event.description || '');
    const location = formatText(event.location || '');
    
    icsContent += `BEGIN:VEVENT
UID:${uid}
DTSTART:${dtstart}
DTEND:${dtend}
SUMMARY:${summary}
DESCRIPTION:${description}
LOCATION:${location}
STATUS:CONFIRMED
SEQUENCE:0
TRANSP:OPAQUE
`;

    if (event.allDay) {
      icsContent += `DTSTART;VALUE=DATE:${event.startDate.toISOString().split('T')[0].replace(/-/g, '')}
DTEND;VALUE=DATE:${event.endDate.toISOString().split('T')[0].replace(/-/g, '')}
`;
    }

    if (event.reminder && event.reminder > 0) {
      icsContent += `BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:Reminder
TRIGGER:-PT${event.reminder}M
END:VALARM
`;
    }

    icsContent += `END:VEVENT
`;
  });

  icsContent += `END:VCALENDAR`;

  // Create and download the file
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `calendar-export-${new Date().toISOString().split('T')[0]}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

export const importFromICS = (file: File, onImport: (events: CalendarEvent[]) => void) => {
  const reader = new FileReader();
  
  reader.onload = (e) => {
    const content = e.target?.result as string;
    if (!content) return;

    const events: CalendarEvent[] = [];
    const lines = content.split('\n').map(line => line.trim());
    
    let currentEvent: Partial<CalendarEvent> | null = null;
    let isInEvent = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line === 'BEGIN:VEVENT') {
        isInEvent = true;
        currentEvent = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          type: 'appointment',
          allDay: false,
        };
        continue;
      }
      
      if (line === 'END:VEVENT' && currentEvent && isInEvent) {
        if (currentEvent.title && currentEvent.startDate && currentEvent.endDate) {
          events.push(currentEvent as CalendarEvent);
        }
        currentEvent = null;
        isInEvent = false;
        continue;
      }
      
      if (!isInEvent || !currentEvent) continue;
      
      const [property, ...valueParts] = line.split(':');
      const value = valueParts.join(':');
      
      switch (property.split(';')[0]) {
        case 'SUMMARY':
          currentEvent.title = value.replace(/\n/g, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';');
          break;
        case 'DESCRIPTION':
          currentEvent.description = value.replace(/\n/g, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';');
          break;
        case 'DTSTART':
          if (property.includes('VALUE=DATE')) {
            // All-day event
            currentEvent.startDate = new Date(value.substring(0, 4) + '-' + value.substring(4, 6) + '-' + value.substring(6, 8));
            currentEvent.allDay = true;
          } else {
            // Regular event with time
            const dateStr = value.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?/, '$1-$2-$3T$4:$5:$6Z');
            currentEvent.startDate = new Date(dateStr);
          }
          break;
        case 'DTEND':
          if (property.includes('VALUE=DATE')) {
            // All-day event
            currentEvent.endDate = new Date(value.substring(0, 4) + '-' + value.substring(4, 6) + '-' + value.substring(6, 8));
            currentEvent.allDay = true;
          } else {
            // Regular event with time
            const dateStr = value.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?/, '$1-$2-$3T$4:$5:$6Z');
            currentEvent.endDate = new Date(dateStr);
          }
          break;
        case 'LOCATION':
          currentEvent.location = value.replace(/\n/g, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';');
          break;
        case 'UID':
          // Keep the original ID if it's in a recognizable format, otherwise generate new
          if (!value.includes('@')) {
            currentEvent.id = value;
          }
          break;
      }
    }
    
    onImport(events);
  };
  
  reader.readAsText(file);
};
