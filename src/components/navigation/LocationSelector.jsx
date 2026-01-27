import React, { useState } from 'react';
import Icon from '../AppIcon';
import Button from '../ui/Button';
import Input from '../ui/Input';

const LocationSelector = ({ isOpen, onClose, currentLocation, onLocationChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(currentLocation);

  const popularLocations = [
    { city: 'San Francisco', state: 'CA', zip: '94102' },
    { city: 'Los Angeles', state: 'CA', zip: '90001' },
    { city: 'San Diego', state: 'CA', zip: '92101' },
    { city: 'San Jose', state: 'CA', zip: '95110' },
    { city: 'Oakland', state: 'CA', zip: '94601' },
  ];

  const filteredLocations = popularLocations?.filter(loc =>
    `${loc?.city}, ${loc?.state}`?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    loc?.zip?.includes(searchQuery)
  );

  const handleLocationSelect = (location) => {
    const locationString = `${location?.city}, ${location?.state}`;
    setSelectedLocation(locationString);
  };

  const handleConfirm = () => {
    onLocationChange(selectedLocation);
    onClose();
  };

  const handleUseCurrentLocation = () => {
    console.log('Using current location');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-background/95 animate-fade-in">
      <div className="w-full max-w-md mx-4 bg-card rounded-xl shadow-2xl overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-xl font-semibold">Select Service Area</h3>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg smooth-transition">
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <Input
            type="search"
            placeholder="Search city or ZIP code"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e?.target?.value)}
            className="mb-4"
          />

          <Button
            variant="outline"
            fullWidth
            iconName="MapPin"
            iconPosition="left"
            onClick={handleUseCurrentLocation}
          >
            Use Current Location
          </Button>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Popular Locations
            </div>
            {filteredLocations?.map((location, index) => (
              <button
                key={index}
                onClick={() => handleLocationSelect(location)}
                className={`w-full flex items-center justify-between p-3 rounded-lg border smooth-transition ${
                  selectedLocation === `${location?.city}, ${location?.state}`
                    ? 'border-primary bg-primary/10' :'border-border hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon name="MapPin" size={18} />
                  <div className="text-left">
                    <div className="font-medium">{location?.city}, {location?.state}</div>
                    <div className="text-xs text-muted-foreground">{location?.zip}</div>
                  </div>
                </div>
                {selectedLocation === `${location?.city}, ${location?.state}` && (
                  <Icon name="Check" size={18} color="var(--color-primary)" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-border">
          <Button variant="outline" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button variant="default" fullWidth onClick={handleConfirm}>
            Confirm Location
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LocationSelector;