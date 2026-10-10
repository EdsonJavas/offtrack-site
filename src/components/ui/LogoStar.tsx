/** A estrela do logo (a mesma do hero): 4 pontas retas, miolo em 16% do raio. */
export function LogoStar({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      // Pontas finas serrilham no fill puro: um contorno mínimo arredondado
      // na mesma cor suaviza as bordas em qualquer tamanho.
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
