import { ReactNode } from 'react';

interface OverlayProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export default function Overlay({ title, subtitle, children }: OverlayProps) {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10">
      <div className="pointer-events-auto bg-background/90 border-2 border-accent p-8 rounded-lg shadow-2xl max-w-md">
        <h1 className="text-3xl font-bold text-accent mb-2 text-center">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg text-foreground/80 mb-4 text-center">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
