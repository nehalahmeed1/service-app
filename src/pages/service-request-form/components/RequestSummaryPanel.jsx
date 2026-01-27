import React from 'react';
import Icon from '../../../components/AppIcon';

const RequestSummaryPanel = ({ formData, estimatedMatches }) => {
  const getCategoryName = (categoryId) => {
    const categories = {
      electrical: 'Electrical',
      plumbing: 'Plumbing',
      construction: 'Construction',
      hvac: 'HVAC',
      carpentry: 'Carpentry',
      painting: 'Painting',
      roofing: 'Roofing',
      landscaping: 'Landscaping',
      cleaning: 'Cleaning',
      appliance: 'Appliance Repair',
      flooring: 'Flooring',
      other: 'Other Services'
    };
    return categories?.[categoryId] || categoryId;
  };

  const getUrgencyLabel = (urgency) => {
    const labels = {
      low: 'Standard',
      medium: 'Priority',
      high: 'Urgent',
      emergency: 'Emergency'
    };
    return labels?.[urgency] || urgency;
  };

  const getTimeSlotLabel = (slot) => {
    const slots = {
      morning: 'Morning (8AM - 12PM)',
      afternoon: 'Afternoon (12PM - 5PM)',
      evening: 'Evening (5PM - 8PM)'
    };
    return slots?.[slot] || slot;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const summaryItems = [
    {
      icon: 'Wrench',
      label: 'Service Category',
      value: formData?.category ? getCategoryName(formData?.category) : 'Not selected',
      show: true
    },
    {
      icon: 'MapPin',
      label: 'Location',
      value: formData?.location || 'Not specified',
      show: formData?.location
    },
    {
      icon: 'Calendar',
      label: 'Preferred Date',
      value: formatDate(formData?.preferredDate),
      show: formData?.preferredDate
    },
    {
      icon: 'Clock',
      label: 'Time Preference',
      value: formData?.preferredTime ? getTimeSlotLabel(formData?.preferredTime) : 'Not specified',
      show: formData?.preferredTime
    },
    {
      icon: 'DollarSign',
      label: 'Budget Range',
      value: `${formatCurrency(formData?.minBudget)} - ${formatCurrency(formData?.maxBudget)}`,
      show: true
    },
    {
      icon: 'Zap',
      label: 'Urgency',
      value: formData?.urgency ? getUrgencyLabel(formData?.urgency) : 'Not specified',
      show: formData?.urgency
    }
  ];

  return (
    <div className="lg:sticky lg:top-20 space-y-4">
      <div className="bg-card rounded-xl border border-border p-6 shadow-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon name="FileText" size={24} color="var(--color-primary)" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Request Summary</h3>
            <p className="text-xs text-muted-foreground">Review your service details</p>
          </div>
        </div>

        <div className="space-y-4">
          {summaryItems?.filter(item => item?.show)?.map((item, index) => (
            <div key={index} className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
              <Icon name={item?.icon} size={18} className="text-muted-foreground mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground mb-1">{item?.label}</div>
                <div className="text-sm font-medium truncate">{item?.value}</div>
              </div>
            </div>
          ))}
        </div>

        {formData?.photos && formData?.photos?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="Image" size={18} className="text-muted-foreground" />
                <span className="text-sm font-medium">Photos Attached</span>
              </div>
              <span className="text-xs text-muted-foreground">{formData?.photos?.length}</span>
            </div>
          </div>
        )}

        {formData?.requirements && formData?.requirements?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="CheckSquare" size={18} className="text-muted-foreground" />
              <span className="text-sm font-medium">Special Requirements</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {formData?.requirements?.length} requirement(s) selected
            </div>
          </div>
        )}
      </div>
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Icon name="Users" size={20} color="var(--color-primary)" />
          </div>
          <div>
            <div className="font-semibold text-primary">
              {estimatedMatches} Providers
            </div>
            <div className="text-xs text-muted-foreground">
              Available in your area
            </div>
          </div>
        </div>

        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Icon name="Clock" size={14} />
            <span>Average response time: 2-4 hours</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="Star" size={14} />
            <span>All providers are verified & rated</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="Shield" size={14} />
            <span>100% satisfaction guarantee</span>
          </div>
        </div>
      </div>
      <div className="bg-muted rounded-lg p-4">
        <div className="flex gap-3">
          <Icon name="Info" size={18} className="text-muted-foreground flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-sm mb-1">What happens next?</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Providers will review your request</li>
              <li>• You'll receive quotes within 24 hours</li>
              <li>• Compare and choose your provider</li>
              <li>• Schedule and complete the service</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestSummaryPanel;