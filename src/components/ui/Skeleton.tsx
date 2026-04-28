import React from 'react';

interface SkeletonProps {
  width?:  string | number;
  height?: string | number;
  radius?: number;
  style?:  React.CSSProperties;
}

/** Bloc skeleton animé — remplace shadcn/ui Skeleton. */
export function Skeleton({ width = '100%', height = 16, radius = 8, style }: SkeletonProps) {
  return (
    <div style={{
      width,
      height,
      borderRadius:    radius,
      background:      'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
      backgroundSize:  '200% 100%',
      animation:       'skeleton-shimmer 1.5s infinite',
      ...style,
    }} />
  );
}