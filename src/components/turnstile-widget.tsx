'use client';

import Turnstile, { useTurnstile } from "react-turnstile";

interface TurnstileWidgetProps {
  onStatusChange: (status: 'success' | 'error' | 'expired' | 'required') => void;
  onError: (error: string) => void;
  className?: string;
}

const TurnstileWidget = ({ onStatusChange, onError, className }: TurnstileWidgetProps) => {
  // Skip verification in development
  if (process.env.NODE_ENV === 'development') {
    onStatusChange('success');
    return null;
  }

  return (
    <div className={className} style={{ width: '300px', height: '65px' }}>

      <Turnstile
        sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        retry="auto"
        refreshExpired="auto"
        onVerify={(token) => {
          onStatusChange("success");
          onError('');
        }}
     
      />
    </div>
  );
};

export default TurnstileWidget;
