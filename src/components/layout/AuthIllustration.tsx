import React from 'react';
import { spacing } from '../../styles/tokens';

interface AuthIllustrationProps {
  tagline: React.ReactNode;
  figure:  React.ReactNode;
  footer?: React.ReactNode;
}

/** Panneau illustratif gauche avec dégradé animé, tagline et slot figure. */
export function AuthIllustration({ tagline, figure, footer }: AuthIllustrationProps) {
  return (
    <div style={styles.content}>
      <p style={styles.tagline} className="animate-fade-up delay-100">
        {tagline}
      </p>

      <div className="animate-float" style={{ marginTop: 8 }}>
        {figure}
      </div>

      {footer && (
        <div style={styles.footer} className="animate-fade-up delay-300">
          {footer}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  content: {
    position:        'relative',
    zIndex:          1,
    display:         'flex',
    flexDirection:   'column',
    alignItems:      'center',
    gap:             spacing.lg,
    padding:         spacing.xl,
    width:           '100%',
  },
  tagline: {
    color:         '#F5F5F5',
    fontSize:      'clamp(18px, 2.5vw, 28px)',
    fontWeight:    700,
    textAlign:     'center',
    lineHeight:    1.35,
    margin:        0,
    letterSpacing: '-0.02em',
  },
  footer: {
    display:         'flex',
    alignItems:      'center',
    gap:             spacing.lg,
    background:      'rgba(255,255,255,0.1)',
    backdropFilter:  'blur(8px)',
    borderRadius:    16,
    padding:         '14px 28px',
    border:          '1px solid rgba(255,255,255,0.15)',
    flexWrap:        'wrap',
    justifyContent:  'center',
  },
};