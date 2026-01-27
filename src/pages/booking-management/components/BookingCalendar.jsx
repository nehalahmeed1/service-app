import React, { useState } from 'react';

import Button from '../../../components/ui/Button';

const BookingCalendar = ({ bookings, onDateSelect, selectedDate, userRole }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 1));

  const getDaysInMonth = (date) => {
    const year = date?.getFullYear();
    const month = date?.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay?.getDate();
    const startingDayOfWeek = firstDay?.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);

  const getBookingsForDate = (day) => {
    const dateStr = `${year}-${String(month + 1)?.padStart(2, '0')}-${String(day)?.padStart(2, '0')}`;
    return bookings?.filter(booking => booking?.date === dateStr);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (day) => {
    const dateStr = `${year}-${String(month + 1)?.padStart(2, '0')}-${String(day)?.padStart(2, '0')}`;
    onDateSelect(dateStr);
  };

  const isToday = (day) => {
    const today = new Date(2026, 0, 6);
    return day === today?.getDate() && month === today?.getMonth() && year === today?.getFullYear();
  };

  const isSelected = (day) => {
    if (!selectedDate) return false;
    const dateStr = `${year}-${String(month + 1)?.padStart(2, '0')}-${String(day)?.padStart(2, '0')}`;
    return dateStr === selectedDate;
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-card rounded-xl shadow-md border border-border overflow-hidden">
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-border bg-muted/30">
        <h3 className="text-lg md:text-xl font-semibold">
          {monthNames?.[month]} {year}
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            iconName="ChevronLeft"
            onClick={handlePrevMonth}
            className="w-8 h-8 md:w-10 md:h-10"
          />
          <Button
            variant="outline"
            size="sm"
            iconName="ChevronRight"
            onClick={handleNextMonth}
            className="w-8 h-8 md:w-10 md:h-10"
          />
        </div>
      </div>
      <div className="p-4 md:p-6">
        <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
          {dayNames?.map(day => (
            <div key={day} className="text-center text-xs md:text-sm font-medium text-muted-foreground py-2">
              <span className="hidden md:inline">{day}</span>
              <span className="md:hidden">{day?.charAt(0)}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {Array.from({ length: startingDayOfWeek })?.map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}

          {Array.from({ length: daysInMonth })?.map((_, index) => {
            const day = index + 1;
            const dayBookings = getBookingsForDate(day);
            const hasBookings = dayBookings?.length > 0;

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={`aspect-square rounded-lg border-2 transition-all relative flex flex-col items-center justify-center text-sm md:text-base ${
                  isSelected(day)
                    ? 'border-primary bg-primary text-primary-foreground shadow-md'
                    : isToday(day)
                    ? 'border-accent bg-accent/10 text-accent font-semibold'
                    : hasBookings
                    ? 'border-border bg-muted hover:bg-muted/80' :'border-border hover:bg-muted/50'
                }`}
              >
                <span className={isToday(day) && !isSelected(day) ? 'font-bold' : ''}>{day}</span>
                {hasBookings && (
                  <div className="flex gap-0.5 mt-1">
                    {dayBookings?.slice(0, 3)?.map((booking, idx) => (
                      <div
                        key={idx}
                        className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full ${
                          booking?.status === 'confirmed' ? 'bg-success' :
                          booking?.status === 'pending' ? 'bg-warning' :
                          booking?.status === 'completed'? 'bg-primary' : 'bg-error'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 md:gap-4 p-4 md:p-6 border-t border-border bg-muted/30 text-xs md:text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span>Confirmed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-warning" />
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-error" />
          <span>Cancelled</span>
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;