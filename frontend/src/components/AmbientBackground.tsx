const STARS = Array.from({ length: 80 }, (_, i) => {
  const seed = i * 137.5
  return {
    left: (seed * 7) % 100,
    top: (seed * 3.3 + i) % 100,
    size: i % 6 === 0 ? 2 : 1,
    opacity: 0.12 + ((i * 29) % 30) / 100,
  }
})

function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-50 overflow-hidden">
      {STARS.map((star, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
          }}
        />
      ))}
    </div>
  )
}

export default AmbientBackground
