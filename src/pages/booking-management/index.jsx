import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/navigation/Header';
import BottomNav from '../../components/navigation/BottomNav';
import QuickActionMenu from '../../components/navigation/QuickActionMenu';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import BookingCalendar from './components/BookingCalendar';
import BookingCard from './components/BookingCard';
import FilterBar from './components/FilterBar';
import RescheduleModal from './components/RescheduleModal';
import CancelModal from './components/CancelModal';
import BookingDetailsModal from './components/BookingDetailsModal';
import CompleteServiceModal from './components/CompleteServiceModal';

const BookingManagement = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('customer');
  const [selectedDate, setSelectedDate] = useState('2026-01-15');
  const [viewMode, setViewMode] = useState('calendar');
  const [filters, setFilters] = useState({
    status: 'all',
    sortBy: 'date_asc',
    searchQuery: ''
  });

  const [modals, setModals] = useState({
    reschedule: { isOpen: false, booking: null },
    cancel: { isOpen: false, booking: null },
    details: { isOpen: false, booking: null },
    complete: { isOpen: false, booking: null }
  });

  const [bookings, setBookings] = useState([
  {
    id: 'BK001',
    serviceType: 'Electrical Repair',
    providerName: 'Michael Rodriguez',
    providerImage: "https://img.rocket.new/generatedImages/rocket_gen_img_18a016e9d-1763299228900.png",
    providerImageAlt: 'Professional headshot of Hispanic male electrician with short black hair wearing blue work uniform and safety glasses',
    providerPhone: '(555) 123-4567',
    providerEmail: 'michael.rodriguez@example.com',
    providerRating: 4.8,
    customerName: 'Sarah Johnson',
    customerImage: "https://img.rocket.new/generatedImages/rocket_gen_img_1f2e0f9a8-1763300113479.png",
    customerImageAlt: 'Professional headshot of Caucasian woman with blonde hair in casual blue shirt smiling warmly',
    customerPhone: '(555) 987-6543',
    customerEmail: 'sarah.johnson@example.com',
    date: '2026-01-15',
    time: '14:00',
    duration: '2 hours',
    location: '123 Main Street, San Francisco, CA 94102',
    latitude: 37.7749,
    longitude: -122.4194,
    status: 'confirmed',
    notes: 'Need to fix kitchen outlet and install new light fixture in living room. Please bring ladder.'
  },
  {
    id: 'BK002',
    serviceType: 'Plumbing Service',
    providerName: 'David Chen',
    providerImage: "https://img.rocket.new/generatedImages/rocket_gen_img_13d754aa4-1763296558802.png",
    providerImageAlt: 'Professional headshot of Asian male plumber with short black hair wearing red work shirt and tool belt',
    providerPhone: '(555) 234-5678',
    providerEmail: 'david.chen@example.com',
    providerRating: 4.9,
    customerName: 'Emily Martinez',
    customerImage: "https://img.rocket.new/generatedImages/rocket_gen_img_119848aeb-1763295351165.png",
    customerImageAlt: 'Professional headshot of Hispanic woman with long brown hair in white blouse with friendly expression',
    customerPhone: '(555) 876-5432',
    customerEmail: 'emily.martinez@example.com',
    date: '2026-01-16',
    time: '09:00',
    duration: '3 hours',
    location: '456 Oak Avenue, San Francisco, CA 94103',
    latitude: 37.7699,
    longitude: -122.4194,
    cost: 225.00,
    status: 'pending',
    notes: 'Leaking bathroom faucet and clogged kitchen sink. Emergency repair needed.'
  },
  {
    id: 'BK003',
    serviceType: 'HVAC Maintenance',
    providerName: 'James Wilson',
    providerImage: "https://img.rocket.new/generatedImages/rocket_gen_img_131a54605-1763300572298.png",
    providerImageAlt: 'Professional headshot of African American male HVAC technician with short hair wearing gray work uniform',
    providerPhone: '(555) 345-6789',
    providerEmail: 'james.wilson@example.com',
    providerRating: 4.7,
    customerName: 'Robert Thompson',
    customerImage: "https://img.rocket.new/generatedImages/rocket_gen_img_14deaa9ba-1763296757159.png",
    customerImageAlt: 'Professional headshot of Caucasian man with gray hair in navy blue suit with confident smile',
    customerPhone: '(555) 765-4321',
    customerEmail: 'robert.thompson@example.com',
    date: '2026-01-12',
    time: '10:30',
    duration: '4 hours',
    location: '789 Pine Street, San Francisco, CA 94104',
    latitude: 37.7899,
    longitude: -122.4094,
    cost: 300.00,
    status: 'completed',
    completedDate: '2026-01-12',
    notes: 'Annual HVAC system inspection and filter replacement completed successfully.'
  },
  {
    id: 'BK004',
    serviceType: 'Carpentry Work',
    providerName: 'Carlos Ramirez',
    providerImage: "https://img.rocket.new/generatedImages/rocket_gen_img_13d754aa4-1763296558802.png",
    providerImageAlt: 'Professional headshot of Hispanic male carpenter with mustache wearing brown work shirt and tool belt',
    providerPhone: '(555) 456-7890',
    providerEmail: 'carlos.ramirez@example.com',
    providerRating: 4.6,
    customerName: 'Lisa Anderson',
    customerImage: "https://img.rocket.new/generatedImages/rocket_gen_img_10fffe6c8-1763300890025.png",
    customerImageAlt: 'Professional headshot of Caucasian woman with red hair in green sweater with warm smile',
    customerPhone: '(555) 654-3210',
    customerEmail: 'lisa.anderson@example.com',
    date: '2026-01-18',
    time: '08:00',
    duration: '6 hours',
    location: '321 Elm Drive, San Francisco, CA 94105',
    latitude: 37.7649,
    longitude: -122.4294,
    cost: 400.00,
    status: 'confirmed',
    notes: 'Custom bookshelf installation in home office. Materials will be provided by customer.'
  },
  {
    id: 'BK005',
    serviceType: 'Painting Service',
    providerName: 'Thomas Lee',
    providerImage: "https://img.rocket.new/generatedImages/rocket_gen_img_1ffeb43ad-1763298672388.png",
    providerImageAlt: 'Professional headshot of Asian male painter with short black hair wearing white work shirt with paint stains',
    providerPhone: '(555) 567-8901',
    providerEmail: 'thomas.lee@example.com',
    providerRating: 4.5,
    customerName: 'Jennifer White',
    customerImage: "https://img.rocket.new/generatedImages/rocket_gen_img_1b5600450-1763294005133.png",
    customerImageAlt: 'Professional headshot of Caucasian woman with blonde hair in pink blouse with cheerful expression',
    customerPhone: '(555) 543-2109',
    customerEmail: 'jennifer.white@example.com',
    date: '2026-01-14',
    time: '13:00',
    duration: '3 hours',
    location: '654 Maple Court, San Francisco, CA 94106',
    latitude: 37.7549,
    longitude: -122.4394,
    cost: 175.00,
    status: 'cancelled',
    notes: 'Customer cancelled due to schedule conflict. Rescheduling for next month.'
  },
  {
    id: 'BK006',
    serviceType: 'Appliance Repair',
    providerName: 'Daniel Brown',
    providerImage: "https://img.rocket.new/generatedImages/rocket_gen_img_1645ea6d2-1763294668991.png",
    providerImageAlt: 'Professional headshot of African American male appliance technician with short hair wearing blue work uniform',
    providerPhone: '(555) 678-9012',
    providerEmail: 'daniel.brown@example.com',
    providerRating: 4.9,
    customerName: 'Michelle Davis',
    customerImage: "https://img.rocket.new/generatedImages/rocket_gen_img_149978121-1763293908052.png",
    customerImageAlt: 'Professional headshot of African American woman with curly hair in yellow blouse with bright smile',
    customerPhone: '(555) 432-1098',
    customerEmail: 'michelle.davis@example.com',
    date: '2026-01-17',
    time: '11:00',
    duration: '2 hours',
    location: '987 Cedar Lane, San Francisco, CA 94107',
    latitude: 37.7449,
    longitude: -122.4494,
    cost: 125.00,
    status: 'pending',
    notes: 'Refrigerator not cooling properly. Possible compressor issue.'
  },
  {
    id: 'BK007',
    serviceType: 'Landscaping',
    providerName: 'Antonio Garcia',
    providerImage: "https://img.rocket.new/generatedImages/rocket_gen_img_18b4141a4-1763296078437.png",
    providerImageAlt: 'Professional headshot of Hispanic male landscaper with short black hair wearing green work shirt and cap',
    providerPhone: '(555) 789-0123',
    providerEmail: 'antonio.garcia@example.com',
    providerRating: 4.7,
    customerName: 'Patricia Wilson',
    customerImage: "https://img.rocket.new/generatedImages/rocket_gen_img_1135cd9d1-1763298257986.png",
    customerImageAlt: 'Professional headshot of Caucasian woman with gray hair in purple sweater with kind expression',
    customerPhone: '(555) 321-0987',
    customerEmail: 'patricia.wilson@example.com',
    date: '2026-01-19',
    time: '07:00',
    duration: '5 hours',
    location: '147 Birch Road, San Francisco, CA 94108',
    latitude: 37.7349,
    longitude: -122.4594,
    cost: 450.00,
    status: 'confirmed',
    notes: 'Full yard maintenance including lawn mowing, hedge trimming, and garden cleanup.'
  },
  {
    id: 'BK008',
    serviceType: 'Locksmith Service',
    providerName: 'Kevin Murphy',
    providerImage: "https://img.rocket.new/generatedImages/rocket_gen_img_12b07153c-1763292694836.png",
    providerImageAlt: 'Professional headshot of Caucasian male locksmith with brown hair wearing black work shirt with company logo',
    providerPhone: '(555) 890-1234',
    providerEmail: 'kevin.murphy@example.com',
    providerRating: 4.8,
    customerName: 'Amanda Taylor',
    customerImage: "https://img.rocket.new/generatedImages/rocket_gen_img_1270bd8b2-1763298312472.png",
    customerImageAlt: 'Professional headshot of Caucasian woman with brown hair in red blouse with professional demeanor',
    customerPhone: '(555) 210-9876',
    customerEmail: 'amanda.taylor@example.com',
    date: '2026-01-20',
    time: '15:30',
    duration: '1 hour',
    location: '258 Willow Way, San Francisco, CA 94109',
    latitude: 37.7949,
    longitude: -122.4094,
    cost: 85.00,
    status: 'confirmed',
    notes: 'Need to rekey front door lock and install deadbolt on back door.'
  }]
  );

  const bookingCounts = useMemo(() => {
    return {
      all: bookings?.length,
      pending: bookings?.filter((b) => b?.status === 'pending')?.length,
      confirmed: bookings?.filter((b) => b?.status === 'confirmed')?.length,
      completed: bookings?.filter((b) => b?.status === 'completed')?.length,
      cancelled: bookings?.filter((b) => b?.status === 'cancelled')?.length
    };
  }, [bookings]);

  const filteredAndSortedBookings = useMemo(() => {
    let filtered = [...bookings];

    if (filters?.status !== 'all') {
      filtered = filtered?.filter((b) => b?.status === filters?.status);
    }

    if (filters?.searchQuery) {
      const query = filters?.searchQuery?.toLowerCase();
      filtered = filtered?.filter((b) =>
      b?.serviceType?.toLowerCase()?.includes(query) ||
      (userRole === 'customer' ? b?.providerName : b?.customerName)?.toLowerCase()?.includes(query)
      );
    }

    if (selectedDate && viewMode === 'calendar') {
      filtered = filtered?.filter((b) => b?.date === selectedDate);
    }

    filtered?.sort((a, b) => {
      switch (filters?.sortBy) {
        case 'date_asc':
          return new Date(a.date) - new Date(b.date);
        case 'date_desc':
          return new Date(b.date) - new Date(a.date);
        default:
          return 0;
      }
    });

    return filtered;
  }, [bookings, filters, selectedDate, viewMode, userRole]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const openModal = (modalName, booking = null) => {
    setModals((prev) => ({
      ...prev,
      [modalName]: { isOpen: true, booking }
    }));
  };

  const closeModal = (modalName) => {
    setModals((prev) => ({
      ...prev,
      [modalName]: { isOpen: false, booking: null }
    }));
  };

  const handleReschedule = (updatedBooking) => {
    setBookings((prev) =>
    prev?.map((b) => b?.id === updatedBooking?.id ? updatedBooking : b)
    );
  };

  const handleCancel = (updatedBooking) => {
    setBookings((prev) =>
    prev?.map((b) => b?.id === updatedBooking?.id ? { ...updatedBooking, status: 'cancelled' } : b)
    );
  };

  const handleComplete = (updatedBooking) => {
    setBookings((prev) =>
    prev?.map((b) => b?.id === updatedBooking?.id ? updatedBooking : b)
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 mb-20 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">Booking Management</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Manage your service appointments and schedule
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              size="sm"
              iconName="Calendar"
              onClick={() => setViewMode('calendar')}>

              <span className="hidden sm:inline">Calendar</span>
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              iconName="List"
              onClick={() => setViewMode('list')}>

              <span className="hidden sm:inline">List</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              iconName="Plus"
              iconPosition="left"
              onClick={() => navigate('/service-request-form')}>

              <span className="hidden sm:inline">New Booking</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          {viewMode === 'calendar' &&
          <div className="lg:col-span-7">
              <BookingCalendar
              bookings={bookings}
              onDateSelect={setSelectedDate}
              selectedDate={selectedDate}
              userRole={userRole} />

            </div>
          }

          <div className={viewMode === 'calendar' ? 'lg:col-span-5' : 'lg:col-span-12'}>
            <div className="space-y-6">
              <FilterBar
                filters={filters}
                onFilterChange={handleFilterChange}
                bookingCounts={bookingCounts} />


              <div className="bg-card rounded-xl shadow-md border border-border p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    {viewMode === 'calendar' && selectedDate ?
                    `Bookings for ${new Date(selectedDate)?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` :
                    'All Bookings'}
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    {filteredAndSortedBookings?.length} {filteredAndSortedBookings?.length === 1 ? 'booking' : 'bookings'}
                  </span>
                </div>

                {filteredAndSortedBookings?.length === 0 ?
                <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                      <Icon name="Calendar" size={32} className="text-muted-foreground" />
                    </div>
                    <h4 className="text-lg font-semibold mb-2">No bookings found</h4>
                    <p className="text-sm text-muted-foreground mb-6">
                      {viewMode === 'calendar' ? 'No bookings scheduled for this date' : 'Try adjusting your filters or create a new booking'}
                    </p>
                    <Button
                    variant="default"
                    iconName="Plus"
                    iconPosition="left"
                    onClick={() => navigate('/service-request-form')}>

                      Create New Booking
                    </Button>
                  </div> :

                <div className="space-y-4">
                    {filteredAndSortedBookings?.map((booking) =>
                  <BookingCard
                    key={booking?.id}
                    booking={booking}
                    userRole={userRole}
                    onReschedule={(b) => openModal('reschedule', b)}
                    onCancel={(b) => openModal('cancel', b)}
                    onComplete={(b) => openModal('complete', b)}
                    onViewDetails={(b) => openModal('details', b)} />

                  )}
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </main>
      <RescheduleModal
        isOpen={modals?.reschedule?.isOpen}
        onClose={() => closeModal('reschedule')}
        booking={modals?.reschedule?.booking}
        onConfirm={handleReschedule} />

      <CancelModal
        isOpen={modals?.cancel?.isOpen}
        onClose={() => closeModal('cancel')}
        booking={modals?.cancel?.booking}
        onConfirm={handleCancel} />

      <BookingDetailsModal
        isOpen={modals?.details?.isOpen}
        onClose={() => closeModal('details')}
        booking={modals?.details?.booking}
        userRole={userRole} />

      <CompleteServiceModal
        isOpen={modals?.complete?.isOpen}
        onClose={() => closeModal('complete')}
        booking={modals?.complete?.booking}
        onConfirm={handleComplete} />

    
    </div>);

};

export default BookingManagement;