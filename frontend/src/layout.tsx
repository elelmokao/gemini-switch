import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
        <AppSidebar />
        <main style={{ flex: 1, height: "100vh" }}>
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
