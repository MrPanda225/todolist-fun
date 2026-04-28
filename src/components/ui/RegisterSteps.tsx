const STEPS = [
  'Crée ton compte',
  'Ajoute tes tâches',
  "Gagne de l'XP",
] as const;

/** Étapes d'onboarding dans le panneau gauche de Register. */
export function RegisterSteps() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignSelf: 'stretch' }}>
      {STEPS.map((step, index) => (
        <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width:           28,
            height:          28,
            borderRadius:    '50%',
            background:      'rgba(255,255,255,0.15)',
            color:           'white',
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            fontSize:        13,
            fontWeight:      700,
            flexShrink:      0,
          }}>
            {index + 1}
          </div>
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: 500 }}>
            {step}
          </span>
        </div>
      ))}
    </div>
  );
}