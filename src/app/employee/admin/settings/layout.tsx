export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Settings pages use the main admin layout sidebar
  // Add padding here since pages use insideTabLayout which skips padding
  return <div className="p-6">{children}</div>
}
