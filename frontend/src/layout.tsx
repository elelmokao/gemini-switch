import { ChatSidebar } from "./components/chat-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { ChatroomProvider } from "./contexts/ChatroomContext"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-screen h-screen">
      <ChatroomProvider>
        <SidebarProvider>
          <ChatSidebar />
          <SidebarInset>
            <div style={{ display: "flex", height: "100vh" }}>
              <main className="flex-1 min-w-0">
                {children}
              </main>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </ChatroomProvider>
    </div>
  )
}
