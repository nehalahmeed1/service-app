import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const RescheduleModal = ({ isOpen, onClose, booking, onConfirm }) => {
  const [selectedDate, setSelectedDate] = useState(booking?.date || '');
  const [selectedTime, setSelectedTime] = useState(booking?.time || '');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const availableTimeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const handleConfirm = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    onConfirm({
      ...booking,
      date: selectedDate,
      time: selectedTime,
      rescheduleReason: reason
    });
    setLoading(false);
    onClose();
  };

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr?.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-background/95 animate-fade-in p-4">
      <div className="w-full max-w-2xl bg-card rounded-xl shadow-2xl overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon name="Calendar" size={24} className="text-primary" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold">Reschedule Booking</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg smooth-transition">
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="p-4 md:p-6 space-y-6">
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-start gap-3 mb-3">
              <Icon name="Info" size={20} className="text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium mb-1">Current Booking Details</p>
                <p className="text-sm text-muted-foreground">
                  {booking?.serviceType} on {new Date(booking?.date)?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at {formatTime(booking?.time)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              type="date"
              label="New Date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e?.target?.value)}
              min={new Date()?.toISOString()?.split('T')?.[0]}
              required
            />

            <div>
              <label className="block text-sm font-medium mb-3">Select Time Slot</label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {availableTimeSlots?.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      selectedTime === time
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary/50 hover:bg-muted'
                    }`}
                  >
                    {formatTime(time)}
                  </button>
                ))}
              </div>
            </div>

            <Input
              type="text"
              label="Reason for Rescheduling (Optional)"
              placeholder="e.g., Schedule conflict, emergency"
              value={reason}
              onChange={(e) => setReason(e?.target?.value)}
              description="Help us understand why you need to reschedule"
            />
          </div>

          <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Icon name="AlertCircle" size={20} className="text-warning flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-warning mb-1">Rescheduling Policy</p>
                <p className="text-muted-foreground">
                  Both parties will be notified of this change. Please ensure the new time works for everyone involved.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 p-4 md:p-6 border-t border-border sticky bottom-0 bg-card">
          <Button variant="outline" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="default"
            fullWidth
            loading={loading}
            onClick={handleConfirm}
            disabled={!selectedDate || !selectedTime}
          >
            Confirm Reschedule
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RescheduleModal;