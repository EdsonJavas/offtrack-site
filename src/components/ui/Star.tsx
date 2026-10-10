interface StarProps {
  size?: number;
  className?: string;
}

/**
 * Estrela padrão da OFFTRACK (a mesma do logo e do hero): 4 pontas retas,
 * miolo em 16% do raio. Versão com `size` fixo para ícones em linha.
 */
export function Star({ size = 16, className }: StarProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      shapeRendering="geometricPrecision"
    >
      <path
        d="M12 0 13.36 10.64 24 12 13.36 13.36 12 24 10.64 13.36 0 12 10.64 10.64z"
        stroke="currentColor"
        strokeWidth="0.35"
        strokeLinejoin="round"
      />
    </svg>
  );
}
