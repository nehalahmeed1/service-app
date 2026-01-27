import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const CancelModal = ({ isOpen, onClose, booking, onConfirm }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [acceptPolicy, setAcceptPolicy] = useState(false);
  const [loading, setLoading] = useState(false);

  const cancellationReasons = [
    { value: 'schedule_conflict', label: 'Schedule Conflict' },
    { value: 'emergency', label: 'Emergency Situation' },
    { value: 'found_alternative', label: 'Found Alternative Service' },
    { value: 'cost_concerns', label: 'Cost Concerns' },
    { value: 'provider_unavailable', label: 'Provider Unavailable' },
    { value: 'weather', label: 'Weather Conditions' },
    { value: 'other', label: 'Other Reason' }
  ];

  const calculateRefund = () => {
    const bookingDate = new Date(booking?.date);
    const today = new Date(2026, 0, 6);
    const daysUntilBooking = Math.ceil((bookingDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntilBooking >= 7) return 100;
    if (daysUntilBooking >= 3) return 75;
    if (daysUntilBooking >= 1) return 50;
    return 0;
  };

  const refundPercentage = calculateRefund();
  const refundAmount = (booking?.cost * refundPercentage) / 100;

  const handleConfirm = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    onConfirm({
      ...booking,
      cancellationReason: selectedReason,
      cancellationDetails: additionalDetails,
      refundAmount
    });
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-background/95 animate-fade-in p-4">
      <div className="w-full max-w-2xl bg-card rounded-xl shadow-2xl overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-error/10 rounded-lg">
              <Icon name="XCircle" size={24} className="text-error" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold">Cancel Booking</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg smooth-transition">
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="p-4 md:p-6 space-y-6">
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={20} className="text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium mb-1">Booking Details</p>
                <p className="text-sm text-muted-foreground">
                  {booking?.serviceType} scheduled for {new Date(booking?.date)?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
                <p className="text-sm font-semibold mt-2">Total Cost: ${booking?.cost?.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <Select
            label="Reason for Cancellation"
            options={cancellationReasons}
            value={selectedReason}
            onChange={setSelectedReason}
            placeholder="Select a reason"
            required
          />

          <Input
            type="text"
            label="Additional Details (Optional)"
            placeholder="Provide more context about your cancellation"
            value={additionalDetails}
            onChange={(e) => setAdditionalDetails(e?.target?.value)}
            description="This helps us improve our service"
          />

          <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
            <div className="flex items-start gap-3 mb-3">
              <Icon name="DollarSign" size={20} className="text-success flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-success mb-1">Refund Information</p>
                <p className="text-sm text-muted-foreground mb-3">
                  Based on our cancellation policy, you are eligible for a {refundPercentage}% refund.
                </p>
                <div className="flex items-center justify-between p-3 bg-card rounded-lg">
                  <span className="text-sm font-medium">Refund Amount:</span>
                  <span className="text-lg font-bold text-success">${refundAmount?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Icon name="AlertCircle" size={20} className="text-warning flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-warning mb-2">Cancellation Policy</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• 7+ days before: 100% refund</li>
                  <li>• 3-6 days before: 75% refund</li>
                  <li>• 1-2 days before: 50% refund</li>
                  <li>• Same day: No refund</li>
                </ul>
              </div>
            </div>
          </div>

          <Checkbox
            label="I understand the cancellation policy and agree to proceed"
            checked={acceptPolicy}
            onChange={(e) => setAcceptPolicy(e?.target?.checked)}
            required
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 p-4 md:p-6 border-t border-border sticky bottom-0 bg-card">
          <Button variant="outline" fullWidth onClick={onClose}>
            Keep Booking
          </Button>
          <Button
            variant="destructive"
            fullWidth
            loading={loading}
            onClick={handleConfirm}
            disabled={!selectedReason || !acceptPolicy}
          >
            Confirm Cancellation
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CancelModal;