import { ChatSidebar } from "./components/chat-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ChatSidebar />
      <SidebarInset>
        <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
          <main style={{ flex: 1, height: "100vh" }}>
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
