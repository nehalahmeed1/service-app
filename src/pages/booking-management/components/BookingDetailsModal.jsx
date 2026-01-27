import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const BookingDetailsModal = ({ isOpen, onClose, booking, userRole }) => {
  if (!isOpen) return null;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr?.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-success';
      case 'pending': return 'text-warning';
      case 'completed': return 'text-primary';
      case 'cancelled': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-background/95 animate-fade-in p-4">
      <div className="w-full max-w-3xl bg-card rounded-xl shadow-2xl overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon name="FileText" size={24} className="text-primary" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold">Booking Details</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg smooth-transition">
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="p-4 md:p-6 space-y-6">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Booking ID</p>
              <p className="font-mono font-semibold">#{booking?.id}</p>
            </div>
            <div className={`text-right ${getStatusColor(booking?.status)}`}>
              <p className="text-sm mb-1">Status</p>
              <p className="font-semibold capitalize">{booking?.status}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">
                {userRole === 'customer' ? 'Service Provider' : 'Customer Information'}
              </h4>
              <div className="flex items-start gap-4">
                <Image
                  src={userRole === 'customer' ? booking?.providerImage : booking?.customerImage}
                  alt={userRole === 'customer' ? booking?.providerImageAlt : booking?.customerImageAlt}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div>
                  <p className="font-semibold text-lg mb-1">
                    {userRole === 'customer' ? booking?.providerName : booking?.customerName}
                  </p>
                  {userRole === 'customer' && booking?.providerRating && (
                    <div className="flex items-center gap-1 mb-2">
                      <Icon name="Star" size={16} className="text-warning fill-warning" />
                      <span className="text-sm font-medium">{booking?.providerRating}</span>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {userRole === 'customer' ? booking?.providerPhone : booking?.customerPhone}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {userRole === 'customer' ? booking?.providerEmail : booking?.customerEmail}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Service Details</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Icon name="Wrench" size={20} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Service Type</p>
                    <p className="font-medium">{booking?.serviceType}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="Calendar" size={20} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{formatDate(booking?.date)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="Clock" size={20} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time &amp; Duration</p>
                    <p className="font-medium">{formatTime(booking?.time)} ({booking?.duration})</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Location</h4>
            <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
              <Icon name="MapPin" size={20} className="text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-sm">{booking?.location}</p>
            </div>
            <div className="w-full h-48 md:h-64 rounded-lg overflow-hidden bg-muted">
              <iframe
                width="100%"
                height="100%"
                loading="lazy"
                title={booking?.location}
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${booking?.latitude},${booking?.longitude}&z=14&output=embed`}
              />
            </div>
          </div>

          {booking?.notes && (
            <div className="space-y-3">
              <h4 className="font-semibold text-lg">Additional Notes</h4>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">{booking?.notes}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Payment Information</h4>
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Service Cost</span>
                <span className="font-medium">${booking?.cost?.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Platform Fee</span>
                <span className="font-medium">${(booking?.cost * 0.1)?.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="font-semibold">Total Amount</span>
                <span className="text-xl font-bold text-primary">${(booking?.cost * 1.1)?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {booking?.status === 'completed' && booking?.completedDate && (
            <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Icon name="CheckCircle2" size={20} className="text-success flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-success mb-1">Service Completed</p>
                  <p className="text-sm text-muted-foreground">
                    Completed on {formatDate(booking?.completedDate)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 p-4 md:p-6 border-t border-border sticky bottom-0 bg-card">
          <Button variant="outline" fullWidth onClick={onClose}>
            Close
          </Button>
          {booking?.status === 'completed' && (
            <Button variant="default" fullWidth iconName="Star" iconPosition="left">
              Leave Review
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;