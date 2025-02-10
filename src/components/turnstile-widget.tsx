'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';

const Turnstile = dynamic(
  () => import('next-turnstile').then((mod) => mod.Turnstile),
  { ssr: false }
);

interface TurnstileWidgetProps {
  onStatusChange: (status: 'success' | 'error' | 'expired' | 'required') => void;
  onError: (error: string) => void;
}

const TurnstileWidget = ({ onStatusChange, onError }: TurnstileWidgetProps) => {
  useEffect(() => {
    onStatusChange('required');
    onError('');
  }, [onStatusChange, onError]);

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
