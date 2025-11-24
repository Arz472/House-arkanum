interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export default function Button({
  label,
  onClick,
  variant = 'primary',
}: ButtonProps) {
  const baseClasses =
    'px-6 py-3 font-bold rounded transition-all duration-200 cursor-pointer';
  const variantClasses =
    variant === 'primary'
      ? 'bg-accent text-background hover:bg-accent/80 hover:scale-105'
      : 'bg-foreground/20 text-foreground hover:bg-foreground/30 hover:scale-105';

  return (
    <button className={`${baseClasses} ${variantClasses}`} onClick={onClick}>
      {label}
    </button>
  );
}
