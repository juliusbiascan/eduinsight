'use client';

import { Turnstile } from 'next-turnstile';

interface TurnstileWidgetProps {
  onStatusChange: (status: 'success' | 'error' | 'expired' | 'required') => void;
  onError: (error: string) => void;
}

const TurnstileWidget = ({ onStatusChange, onError }: TurnstileWidgetProps) => {
  return (
    <Turnstile
      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
      retry="auto"
      refreshExpired="auto"
      sandbox={process.env.NODE_ENV === "development"}
      onError={() => {
        onStatusChange("error");
        onError("Security check failed. Please try again.");
      }}
      onExpire={() => {
        onStatusChange("expired");
        onError("Security check expired. Please verify again.");
      }}
      onLoad={() => {
        onStatusChange("required");
        onError('');
      }}
      onVerify={() => {
        onStatusChange("success");
        onError('');
      }}
      theme="light"
      appearance="interaction-only"
    />
  );
};

export default TurnstileWidget;
