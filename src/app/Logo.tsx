import { useId } from "react";

/** Ícone do CardVoz (pilha de fichas com barras de voz), nas cores do tema. */
export function Logo({ tamanho = 40 }: { tamanho?: number }) {
  const mascara = useId();
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <defs>
        <mask id={mascara} maskUnits="userSpaceOnUse">
          <rect width="64" height="64" fill="#fff" />
          <rect x="6.5" y="16.5" width="47" height="41" rx="11.5" fill="#000" />
        </mask>
      </defs>
      <rect className="logo-fundo" width="64" height="64" rx="14" />
      <rect className="logo-ficha" x="18" y="9" width="36" height="27" rx="7" fillOpacity="0.55" mask={`url(#${mascara})`} />
      <rect className="logo-ficha" x="10" y="20" width="40" height="34" rx="8" />
      <path className="logo-barras" d="M22 32v10M30 28v18M38 31v12" strokeWidth="6" strokeLinecap="round" fill="none" />
    </svg>
  );
}
