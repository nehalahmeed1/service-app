import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const BudgetRangeSlider = ({ minBudget, maxBudget, onBudgetChange }) => {
  const [localMin, setLocalMin] = useState(minBudget);
  const [localMax, setLocalMax] = useState(maxBudget);

  const budgetRanges = [
    { min: 0, max: 100, label: 'Under $100' },
    { min: 100, max: 300, label: '$100 - $300' },
    { min: 300, max: 500, label: '$300 - $500' },
    { min: 500, max: 1000, label: '$500 - $1,000' },
    { min: 1000, max: 5000, label: '$1,000 - $5,000' },
    { min: 5000, max: 999999, label: 'Over $5,000' }
  ];

  const handleRangeSelect = (range) => {
    setLocalMin(range?.min);
    setLocalMax(range?.max);
    onBudgetChange(range?.min, range?.max);
  };

  const handleMinChange = (e) => {
    const value = parseInt(e?.target?.value) || 0;
    setLocalMin(value);
    if (value <= localMax) {
      onBudgetChange(value, localMax);
    }
  };

  const handleMaxChange = (e) => {
    const value = parseInt(e?.target?.value) || 0;
    setLocalMax(value);
    if (value >= localMin) {
      onBudgetChange(localMin, value);
    }
  };

  const formatCurrency = (value) => {
    if (value >= 999999) return '$5,000+';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(value);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Budget Range
        </label>
        <p className="text-xs text-muted-foreground">
          Set your expected budget for this service
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {budgetRanges?.map((range, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleRangeSelect(range)}
            className={`p-3 rounded-lg border smooth-transition text-sm ${
              localMin === range?.min && localMax === range?.max
                ? 'border-primary bg-primary/5 text-primary' :'border-border hover:border-primary/50 hover:bg-muted'
            }`}
          >
            {range?.label}
          </button>
        ))}
      </div>
      <div className="p-4 bg-muted rounded-lg space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Custom Range</span>
          <div className="flex items-center gap-2 text-sm">
            <Icon name="DollarSign" size={16} color="var(--color-primary)" />
            <span className="font-semibold text-primary">
              {formatCurrency(localMin)} - {formatCurrency(localMax)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">
              Minimum Budget
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <input
                type="number"
                value={localMin}
                onChange={handleMinChange}
                min="0"
                className="w-full pl-7 pr-3 py-2 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none smooth-transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-2 block">
              Maximum Budget
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <input
                type="number"
                value={localMax}
                onChange={handleMaxChange}
                min={localMin}
                className="w-full pl-7 pr-3 py-2 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none smooth-transition"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetRangeSlider;