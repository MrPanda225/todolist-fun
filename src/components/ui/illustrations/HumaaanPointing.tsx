/** Personnage Humaaan pointant vers la droite — page Login. */
export function HumaaanPointing() {
  return (
    <svg
      viewBox="0 0 500 500"
      style={{ width: 'clamp(180px, 20vw, 280px)', height: 'auto', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.3))' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="250" cy="420" rx="80" ry="18" fill="rgba(13,31,51,0.12)" />
      <rect x="215" y="330" width="22" height="90" rx="11" fill="#0D1F33" />
      <rect x="263" y="330" width="22" height="90" rx="11" fill="#0D1F33" />
      <ellipse cx="226" cy="420" rx="20" ry="9" fill="#2470BD" />
      <ellipse cx="274" cy="420" rx="20" ry="9" fill="#2470BD" />
      <rect x="200" y="220" width="100" height="120" rx="20" fill="#2470BD" />
      <rect x="175" y="228" width="26" height="80" rx="13" fill="#2470BD" />
      <circle cx="185" cy="314" r="13" fill="#F5C5A3" />
      <rect x="299" y="215" width="80" height="22" rx="11" fill="#2470BD" transform="rotate(-15 299 215)" />
      <circle cx="376" cy="208" r="13" fill="#F5C5A3" />
      <rect x="237" y="195" width="26" height="30" rx="10" fill="#F5C5A3" />
      <circle cx="250" cy="170" r="52" fill="#F5C5A3" />
      <ellipse cx="250" cy="125" rx="46" ry="22" fill="#0D1F33" />
      <rect x="204" y="118" width="20" height="40" rx="10" fill="#0D1F33" />
      <circle cx="234" cy="165" r="6" fill="#0D1F33" />
      <circle cx="266" cy="165" r="6" fill="#0D1F33" />
      <circle cx="236" cy="163" r="2" fill="white" />
      <circle cx="268" cy="163" r="2" fill="white" />
      <path d="M238 182 Q250 194 262 182" stroke="#0D1F33" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <rect x="310" y="120" width="140" height="60" rx="14" fill="white" opacity="0.92" />
      <polygon points="320,180 300,195 340,180" fill="white" opacity="0.92" />
      <text x="326" y="145" fontFamily="system-ui" fontSize="13" fill="#0D1F33" fontWeight="600">Bonjour 👋</text>
      <text x="320" y="166" fontFamily="system-ui" fontSize="12" fill="#2470BD">Prêt à planifier ?</text>
    </svg>
  );
}