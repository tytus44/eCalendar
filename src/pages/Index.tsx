import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Download, Upload, FileText, Users, Settings } from 'lucide-react';
import CalendarGrid from '../components/CalendarGrid';
import EventModal from '../components/EventModal';
import { CalendarEvent, CalendarView } from '../types/calendar';
import { exportToICS, importFromICS } from '../utils/icsHandler';
import { useToast } from '../hooks/use-toast';

const Index = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<CalendarView>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const { toast } = useToast();

  // Load events from localStorage on mount
  useEffect(() => {
    const savedEvents = localStorage.getItem('calendar-events');
    if (savedEvents) {
      try {
        const parsedEvents = JSON.parse(savedEvents).map((event: any) => ({
          ...event,
          startDate: new Date(event.startDate),
          endDate: new Date(event.endDate),
        }));
        setEvents(parsedEvents);
      } catch (error) {
        console.error('Error loading events:', error);
      }
    }
  }, []);

  // Save events to localStorage whenever events change
  useEffect(() => {
    localStorage.setItem('calendar-events', JSON.stringify(events));
  }, [events]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedDate(null);
    setIsModalOpen(true);
  };

  const handleSaveEvent = (eventData: Partial<CalendarEvent>) => {
    if (selectedEvent) {
      // Update existing event
      const updatedEvents = events.map(event =>
        event.id === selectedEvent.id ? { ...event, ...eventData } : event
      );
      setEvents(updatedEvents);
      toast({
        title: "Evento aggiornato",
        description: "L'evento è stato aggiornato con successo.",
      });
    } else {
      // Create new event
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        title: eventData.title || '',
        description: eventData.description || '',
        startDate: eventData.startDate || selectedDate || new Date(),
        endDate: eventData.endDate || selectedDate || new Date(),
        type: eventData.type || 'appointment',
        color: eventData.color,
        allDay: eventData.allDay || false,
      };
      setEvents([...events, newEvent]);
      toast({
        title: "Evento creato",
        description: "Il nuovo evento è stato aggiunto al calendario.",
      });
    }
    setIsModalOpen(false);
  };

  const handleDeleteEvent = (eventId: string) => {
    const updatedEvents = events.filter(event => event.id !== eventId);
    setEvents(updatedEvents);
    setIsModalOpen(false);
    toast({
      title: "Evento eliminato",
      description: "L'evento è stato rimosso dal calendario.",
    });
  };

  const handleExportCalendar = () => {
    try {
      exportToICS(events);
      toast({
        title: "Calendario esportato",
        description: "Il file ICS è stato scaricato con successo.",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile esportare il calendario.",
        variant: "destructive",
      });
    }
  };

  const handleImportCalendar = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      importFromICS(file, (importedEvents) => {
        setEvents(prev => [...prev, ...importedEvents]);
        toast({
          title: "Calendario importato",
          description: `${importedEvents.length} eventi importati con successo.`,
        });
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile importare il calendario.",
        variant: "destructive",
      });
    }
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('it-IT', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Calendar Container */}
      <div className="calendar-container max-w-7xl mx-auto m-4">
        {/* Calendar Header */}
        <div className="calendar-header">
          <div className="calendar-title">
            <Calendar className="w-6 h-6" />
            Google Calendar Clone
          </div>
          <div className="calendar-nav">
            <button
              onClick={() => navigateMonth('prev')}
              className="calendar-nav-btn"
              title="Mese precedente"
            >
              ‹
            </button>
            <button
              onClick={goToToday}
              className="calendar-today-btn"
            >
              Oggi
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="calendar-nav-btn"
              title="Mese successivo"
            >
              ›
            </button>
          </div>
        </div>

        {/* Calendar Toolbar */}
        <div className="calendar-toolbar">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-foreground capitalize">
              {formatMonthYear(currentDate)}
            </h2>
            <div className="view-switcher">
              <button
                onClick={() => setView('month')}
                className={`view-btn ${view === 'month' ? 'active' : ''}`}
              >
                Mese
              </button>
              <button
                onClick={() => setView('week')}
                className={`view-btn ${view === 'week' ? 'active' : ''}`}
              >
                Settimana
              </button>
              <button
                onClick={() => setView('day')}
                className={`view-btn ${view === 'day' ? 'active' : ''}`}
              >
                Giorno
              </button>
            </div>
          </div>

          <div className="toolbar-actions">
            <button
              onClick={() => {
                setSelectedDate(new Date());
                setSelectedEvent(null);
                setIsModalOpen(true);
              }}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4" />
              Nuovo Evento
            </button>

            <div className="import-export-actions">
              <button
                onClick={handleExportCalendar}
                className="btn btn-secondary"
                title="Esporta calendario"
              >
                <Download className="w-4 h-4" />
                Esporta ICS
              </button>

              <div className="file-input-wrapper">
                <button className="btn btn-secondary">
                  <Upload className="w-4 h-4" />
                  Importa ICS
                </button>
                <input
                  type="file"
                  accept=".ics"
                  onChange={handleImportCalendar}
                  className="file-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <CalendarGrid
          currentDate={currentDate}
          view={view}
          events={events}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
        />
      </div>

      {/* Event Modal */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        event={selectedEvent}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default Index;