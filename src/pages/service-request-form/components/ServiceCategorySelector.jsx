import React from 'react';
import Icon from '../../../components/AppIcon';

const ServiceCategorySelector = ({ selectedCategory, onCategorySelect, error }) => {
  const serviceCategories = [
    {
      id: 'electrical',
      name: 'Electrical',
      icon: 'Zap',
      description: 'Wiring, fixtures, repairs',
      color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
    },
    {
      id: 'plumbing',
      name: 'Plumbing',
      icon: 'Droplet',
      description: 'Pipes, drains, fixtures',
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
    },
    {
      id: 'construction',
      name: 'Construction',
      icon: 'HardHat',
      description: 'Building, renovation',
      color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
    },
    {
      id: 'hvac',
      name: 'HVAC',
      icon: 'Wind',
      description: 'Heating, cooling, ventilation',
      color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
    },
    {
      id: 'carpentry',
      name: 'Carpentry',
      icon: 'Hammer',
      description: 'Woodwork, furniture, cabinets',
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
    },
    {
      id: 'painting',
      name: 'Painting',
      icon: 'Paintbrush',
      description: 'Interior, exterior painting',
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
    },
    {
      id: 'roofing',
      name: 'Roofing',
      icon: 'Home',
      description: 'Roof repair, installation',
      color: 'bg-red-500/10 text-red-600 dark:text-red-400'
    },
    {
      id: 'landscaping',
      name: 'Landscaping',
      icon: 'Trees',
      description: 'Lawn care, garden design',
      color: 'bg-green-500/10 text-green-600 dark:text-green-400'
    },
    {
      id: 'cleaning',
      name: 'Cleaning',
      icon: 'Sparkles',
      description: 'Deep cleaning, maintenance',
      color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400'
    },
    {
      id: 'appliance',
      name: 'Appliance Repair',
      icon: 'Refrigerator',
      description: 'Fix appliances, maintenance',
      color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
    },
    {
      id: 'flooring',
      name: 'Flooring',
      icon: 'Square',
      description: 'Installation, repair',
      color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
    },
    {
      id: 'other',
      name: 'Other Services',
      icon: 'MoreHorizontal',
      description: 'Specify your needs',
      color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400'
    }
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          Service Category <span className="text-error">*</span>
        </label>
        {selectedCategory && (
          <button
            type="button"
            onClick={() => onCategorySelect('')}
            className="text-xs text-primary hover:text-primary/80 smooth-transition"
          >
            Clear selection
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {serviceCategories?.map((category) => (
          <button
            key={category?.id}
            type="button"
            onClick={() => onCategorySelect(category?.id)}
            className={`p-4 rounded-xl border-2 smooth-transition text-left ${
              selectedCategory === category?.id
                ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted'
            }`}
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${category?.color}`}>
              <Icon name={category?.icon} size={24} />
            </div>
            <div className="font-medium text-sm mb-1">{category?.name}</div>
            <div className="text-xs text-muted-foreground line-clamp-1">
              {category?.description}
            </div>
          </button>
        ))}
      </div>
      {error && (
        <div className="flex items-center gap-2 text-sm text-error mt-2">
          <Icon name="AlertCircle" size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default ServiceCategorySelector;