interface HUDProps {
  label: string;
  current: number;
  total: number;
}

export default function HUD({ label, current, total }: HUDProps) {
  return (
    <div className="absolute top-4 left-4 bg-background/80 border border-accent px-4 py-2 rounded z-20">
      <p className="text-accent font-bold">
        {label}: {current} / {total}
      </p>
    </div>
  );
}
