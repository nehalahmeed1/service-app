import React from 'react';
import Icon from '../../../components/AppIcon';
import { Checkbox, CheckboxGroup } from '../../../components/ui/Checkbox';

const SpecialRequirementsSection = ({ 
  requirements, 
  onRequirementsChange,
  accessInstructions,
  onAccessInstructionsChange 
}) => {
  const availableRequirements = [
    {
      id: 'licensed',
      label: 'Licensed & Insured',
      description: 'Provider must have valid license and insurance',
      icon: 'Shield'
    },
    {
      id: 'background',
      label: 'Background Check',
      description: 'Provider must have verified background check',
      icon: 'UserCheck'
    },
    {
      id: 'warranty',
      label: 'Warranty Required',
      description: 'Work must include warranty coverage',
      icon: 'Award'
    },
    {
      id: 'materials',
      label: 'Materials Included',
      description: 'Provider should supply all materials',
      icon: 'Package'
    },
    {
      id: 'cleanup',
      label: 'Cleanup Service',
      description: 'Provider must clean up after work',
      icon: 'Trash2'
    },
    {
      id: 'permit',
      label: 'Permit Handling',
      description: 'Provider handles all necessary permits',
      icon: 'FileText'
    }
  ];

  const handleRequirementToggle = (requirementId) => {
    const updated = requirements?.includes(requirementId)
      ? requirements?.filter(id => id !== requirementId)
      : [...requirements, requirementId];
    onRequirementsChange(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Special Requirements
        </label>
        <p className="text-xs text-muted-foreground">
          Select any specific requirements for your service provider
        </p>
      </div>
      <CheckboxGroup>
        <div className="grid md:grid-cols-2 gap-4">
          {availableRequirements?.map((req) => (
            <div
              key={req?.id}
              className={`p-4 rounded-lg border smooth-transition ${
                requirements?.includes(req?.id)
                  ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
              }`}
            >
              <Checkbox
                checked={requirements?.includes(req?.id)}
                onChange={() => handleRequirementToggle(req?.id)}
                label={
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Icon name={req?.icon} size={20} />
                    </div>
                    <div>
                      <div className="font-medium text-sm mb-1">{req?.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {req?.description}
                      </div>
                    </div>
                  </div>
                }
              />
            </div>
          ))}
        </div>
      </CheckboxGroup>
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          Access Instructions
        </label>
        <textarea
          value={accessInstructions}
          onChange={(e) => onAccessInstructionsChange(e?.target?.value)}
          placeholder="Provide details about property access, parking, gate codes, pet information, or any other relevant instructions for the service provider..."
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none smooth-transition resize-none text-sm"
        />
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          <Icon name="Info" size={14} />
          This information helps providers prepare and arrive ready to work
        </p>
      </div>
    </div>
  );
};

export default SpecialRequirementsSection;