import React from 'react';
import Icon from '../../../components/AppIcon';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const FilterBar = ({ filters, onFilterChange, bookingCounts }) => {
  const statusOptions = [
    { value: 'all', label: `All (${bookingCounts?.all})` },
    { value: 'pending', label: `Pending (${bookingCounts?.pending})` },
    { value: 'confirmed', label: `Confirmed (${bookingCounts?.confirmed})` },
    { value: 'completed', label: `Completed (${bookingCounts?.completed})` },
    { value: 'cancelled', label: `Cancelled (${bookingCounts?.cancelled})` }
  ];

  const sortOptions = [
    { value: 'date_asc', label: 'Date (Earliest First)' },
    { value: 'date_desc', label: 'Date (Latest First)' },
    { value: 'cost_asc', label: 'Cost (Low to High)' },
    { value: 'cost_desc', label: 'Cost (High to Low)' }
  ];

  return (
    <div className="bg-card rounded-xl shadow-md border border-border p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="Filter" size={20} className="text-primary" />
        <h3 className="text-lg font-semibold">Filter &amp; Sort</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label="Status"
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => onFilterChange('status', value)}
        />

        <Select
          label="Sort By"
          options={sortOptions}
          value={filters?.sortBy}
          onChange={(value) => onFilterChange('sortBy', value)}
        />

        <Input
          type="search"
          label="Search"
          placeholder="Search by service or name"
          value={filters?.searchQuery}
          onChange={(e) => onFilterChange('searchQuery', e?.target?.value)}
        />
      </div>
    </div>
  );
};

export default FilterBar;