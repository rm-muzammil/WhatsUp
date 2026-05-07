'use client'

export default function TypingIndicator({ names }: { names: string[] }) {
  if (names.length === 0) return null

  const label =
    names.length === 1
      ? `${names[0]} is typing`
      : `${names.slice(0, 2).join(', ')} are typing`

  return (
    <div className="flex items-center gap-2 px-4 py-1">
      <div className="flex gap-1 items-center">
        <span className="w-1.5 h-1.5 bg-[#8696a0] rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 bg-[#8696a0] rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 bg-[#8696a0] rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
      <span className="text-[#8696a0] text-xs">{label}</span>
    </div>
  )
}