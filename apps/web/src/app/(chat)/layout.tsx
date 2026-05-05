export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen w-screen bg-[#111b21] flex overflow-hidden">
      {children}
    </div>
  )
}