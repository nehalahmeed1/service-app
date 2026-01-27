import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const CredentialsTab = ({ credentials }) => {
  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl shadow-sm border border-border p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-semibold mb-4">Certifications & Licenses</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {credentials?.certifications?.map((cert) => (
            <div key={cert?.id} className="flex gap-4 p-4 bg-muted rounded-lg">
              <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center bg-success/10 rounded-lg">
                <Icon name="Award" size={32} color="var(--color-success)" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground mb-1">{cert?.name}</h4>
                <p className="text-sm text-muted-foreground mb-2">{cert?.issuer}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icon name="Calendar" size={12} />
                  <span>Issued: {cert?.issueDate}</span>
                </div>
                {cert?.expiryDate && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Icon name="Calendar" size={12} />
                    <span>Expires: {cert?.expiryDate}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-card rounded-xl shadow-sm border border-border p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-semibold mb-4">Insurance Coverage</h3>
        <div className="space-y-4">
          {credentials?.insurance?.map((ins) => (
            <div key={ins?.id} className="flex items-start gap-4 p-4 bg-muted rounded-lg">
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-primary/10 rounded-lg">
                <Icon name="Shield" size={24} color="var(--color-primary)" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground mb-1">{ins?.type}</h4>
                <p className="text-sm text-muted-foreground mb-2">{ins?.provider}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Icon name="DollarSign" size={14} />
                    <span className="text-muted-foreground">Coverage: {ins?.coverage}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon name="Calendar" size={14} />
                    <span className="text-muted-foreground">Valid until: {ins?.validUntil}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-card rounded-xl shadow-sm border border-border p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-semibold mb-4">Background Checks</h3>
        <div className="space-y-3">
          {credentials?.backgroundChecks?.map((check) => (
            <div key={check?.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Icon
                  name={check?.status === 'verified' ? 'CheckCircle2' : 'Clock'}
                  size={20}
                  color={check?.status === 'verified' ? 'var(--color-success)' : 'var(--color-warning)'}
                />
                <div>
                  <div className="font-medium text-foreground">{check?.type}</div>
                  <div className="text-xs text-muted-foreground">{check?.date}</div>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  check?.status === 'verified'
                    ? 'bg-success/10 text-success' :'bg-warning/10 text-warning'
                }`}
              >
                {check?.status === 'verified' ? 'Verified' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-card rounded-xl shadow-sm border border-border p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-semibold mb-4">Professional Memberships</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {credentials?.memberships?.map((membership) => (
            <div key={membership?.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-background">
                <Image
                  src={membership?.logo}
                  alt={membership?.logoAlt}
                  className="w-full h-full object-contain p-1"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground text-sm">{membership?.organization}</div>
                <div className="text-xs text-muted-foreground">Member since {membership?.since}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CredentialsTab;