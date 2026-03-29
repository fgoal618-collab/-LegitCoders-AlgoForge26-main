import { useEffect, useRef, useState } from 'react';
import { MapPin, X } from 'lucide-react';

interface PlacesAutocompleteProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (place: { name: string; lat: number; lng: number; address: string }) => void;
  icon?: React.ReactNode;
  iconColor?: string;
  className?: string;
}

export function PlacesAutocomplete({
  placeholder = 'Search a place...',
  value,
  onChange,
  onSelect,
  icon,
  iconColor = 'text-indigo-500',
  className = '',
}: PlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const initAutocomplete = async () => {
      try {
        await google.maps.importLibrary('places');

        if (!inputRef.current) return;

        const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: 'in' },
          fields: ['geometry', 'name', 'formatted_address'],
          types: ['establishment', 'geocode'],
        });

        // Bias results to Mumbai region
        const mumbaiCenter = new google.maps.LatLng(19.0760, 72.8777);
        const circle = new google.maps.Circle({ center: mumbaiCenter, radius: 50000 });
        autocomplete.setBounds(circle.getBounds()!);

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.geometry?.location) {
            onSelect({
              name: place.name || '',
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
              address: place.formatted_address || '',
            });
            onChange(place.name || place.formatted_address || '');
          }
        });

        autocompleteRef.current = autocomplete;
        setIsLoaded(true);
      } catch (err) {
        console.error('Places Autocomplete failed:', err);
        setError('Search unavailable');
      }
    };

    const waitForGoogle = () => {
      if (window.google?.maps) {
        initAutocomplete();
      } else {
        const check = setInterval(() => {
          if (window.google?.maps) {
            clearInterval(check);
            initAutocomplete();
          }
        }, 200);
        setTimeout(() => { clearInterval(check); setError('Maps not loaded'); }, 10000);
      }
    };

    waitForGoogle();

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

  const handleClear = () => {
    onChange('');
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-3 bg-gray-50/80 rounded-xl px-4 py-3.5 border border-gray-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:bg-white transition-all">
        {icon || <MapPin className={`w-5 h-5 ${iconColor} shrink-0`} />}
        <input
          ref={inputRef}
          type="text"
          placeholder={isLoaded ? placeholder : 'Loading...'}
          defaultValue={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400 text-sm font-medium"
          disabled={!!error}
        />
        {value && (
          <button onClick={handleClear} className="p-1 hover:bg-gray-200 rounded-full transition-colors shrink-0">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-1 px-1">{error}</p>
      )}
    </div>
  );
}
