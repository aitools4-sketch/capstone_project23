function SectionGlow() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
      <div className="h-px w-2/3 max-w-3xl bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  )
}

export default SectionGlow
