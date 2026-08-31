function Avatar({ email, size = 'md' }: { email: string; size?: 'sm' | 'md' }) {
  const dimension = size === 'md' ? 'h-7 w-7 text-xs' : 'h-6 w-6 text-[11px]'
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-white/10 font-medium text-ink ${dimension}`}
    >
      {email.charAt(0).toUpperCase()}
    </span>
  )
}

export default Avatar
