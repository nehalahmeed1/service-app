import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AvailabilityTab = ({ availability, onBookSlot }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const getDaysInMonth = (date) => {
    const year = date?.getFullYear();
    const month = date?.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay?.getDate();
    const startingDayOfWeek = firstDay?.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days?.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days?.push(new Date(year, month, i));
    }
    return days;
  };

  const days = getDaysInMonth(selectedDate);

  const changeMonth = (offset) => {
    const newDate = new Date(selectedDate);
    newDate?.setMonth(newDate?.getMonth() + offset);
    setSelectedDate(newDate);
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date?.toDateString() === today?.toDateString();
  };

  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    return date1?.toDateString() === date2?.toDateString();
  };

  const getAvailabilityForDate = (date) => {
    if (!date) return [];
    const dateStr = date?.toISOString()?.split('T')?.[0];
    return availability?.[dateStr] || [];
  };

  const selectedDateSlots = getAvailabilityForDate(selectedDate);

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl shadow-sm border border-border p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg md:text-xl font-semibold">
            {monthNames?.[selectedDate?.getMonth()]} {selectedDate?.getFullYear()}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => changeMonth(-1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-muted hover:bg-muted/80 smooth-transition"
            >
              <Icon name="ChevronLeft" size={18} />
            </button>
            <button
              onClick={() => changeMonth(1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-muted hover:bg-muted/80 smooth-transition"
            >
              <Icon name="ChevronRight" size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {daysOfWeek?.map((day) => (
            <div key={day} className="text-center text-xs md:text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days?.map((day, index) => {
            const hasSlots = day && getAvailabilityForDate(day)?.length > 0;
            const isSelected = day && isSameDay(day, selectedDate);
            const isPast = day && day < new Date()?.setHours(0, 0, 0, 0);

            return (
              <button
                key={index}
                onClick={() => day && !isPast && setSelectedDate(day)}
                disabled={!day || isPast}
                className={`aspect-square flex items-center justify-center rounded-lg text-sm md:text-base smooth-transition ${
                  !day
                    ? 'invisible'
                    : isPast
                    ? 'text-muted-foreground/50 cursor-not-allowed'
                    : isSelected
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : hasSlots
                    ? 'bg-success/10 text-success hover:bg-success/20 font-medium' :'bg-muted text-muted-foreground hover:bg-muted/80'
                } ${isToday(day) && !isSelected ? 'ring-2 ring-primary' : ''}`}
              >
                {day && day?.getDate()}
              </button>
            );
          })}
        </div>
      </div>
      <div className="bg-card rounded-xl shadow-sm border border-border p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-semibold mb-4">
          Available Time Slots - {selectedDate?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </h3>

        {selectedDateSlots?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Calendar" size={48} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">No available slots for this date</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {selectedDateSlots?.map((slot) => (
              <button
                key={slot?.id}
                onClick={() => setSelectedSlot(slot)}
                className={`p-3 rounded-lg border-2 text-sm font-medium smooth-transition ${
                  selectedSlot?.id === slot?.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : slot?.available
                    ? 'border-border hover:border-primary/50 hover:bg-muted' :'border-border bg-muted text-muted-foreground cursor-not-allowed'
                }`}
                disabled={!slot?.available}
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Icon name="Clock" size={14} />
                  <span>{slot?.time}</span>
                </div>
                {!slot?.available && (
                  <div className="text-xs text-error">Booked</div>
                )}
              </button>
            ))}
          </div>
        )}

        {selectedSlot && (
          <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Selected Slot</div>
                <div className="font-semibold text-lg">
                  {selectedDate?.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} at {selectedSlot?.time}
                </div>
              </div>
              <Button
                variant="default"
                iconName="Calendar"
                iconPosition="left"
                onClick={() => onBookSlot(selectedDate, selectedSlot)}
              >
                Book This Slot
              </Button>
            </div>
          </div>
        )}
      </div>
      <div className="bg-card rounded-xl shadow-sm border border-border p-4 md:p-6">
        <h4 className="font-semibold mb-3">Booking Information</h4>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <Icon name="Info" size={16} className="flex-shrink-0 mt-0.5" />
            <span>Bookings must be made at least 24 hours in advance</span>
          </div>
          <div className="flex items-start gap-2">
            <Icon name="Info" size={16} className="flex-shrink-0 mt-0.5" />
            <span>Free cancellation up to 12 hours before scheduled time</span>
          </div>
          <div className="flex items-start gap-2">
            <Icon name="Info" size={16} className="flex-shrink-0 mt-0.5" />
            <span>Provider will confirm booking within 2 hours</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityTab;