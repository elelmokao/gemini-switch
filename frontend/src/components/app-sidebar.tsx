import { ChevronUp, MessagesSquare, Settings } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Menu items.
const items = [
  {
    title: "Room 1",
    url: "#",
    icon: MessagesSquare,
  },
  {
    title: "Room 2",
    url: "#",
    icon: MessagesSquare,
  },
  {
    title: "Room 3",
    url: "#",
    icon: MessagesSquare,
  },
  {
    title: "Room 4",
    url: "#",
    icon: MessagesSquare,
  },
  {
    title: "Room 5",
    url: "#",
    icon: MessagesSquare,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <h2 style={{ textAlign: "center", width: "100%", fontSize: 30 }}>Gemini Switch</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Chatrooms</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <Settings /> Setting
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                sideOffset={8}
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem>
                  <span>Personas</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>API Keys</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Others</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
