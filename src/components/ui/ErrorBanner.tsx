import React from 'react';
import { AlertCircle } from 'lucide-react';
import { colors, radius, spacing } from '../../styles/tokens';

interface ErrorBannerProps {
  message: string;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  if (!message) return null;
  return (
    <div role="alert" style={styles.banner}>
      <AlertCircle size={18} color={colors.errorText} style={{ flexShrink: 0 }} />
      <span>{message}</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  banner: {
    display: 'flex', alignItems: 'center', gap: spacing.sm,
    background: colors.errorBg, border: `1px solid ${colors.errorBorder}`,
    borderRadius: radius.sm, padding: '10px 14px',
    fontSize: 14, color: colors.errorText,
  },
};