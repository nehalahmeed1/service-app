import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';


const AvailabilityCalendar = ({ availability, onUpdateAvailability }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
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

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date?.toDateString() === today?.toDateString();
  };

  const isSelected = (date) => {
    if (!date) return false;
    return date?.toDateString() === selectedDate?.toDateString();
  };

  const isAvailable = (date) => {
    if (!date) return false;
    const dateStr = date?.toISOString()?.split('T')?.[0];
    return availability?.includes(dateStr);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (date) => {
    if (date) {
      setSelectedDate(date);
      onUpdateAvailability(date);
    }
  };

  const monthYear = currentMonth?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const days = getDaysInMonth(currentMonth);

  return (
    <div className="bg-card rounded-xl p-4 md:p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{monthYear}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-muted rounded-lg smooth-transition"
          >
            <Icon name="ChevronLeft" size={20} />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-muted rounded-lg smooth-transition"
          >
            <Icon name="ChevronRight" size={20} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
        {daysOfWeek?.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {days?.map((date, index) => (
          <button
            key={index}
            onClick={() => handleDateClick(date)}
            disabled={!date}
            className={`aspect-square flex items-center justify-center rounded-lg text-sm smooth-transition ${
              !date
                ? 'invisible'
                : isSelected(date)
                ? 'bg-primary text-primary-foreground font-semibold'
                : isToday(date)
                ? 'bg-accent/20 text-accent font-semibold'
                : isAvailable(date)
                ? 'bg-success/10 text-success hover:bg-success/20' :'hover:bg-muted text-foreground'
            }`}
          >
            {date && date?.getDate()}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-4 rounded bg-success/10 border border-success/20"></div>
          <span className="text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-4 rounded bg-accent/20 border border-accent/30"></div>
          <span className="text-muted-foreground">Today</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-4 rounded bg-primary border border-primary"></div>
          <span className="text-muted-foreground">Selected</span>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;