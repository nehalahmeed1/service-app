import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const MapView = ({ providers, onProviderSelect, onClose }) => {
  const centerLat = 37.7749;
  const centerLng = -122.4194;

  return (
    <div className="fixed inset-0 z-[150] bg-background">
      <div className="h-full flex flex-col">
        <div className="bg-card border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="Map" size={24} color="var(--color-primary)" />
            <div>
              <h2 className="text-lg font-semibold">Map View</h2>
              <p className="text-xs text-muted-foreground">{providers?.length} providers nearby</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={24} />
          </Button>
        </div>

        <div className="flex-1 relative">
          <iframe
            width="100%"
            height="100%"
            loading="lazy"
            title="Service Providers Map"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?q=${centerLat},${centerLng}&z=12&output=embed`}
            className="w-full h-full"
          />

          <div className="absolute bottom-4 left-4 right-4 max-w-md mx-auto">
            <div className="bg-card rounded-xl shadow-2xl border border-border p-4 space-y-3 max-h-64 overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Nearby Providers</span>
                <span className="text-xs text-muted-foreground">{providers?.length} found</span>
              </div>
              {providers?.slice(0, 5)?.map((provider) => (
                <button
                  key={provider?.id}
                  onClick={() => onProviderSelect(provider)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted smooth-transition text-left"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={provider?.image} 
                      alt={provider?.imageAlt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm line-clamp-1">{provider?.name}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Icon name="MapPin" size={12} />
                      <span>{provider?.distance} mi</span>
                      <Icon name="Star" size={12} fill="var(--color-warning)" color="var(--color-warning)" />
                      <span>{provider?.rating}</span>
                    </div>
                  </div>
                  <Icon name="ChevronRight" size={18} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;