interface StarProps {
  size?: number;
  className?: string;
}

/** Estrela de quatro pontas: símbolo gráfico da OFFTRACK. */
export function Star({ size = 16, className }: StarProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 0c.6 7 5 11.4 12 12-7 .6-11.4 5-12 12-.6-7-5-11.4-12-12 7-.6 11.4-5 12-12z" />
    </svg>
  );
}
