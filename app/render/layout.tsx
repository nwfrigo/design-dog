export default function RenderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Simple layout without extra wrapper - inherits from root layout
  // Styles are applied inline in the render page
  return <>{children}</>
}
