interface GovLogoProps {
  className?: string;
}

export default function GovLogo({ className = "h-12 w-12" }: GovLogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M50 5L90 25V50C90 70 75 85 50 95C25 85 10 70 10 50V25L50 5Z"
        fill="currentColor"
        className="text-primary"
        opacity="0.15"
      />
      <path
        d="M50 10L85 27V50C85 68 72 81 50 90C28 81 15 68 15 50V27L50 10Z"
        stroke="currentColor"
        className="text-primary"
        strokeWidth="2.5"
        fill="none"
      />
      <circle
        cx="50"
        cy="45"
        r="15"
        stroke="currentColor"
        className="text-primary"
        strokeWidth="2.5"
        fill="none"
      />
      <path
        d="M50 30V60M35 45H65"
        stroke="currentColor"
        className="text-primary"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M30 70H70"
        stroke="currentColor"
        className="text-primary"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M35 76H65"
        stroke="currentColor"
        className="text-primary"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
