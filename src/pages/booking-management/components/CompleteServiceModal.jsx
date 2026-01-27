import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const CompleteServiceModal = ({ isOpen, onClose, booking, onConfirm }) => {
  const [completionNotes, setCompletionNotes] = useState('');
  const [actualCost, setActualCost] = useState(booking?.cost || 0);
  const [confirmCompletion, setConfirmCompletion] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    onConfirm({
      ...booking,
      status: 'completed',
      completionNotes,
      actualCost,
      completedDate: new Date()?.toISOString()?.split('T')?.[0]
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
            <div className="p-2 bg-success/10 rounded-lg">
              <Icon name="CheckCircle2" size={24} className="text-success" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold">Complete Service</h3>
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
                <p className="text-sm font-medium mb-1">Service Details</p>
                <p className="text-sm text-muted-foreground">
                  {booking?.serviceType} for {booking?.customerName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(booking?.date)?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          <Input
            type="number"
            label="Final Service Cost"
            value={actualCost}
            onChange={(e) => setActualCost(parseFloat(e?.target?.value))}
            description="Update if the final cost differs from the estimate"
            required
          />

          <Input
            type="text"
            label="Completion Notes"
            placeholder="Describe the work completed, any issues resolved, or recommendations"
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e?.target?.value)}
            description="These notes will be shared with the customer"
          />

          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Icon name="DollarSign" size={20} className="text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-primary mb-2">Payment Summary</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Estimated Cost:</span>
                    <span className="font-medium">${booking?.cost?.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Final Cost:</span>
                    <span className="font-semibold text-primary">${actualCost?.toFixed(2)}</span>
                  </div>
                  {actualCost !== booking?.cost && (
                    <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
                      <span className="text-muted-foreground">Difference:</span>
                      <span className={`font-semibold ${actualCost > booking?.cost ? 'text-error' : 'text-success'}`}>
                        {actualCost > booking?.cost ? '+' : '-'}${Math.abs(actualCost - booking?.cost)?.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Icon name="AlertCircle" size={20} className="text-warning flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-warning mb-1">Important</p>
                <p className="text-muted-foreground">
                  Once marked as complete, the customer will be charged the final amount and you'll receive payment within 2-3 business days.
                </p>
              </div>
            </div>
          </div>

          <Checkbox
            label="I confirm that the service has been completed satisfactorily"
            checked={confirmCompletion}
            onChange={(e) => setConfirmCompletion(e?.target?.checked)}
            required
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 p-4 md:p-6 border-t border-border sticky bottom-0 bg-card">
          <Button variant="outline" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="success"
            fullWidth
            loading={loading}
            onClick={handleConfirm}
            disabled={!confirmCompletion || !actualCost}
          >
            Mark as Complete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompleteServiceModal;