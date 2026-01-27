import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/navigation/Header';
import BottomNav from '../../components/navigation/BottomNav';
import QuickActionMenu from '../../components/navigation/QuickActionMenu';
import ReviewForm from './components/ReviewForm';
import ReviewCard from './components/ReviewCard';
import RatingBreakdown from './components/RatingBreakdown';
import FilterBar from './components/FilterBar';
import ReviewStats from './components/ReviewStats';

const ReviewsAndRatings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [filters, setFilters] = useState({
    rating: 'all',
    serviceType: 'all',
    sort: 'recent'
  });

  const pendingReviews = [
  {
    id: 'booking-001',
    serviceType: 'Electrical Repair',
    providerName: 'Michael Rodriguez',
    completionDate: '12/28/2025',
    amount: 150
  },
  {
    id: 'booking-002',
    serviceType: 'Plumbing Service',
    providerName: 'Sarah Johnson',
    completionDate: '12/25/2025',
    amount: 200
  }];


  const ratingStats = {
    average: 4.6,
    breakdown: [
    { stars: 5, count: 245 },
    { stars: 4, count: 89 },
    { stars: 3, count: 23 },
    { stars: 2, count: 8 },
    { stars: 1, count: 5 }],

    categories: [
    { name: 'Quality', rating: 4.7 },
    { name: 'Punctuality', rating: 4.5 },
    { name: 'Value', rating: 4.6 },
    { name: 'Communication', rating: 4.8 }]

  };

  const reviewsData = [
  {
    id: 'review-001',
    customerName: 'Jennifer Martinez',
    customerAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1388a1ec0-1763294397502.png",
    customerAvatarAlt: 'Professional headshot of Hispanic woman with long brown hair wearing blue blazer',
    date: '01/02/2026',
    serviceType: 'Electrical Installation',
    verified: true,
    ratings: {
      overall: 5,
      quality: 5,
      punctuality: 5,
      value: 5
    },
    comment: `Absolutely outstanding service! Michael arrived exactly on time and completed the electrical installation with exceptional professionalism. He took the time to explain everything he was doing and ensured all safety standards were met. The quality of work exceeded my expectations, and the pricing was very fair. I've already recommended him to three of my neighbors. Will definitely use his services again for any future electrical needs.`,
    photos: [
    {
      url: "https://img.rocket.new/generatedImages/rocket_gen_img_1e1a56357-1766961752370.png", alt: 'Modern electrical panel installation with organized circuit breakers and proper labeling in residential setting'
    },
    {
      url: "https://img.rocket.new/generatedImages/rocket_gen_img_108a3daf0-1766961754367.png", alt: 'Professional electrician installing wall outlet with proper tools and safety equipment visible'
    }],

    helpfulCount: 24,
    providerResponse: 'Thank you so much for the wonderful review, Jennifer! It was a pleasure working on your electrical installation. Customer satisfaction is my top priority, and I\'m thrilled you\'re happy with the results. Don\'t hesitate to reach out for any future electrical needs!'
  },
  {
    id: 'review-002',
    customerName: 'David Thompson',
    customerAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1c9453d7a-1763292392917.png",
    customerAvatarAlt: 'Professional headshot of Caucasian man with gray hair and beard wearing dark suit',
    date: '12/30/2025',
    serviceType: 'Plumbing Repair',
    verified: true,
    ratings: {
      overall: 4,
      quality: 5,
      punctuality: 3,
      value: 4
    },
    comment: `Sarah did an excellent job fixing our leaking pipes. The quality of work was top-notch and she was very knowledgeable. However, she arrived about 45 minutes later than scheduled, which was a bit inconvenient. Once she started working, everything went smoothly. The pricing was reasonable for the quality of service provided. Would hire again but hope for better punctuality next time.`,
    photos: [],
    helpfulCount: 12,
    providerResponse: null
  },
  {
    id: 'review-003',
    customerName: 'Emily Chen',
    customerAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_11e82195f-1763301916996.png",
    customerAvatarAlt: 'Professional headshot of Asian woman with short black hair wearing white blouse',
    date: '12/28/2025',
    serviceType: 'HVAC Maintenance',
    verified: true,
    ratings: {
      overall: 5,
      quality: 5,
      punctuality: 5,
      value: 5
    },
    comment: `Robert provided exceptional HVAC maintenance service. He was punctual, professional, and thorough in his inspection. He identified potential issues before they became problems and explained everything in terms I could understand. The service was completed efficiently and the pricing was transparent with no hidden fees. Highly recommend for any HVAC needs!`,
    photos: [
    {
      url: "https://img.rocket.new/generatedImages/rocket_gen_img_129a86e62-1765061357386.png",
      alt: 'HVAC technician performing maintenance on air conditioning unit with professional tools and equipment'
    }],

    helpfulCount: 18,
    providerResponse: 'Thank you for the kind words, Emily! Regular maintenance is key to keeping your HVAC system running efficiently. I\'m glad I could help identify those potential issues early. Looking forward to serving you again!'
  },
  {
    id: 'review-004',
    customerName: 'Marcus Williams',
    customerAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1faa738ad-1763294932464.png",
    customerAvatarAlt: 'Professional headshot of African American man with short hair wearing gray suit and tie',
    date: '12/26/2025',
    serviceType: 'Construction Work',
    verified: true,
    ratings: {
      overall: 5,
      quality: 5,
      punctuality: 5,
      value: 4
    },
    comment: `Outstanding construction work on our home renovation project. The team was professional, skilled, and maintained excellent communication throughout the entire process. They completed the work on schedule and the quality exceeded our expectations. The attention to detail was impressive. Slightly higher than other quotes we received, but absolutely worth it for the quality delivered.`,
    photos: [
    {
      url: "https://img.rocket.new/generatedImages/rocket_gen_img_181192b59-1766146080114.png",
      alt: 'Modern home renovation showing newly constructed room with professional finishing and quality materials'
    },
    {
      url: "https://img.rocket.new/generatedImages/rocket_gen_img_12d251156-1764696429700.png",
      alt: 'Construction workers installing drywall with professional tools in residential renovation project'
    },
    {
      url: "https://img.rocket.new/generatedImages/rocket_gen_img_175b107e4-1767705290709.png",
      alt: 'Completed home renovation showing high-quality craftsmanship with modern fixtures and finishes'
    }],

    helpfulCount: 31,
    providerResponse: null
  },
  {
    id: 'review-005',
    customerName: 'Lisa Anderson',
    customerAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_16e75c406-1763294340369.png",
    customerAvatarAlt: 'Professional headshot of Caucasian woman with blonde hair wearing professional attire',
    date: '12/24/2025',
    serviceType: 'General Maintenance',
    verified: true,
    ratings: {
      overall: 4,
      quality: 4,
      punctuality: 4,
      value: 5
    },
    comment: `Great value for money! The maintenance service covered multiple small repairs around the house efficiently. The technician was friendly and professional. Everything was fixed properly and the pricing was very reasonable. Would definitely use this service again for general home maintenance needs.`,
    photos: [],
    helpfulCount: 9,
    providerResponse: 'Thank you for choosing our service, Lisa! We\'re happy to help with all your home maintenance needs. Feel free to reach out anytime!'
  }];


  const stats = {
    totalReviews: 370,
    averageRating: 4.6,
    responseRate: 87,
    satisfactionRate: 94,
    reviewTrend: 12,
    responseTrend: 5,
    satisfactionTrend: 3
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      rating: 'all',
      serviceType: 'all',
      sort: 'recent'
    });
  };

  const handleSubmitReview = (reviewData) => {
    console.log('Review submitted:', reviewData);
    setShowReviewForm(false);
    alert('Thank you for your review! It has been submitted successfully.');
  };

  const handleReportReview = (reviewId) => {
    console.log('Report review:', reviewId);
    alert('Thank you for reporting. Our team will review this content.');
  };

  const handleMarkHelpful = (reviewId) => {
    console.log('Mark helpful:', reviewId);
  };

  const tabs = [
  { id: 'all', label: 'All Reviews', count: reviewsData?.length },
  { id: 'pending', label: 'Pending Reviews', count: pendingReviews?.length },
  { id: 'given', label: 'Reviews Given', count: 8 },
  { id: 'received', label: 'Reviews Received', count: 12 }];


  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 pb-24 md:pb-8">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
              Reviews & Ratings
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Manage your service reviews and build your reputation
            </p>
          </div>
          <Button
            variant="default"
            iconName="FileText"
            iconPosition="left"
            onClick={() => navigate('/booking-management')}
            className="hidden md:flex">

            View Bookings
          </Button>
        </div>

        <ReviewStats stats={stats} />

        <div className="mt-6 md:mt-8 space-y-6">
          {pendingReviews?.length > 0 &&
          <div className="bg-accent/10 rounded-xl p-4 md:p-6 border border-accent/20">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                  <Icon name="AlertCircle" size={24} color="#FFFFFF" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base md:text-lg font-semibold text-foreground mb-1">
                    {pendingReviews?.length} Service{pendingReviews?.length > 1 ? 's' : ''} Awaiting Review
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Share your experience to help other customers make informed decisions
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {pendingReviews?.map((booking) =>
              <div
                key={booking?.id}
                className="bg-card rounded-lg p-4 border border-border flex items-center justify-between gap-4">

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm md:text-base font-medium text-foreground mb-1">
                        {booking?.serviceType}
                      </h4>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Provider: {booking?.providerName} • Completed: {booking?.completionDate}
                      </p>
                    </div>
                    <Button
                  variant="default"
                  size="sm"
                  iconName="Star"
                  iconPosition="left"
                  onClick={() => {
                    setShowReviewForm(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}>

                      Write Review
                    </Button>
                  </div>
              )}
              </div>
            </div>
          }

          {showReviewForm &&
          <ReviewForm
            booking={pendingReviews?.[0]}
            onSubmit={handleSubmitReview}
            onCancel={() => setShowReviewForm(false)} />

          }

          <div className="flex flex-wrap gap-2 border-b border-border">
            {tabs?.map((tab) =>
            <button
              key={tab?.id}
              onClick={() => setActiveTab(tab?.id)}
              className={`px-4 md:px-6 py-3 text-sm md:text-base font-medium smooth-transition relative ${
              activeTab === tab?.id ?
              'text-primary' : 'text-muted-foreground hover:text-foreground'}`
              }>

                {tab?.label}
                {tab?.count > 0 &&
              <span className="ml-2 px-2 py-0.5 rounded-full bg-muted text-xs">
                    {tab?.count}
                  </span>
              }
                {activeTab === tab?.id &&
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              }
              </button>
            )}
          </div>

          {activeTab === 'all' &&
          <>
              <RatingBreakdown ratings={ratingStats} />
              <FilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters} />


              <div className="space-y-4">
                {reviewsData?.map((review) =>
              <ReviewCard
                key={review?.id}
                review={review}
                onReport={handleReportReview}
                onHelpful={handleMarkHelpful}
                userRole="provider" />

              )}
              </div>

              <div className="flex justify-center pt-6">
                <Button variant="outline" iconName="ChevronDown" iconPosition="right">
                  Load More Reviews
                </Button>
              </div>
            </>
          }

          {activeTab === 'pending' &&
          <div className="text-center py-12">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <Icon name="Clock" size={32} color="var(--color-muted-foreground)" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">
                No Pending Reviews
              </h3>
              <p className="text-sm md:text-base text-muted-foreground mb-6">
                Complete a service to leave a review
              </p>
              <Button
              variant="default"
              iconName="Search"
              iconPosition="left"
              onClick={() => navigate('/service-provider-search')}>

                Find Services
              </Button>
            </div>
          }
        </div>
      </main>
      <BottomNav />
      <QuickActionMenu />
    </div>);

};

export default ReviewsAndRatings;