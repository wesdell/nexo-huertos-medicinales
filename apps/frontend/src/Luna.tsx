/**
 * Dibujo de la fase lunar. En la línea ecuatorial la luna creciente y menguante se ven como un
 * «bote» (iluminada abajo o arriba), no de lado como en latitudes altas.
 */
export function Luna({ fase, className = 'size-14' }: { fase: string; className?: string }) {
  const sombra = '#2A241D';
  const luz = '#F4E3B5';
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <circle cx="24" cy="24" r="21" fill={fase === 'LUNA_NUEVA' ? sombra : luz} />
      {fase === 'CRECIENTE' && <path d="M3 24a21 21 0 0 1 42 0z" fill={sombra} />}
      {fase === 'MENGUANTE' && <path d="M3 24a21 21 0 0 0 42 0z" fill={sombra} />}
      {fase === 'LUNA_NUEVA' && <circle cx="24" cy="24" r="20" fill="none" stroke={luz} strokeOpacity="0.35" strokeWidth="1.5" />}
      {fase === 'LLENA' && (
        <>
          <circle cx="17" cy="18" r="3.5" fill="#E7CF92" />
          <circle cx="29" cy="29" r="4.5" fill="#E7CF92" />
          <circle cx="30" cy="15" r="2" fill="#E7CF92" />
        </>
      )}
    </svg>
  );
}
