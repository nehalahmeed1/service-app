import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/navigation/Header';
import BottomNav from '../../components/navigation/BottomNav';
import QuickActionMenu from '../../components/navigation/QuickActionMenu';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ServiceCategorySelector from './components/ServiceCategorySelector';
import PhotoUploadSection from './components/PhotoUploadSection';
import SchedulingSection from './components/SchedulingSection';
import BudgetRangeSlider from './components/BudgetRangeSlider';
import UrgencySelector from './components/UrgencySelector';
import SpecialRequirementsSection from './components/SpecialRequirementsSection';
import ContactPreferences from './components/ContactPreferences';
import RequestSummaryPanel from './components/RequestSummaryPanel';

const ServiceRequestForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [estimatedMatches] = useState(12);

  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    location: '',
    preferredDate: '',
    preferredTime: '',
    isFlexible: false,
    urgency: 'medium',
    requirements: [],
    accessInstructions: '',
    contactPreferences: ['phone', 'app'],
    photos: []
  });

  const [errors, setErrors] = useState({});
  const [autoSaveStatus, setAutoSaveStatus] = useState('');

  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (formData?.category || formData?.description) {
        handleAutoSave();
      }
    }, 3000);

    return () => clearTimeout(autoSaveTimer);
  }, [formData]);

  const handleAutoSave = () => {
    setAutoSaveStatus('Saving...');
    setTimeout(() => {
      setAutoSaveStatus('Draft saved');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    }, 500);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.category) {
      newErrors.category = 'Please select a service category';
    }

    if (!formData?.title || formData?.title?.trim()?.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!formData?.description || formData?.description?.trim()?.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (!formData?.location || formData?.location?.trim()?.length < 5) {
      newErrors.location = 'Please provide a valid location';
    }

    if (!formData?.preferredDate) {
      newErrors.date = 'Please select a preferred date';
    }

    if (!formData?.preferredTime) {
      newErrors.time = 'Please select a time preference';
    }

    if (!formData?.urgency) {
      newErrors.urgency = 'Please select urgency level';
    }

    if (formData?.contactPreferences?.length === 0) {
      newErrors.contactPreferences = 'Please select at least one contact method';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessModal(true);
    }, 2000);
  };

  const handleSaveDraft = () => {
    setIsSavingDraft(true);
    setTimeout(() => {
      setIsSavingDraft(false);
      alert('Draft saved successfully! You can continue editing later.');
    }, 1000);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigate('/booking-management');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-12 mb-20 md:mb-0">
        <div className="mb-6 md:mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground smooth-transition mb-4"
          >
            <Icon name="ArrowLeft" size={16} />
            <span>Back</span>
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
                Request a Service
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Tell us what you need and we'll connect you with qualified providers
              </p>
            </div>
            {autoSaveStatus && (
              <div className="hidden md:flex items-center gap-2 text-sm text-success">
                <Icon name="Check" size={16} />
                <span>{autoSaveStatus}</span>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card rounded-xl border border-border p-4 md:p-6 shadow-sm">
                <ServiceCategorySelector
                  selectedCategory={formData?.category}
                  onCategorySelect={(category) => setFormData({ ...formData, category })}
                  error={errors?.category}
                />
              </div>

              <div className="bg-card rounded-xl border border-border p-4 md:p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Icon name="FileText" size={20} />
                    Service Details
                  </h3>
                </div>

                <Input
                  type="text"
                  label="Service Title"
                  placeholder="e.g., Fix leaking kitchen faucet"
                  value={formData?.title}
                  onChange={(e) => setFormData({ ...formData, title: e?.target?.value })}
                  error={errors?.title}
                  required
                  description="Brief description of what you need"
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Detailed Description <span className="text-error">*</span>
                  </label>
                  <textarea
                    value={formData?.description}
                    onChange={(e) => setFormData({ ...formData, description: e?.target?.value })}
                    placeholder="Describe the service you need in detail. Include any specific requirements, current issues, or preferences..."
                    rows={6}
                    className={`w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 outline-none smooth-transition resize-none text-sm ${
                      errors?.description ? 'border-error' : 'border-border focus:border-primary'
                    }`}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Minimum 20 characters
                    </p>
                    <span className={`text-xs ${
                      formData?.description?.length < 20 ? 'text-muted-foreground' : 'text-success'
                    }`}>
                      {formData?.description?.length} characters
                    </span>
                  </div>
                  {errors?.description && (
                    <div className="flex items-center gap-2 text-sm text-error">
                      <Icon name="AlertCircle" size={16} />
                      <span>{errors?.description}</span>
                    </div>
                  )}
                </div>

                <Input
                  type="text"
                  label="Service Location"
                  placeholder="Enter your address or ZIP code"
                  value={formData?.location}
                  onChange={(e) => setFormData({ ...formData, location: e?.target?.value })}
                  error={errors?.location}
                  required
                  description="Where should the service be performed?"
                />
              </div>

              <div className="bg-card rounded-xl border border-border p-4 md:p-6 shadow-sm">
                <PhotoUploadSection
                  photos={formData?.photos}
                  onPhotosChange={(photos) => setFormData({ ...formData, photos })}
                />
              </div>

              <div className="bg-card rounded-xl border border-border p-4 md:p-6 shadow-sm">
                <SchedulingSection
                  preferredDate={formData?.preferredDate}
                  preferredTime={formData?.preferredTime}
                  isFlexible={formData?.isFlexible}
                  onDateChange={(date) => setFormData({ ...formData, preferredDate: date })}
                  onTimeChange={(time) => setFormData({ ...formData, preferredTime: time })}
                  onFlexibleChange={(flexible) => setFormData({ ...formData, isFlexible: flexible })}
                  errors={errors}
                />
              </div>

              <div className="bg-card rounded-xl border border-border p-4 md:p-6 shadow-sm">
                <BudgetRangeSlider
                  minBudget={formData?.minBudget}
                  maxBudget={formData?.maxBudget}
                  onBudgetChange={(min, max) => setFormData({ ...formData, minBudget: min, maxBudget: max })}
                />
              </div>

              <div className="bg-card rounded-xl border border-border p-4 md:p-6 shadow-sm">
                <UrgencySelector
                  urgency={formData?.urgency}
                  onUrgencyChange={(urgency) => setFormData({ ...formData, urgency })}
                />
              </div>

              <div className="bg-card rounded-xl border border-border p-4 md:p-6 shadow-sm">
                <SpecialRequirementsSection
                  requirements={formData?.requirements}
                  onRequirementsChange={(requirements) => setFormData({ ...formData, requirements })}
                  accessInstructions={formData?.accessInstructions}
                  onAccessInstructionsChange={(instructions) => setFormData({ ...formData, accessInstructions: instructions })}
                />
              </div>

              <div className="bg-card rounded-xl border border-border p-4 md:p-6 shadow-sm">
                <ContactPreferences
                  preferences={formData?.contactPreferences}
                  onPreferencesChange={(preferences) => setFormData({ ...formData, contactPreferences: preferences })}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveDraft}
                  loading={isSavingDraft}
                  iconName="Save"
                  iconPosition="left"
                  className="flex-1"
                >
                  Save Draft
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  loading={isSubmitting}
                  iconName="Send"
                  iconPosition="right"
                  className="flex-1 sm:flex-[2]"
                >
                  Submit Request
                </Button>
              </div>
            </div>

            <div className="hidden lg:block">
              <RequestSummaryPanel
                formData={formData}
                estimatedMatches={estimatedMatches}
              />
            </div>
          </div>
        </form>
      </main>
      {showSuccessModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-background/95 animate-fade-in p-4">
          <div className="w-full max-w-md bg-card rounded-xl shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-6 md:p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <Icon name="CheckCircle2" size={32} color="var(--color-success)" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-2">Request Submitted!</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Your service request has been successfully submitted. Providers will start reviewing it shortly.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Icon name="Clock" size={20} className="text-primary" />
                  <div className="text-left flex-1">
                    <div className="text-sm font-medium">Expected Response</div>
                    <div className="text-xs text-muted-foreground">Within 2-4 hours</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Icon name="Users" size={20} className="text-primary" />
                  <div className="text-left flex-1">
                    <div className="text-sm font-medium">Matching Providers</div>
                    <div className="text-xs text-muted-foreground">{estimatedMatches} available</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate('/service-provider-search')}
                  fullWidth
                >
                  Browse Providers
                </Button>
                <Button
                  variant="default"
                  onClick={handleSuccessModalClose}
                  fullWidth
                >
                  View My Requests
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      <BottomNav />
      <QuickActionMenu />
    </div>
  );
};

export default ServiceRequestForm;