import React from 'react'

const styles = {
  canvas: {
    position: 'fixed', inset: 0, zIndex: 0,
    pointerEvents: 'none', overflow: 'hidden',
  },
  orb: (color, size, top, left, delay) => ({
    position: 'absolute',
    width: size, height: size,
    borderRadius: '50%',
    background: color,
    filter: 'blur(100px)',
    opacity: 0.15,
    top, left,
    animation: `orb-drift 20s ease-in-out infinite alternate`,
    animationDelay: delay,
  }),
}

export default function Background() {
  return (
    <div style={styles.canvas}>
      <div style={styles.orb('radial-gradient(circle, #8b5cf6, #6d28d9)', '650px', '-250px', '-200px', '0s')} />
      <div style={styles.orb('radial-gradient(circle, #00e5ff, #0097a7)', '500px', 'auto', 'auto', '-7s')}
        className="orb-br"
      />
      <div style={styles.orb('radial-gradient(circle, #f43f5e, #be123c)', '380px', '35%', '45%', '-13s')} />
      <style>{`
        .orb-br {
          bottom: -150px !important;
          right: -100px !important;
          top: auto !important;
          left: auto !important;
        }
      `}</style>
    </div>
  )
}
