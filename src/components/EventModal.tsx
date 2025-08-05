import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Users, Bell, FileText } from 'lucide-react';
import { CalendarEvent, EventType } from '../types/calendar';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Partial<CalendarEvent>) => void;
  onDelete?: (eventId: string) => void;
  event?: CalendarEvent | null;
  selectedDate?: Date | null;
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  event,
  selectedDate,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    type: 'appointment' as EventType,
    location: '',
    allDay: false,
    reminder: 0,
  });

  useEffect(() => {
    if (event) {
      // Edit existing event
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      
      setFormData({
        title: event.title,
        description: event.description || '',
        startDate: startDate.toISOString().split('T')[0],
        startTime: event.allDay ? '' : startDate.toTimeString().slice(0, 5),
        endDate: endDate.toISOString().split('T')[0],
        endTime: event.allDay ? '' : endDate.toTimeString().slice(0, 5),
        type: event.type,
        location: event.location || '',
        allDay: event.allDay || false,
        reminder: event.reminder || 0,
      });
    } else if (selectedDate) {
      // New event
      const date = selectedDate.toISOString().split('T')[0];
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);
      const endTime = new Date(now.getTime() + 60 * 60 * 1000).toTimeString().slice(0, 5);
      
      setFormData({
        title: '',
        description: '',
        startDate: date,
        startTime: currentTime,
        endDate: date,
        endTime: endTime,
        type: 'appointment',
        location: '',
        allDay: false,
        reminder: 0,
      });
    }
  }, [event, selectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;

    let startDate: Date;
    let endDate: Date;

    if (formData.allDay) {
      startDate = new Date(formData.startDate + 'T00:00:00');
      endDate = new Date(formData.endDate + 'T23:59:59');
    } else {
      startDate = new Date(formData.startDate + 'T' + formData.startTime);
      endDate = new Date(formData.endDate + 'T' + formData.endTime);
    }

    const eventData: Partial<CalendarEvent> = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      startDate,
      endDate,
      type: formData.type,
      location: formData.location.trim(),
      allDay: formData.allDay,
      reminder: formData.reminder,
    };

    onSave(eventData);
  };

  const handleDelete = () => {
    if (event && onDelete) {
      if (confirm('Sei sicuro di voler eliminare questo evento?')) {
        onDelete(event.id);
      }
    }
  };

  const eventTypeOptions = [
    { value: 'appointment', label: 'Appuntamento', icon: Calendar },
    { value: 'task', label: 'Task', icon: FileText },
    { value: 'meeting', label: 'Riunione', icon: Users },
    { value: 'reminder', label: 'Promemoria', icon: Bell },
  ];

  const reminderOptions = [
    { value: 0, label: 'Nessuno' },
    { value: 5, label: '5 minuti prima' },
    { value: 15, label: '15 minuti prima' },
    { value: 30, label: '30 minuti prima' },
    { value: 60, label: '1 ora prima' },
    { value: 1440, label: '1 giorno prima' },
  ];

  if (!isOpen) return null;

  return (
    <div className="event-modal active">
      <div className="event-modal-content">
        <div className="event-modal-header">
          <h2 className="event-modal-title">
            {event ? 'Modifica Evento' : 'Nuovo Evento'}
          </h2>
          <button
            onClick={onClose}
            className="event-modal-close"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="event-modal-body">
          <form onSubmit={handleSubmit} className="event-form">
            {/* Title */}
            <div className="form-group">
              <label htmlFor="title">Titolo *</label>
              <input
                id="title"
                type="text"
                className="form-input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Inserisci il titolo dell'evento"
                required
              />
            </div>

            {/* Event Type */}
            <div className="form-group">
              <label htmlFor="type">Tipo</label>
              <select
                id="type"
                className="form-select"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as EventType })}
              >
                {eventTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* All Day Toggle */}
            <div className="form-group">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allDay}
                  onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
                  className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                Tutto il giorno
              </label>
            </div>

            {/* Date and Time */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Data inizio *</label>
                <input
                  id="startDate"
                  type="date"
                  className="form-input"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="endDate">Data fine *</label>
                <input
                  id="endDate"
                  type="date"
                  className="form-input"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            {!formData.allDay && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startTime">Ora inizio</label>
                  <input
                    id="startTime"
                    type="time"
                    className="form-input"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="endTime">Ora fine</label>
                  <input
                    id="endTime"
                    type="time"
                    className="form-input"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Location */}
            <div className="form-group">
              <label htmlFor="location">
                <MapPin className="w-4 h-4 inline mr-1" />
                Luogo
              </label>
              <input
                id="location"
                type="text"
                className="form-input"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Dove si svolge l'evento"
              />
            </div>

            {/* Reminder */}
            <div className="form-group">
              <label htmlFor="reminder">
                <Bell className="w-4 h-4 inline mr-1" />
                Promemoria
              </label>
              <select
                id="reminder"
                className="form-select"
                value={formData.reminder}
                onChange={(e) => setFormData({ ...formData, reminder: parseInt(e.target.value) })}
              >
                {reminderOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="description">Descrizione</label>
              <textarea
                id="description"
                className="form-textarea"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Aggiungi note o dettagli aggiuntivi"
                rows={3}
              />
            </div>

            {/* Import/Export Section */}
            <div className="import-export-section">
              <h3 className="text-sm font-medium text-foreground mb-2">
                Gestione Eventi
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                Puoi importare ed esportare eventi in formato ICS compatibile con Google Calendar
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3 mt-6">
              <div>
                {event && onDelete && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="btn btn-danger"
                  >
                    Elimina
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {event ? 'Aggiorna' : 'Crea'} Evento
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventModal;