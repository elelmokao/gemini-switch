import { Button } from "@/components/ui/button"
import { Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ApiManageCard } from "./api-manage-card"
import {
  Bot,
  KeyRound,
  PlusIcon,
  Search,
  Settings,
} from "lucide-react"
import { useChatroomContext } from "../contexts/useChatroomContext"
import type { Chatroom } from "../contexts/ChatroomContext"

interface ConversationGroup {
  period: string
  conversations: {
    id: string
    title: string
  }[]
}

// Helper function to group chatrooms by time period
function groupChatroomsByTime(chatrooms: Chatroom[]): ConversationGroup[] {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

  const groups: ConversationGroup[] = [
    { period: "Today", conversations: [] },
    { period: "Yesterday", conversations: [] },
    { period: "Last 7 days", conversations: [] },
    { period: "Last month", conversations: [] },
  ]

  chatrooms.forEach((chatroom) => {
    const createdAt = new Date(chatroom.created_at)
    
    if (createdAt >= today) {
      groups[0].conversations.push({ id: chatroom.id, title: chatroom.title })
    } else if (createdAt >= yesterday) {
      groups[1].conversations.push({ id: chatroom.id, title: chatroom.title })
    } else if (createdAt >= lastWeek) {
      groups[2].conversations.push({ id: chatroom.id, title: chatroom.title })
    } else if (createdAt >= lastMonth) {
      groups[3].conversations.push({ id: chatroom.id, title: chatroom.title })
    }
  })

  // Filter out empty groups
  return groups.filter(group => group.conversations.length > 0)
}

export function ChatSidebar() {
  const [openApiDialog, setOpenApiDialog] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<ConversationGroup[]>([])
  const navigate = useNavigate()
  
  // Use the chatroom context
  const { chatrooms, refreshChatrooms, isLoading, error } = useChatroomContext()

  // Update conversation history when chatrooms change
  useEffect(() => {
    setConversationHistory(groupChatroomsByTime(chatrooms))
  }, [chatrooms])

  // Fetch chatrooms on component mount
  useEffect(() => {
    refreshChatrooms()
  }, [refreshChatrooms])
  return (
    <Sidebar>
      <SidebarHeader className="flex flex-row items-center justify-between gap-2 px-2 py-4">
        <div className="flex flex-row items-center gap-2 px-2">
          <div className="bg-primary/10 size-8 rounded-md"></div>
          <div className="text-md font-base text-primary tracking-tight">
            Gemini Switch
          </div>
        </div>
        <Button variant="ghost" className="size-8">
          <Search className="size-4" />
        </Button>
      </SidebarHeader>
      <SidebarContent className="pt-4">
        <div className="px-4">
          <Button
            variant="outline"
            className="mb-4 flex w-full items-center gap-2"
            onClick={() => navigate("/")}
          >
            <PlusIcon className="size-4" />
            <span>New Chat</span>
          </Button>
        </div>
        
        {isLoading ? (
          <div className="px-4">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading conversations...</p>
            </div>
          </div>
        ) : error ? (
          <div className="px-4">
            <div className="text-center py-8">
              <p className="text-sm text-red-600">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshChatrooms}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : conversationHistory.length === 0 ? (
          <div className="px-4">
            <div className="text-center py-8">
              <p className="text-sm text-gray-600">No conversations yet</p>
              <p className="text-xs text-gray-500 mt-1">Start a new chat to see it here</p>
            </div>
          </div>
        ) : (
          conversationHistory.map((group) => (
            <SidebarGroup key={group.period}>
              <SidebarGroupLabel>{group.period}</SidebarGroupLabel>
              <SidebarMenu>
                {group.conversations.map((conversation) => (
                  <SidebarMenuButton 
                    key={conversation.id}
                    onClick={() => navigate(`/${conversation.id}`)}
                  >
                    <span className="truncate">{conversation.title}</span>
                  </SidebarMenuButton>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          ))
        )}
      </SidebarContent>
      <SidebarFooter className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => navigate("/personas")}>
              <Bot />Persona Management
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setOpenApiDialog(true)}><KeyRound />API Management</DropdownMenuItem>
            <DropdownMenuItem><Settings />Setting</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Dialog open={openApiDialog} onOpenChange={setOpenApiDialog}>
          <DialogContent className="max-w-lg w-full">
            <DialogTitle>API Key Management</DialogTitle>
            <DialogDescription>
              Add, view, or remove your API keys below.
            </DialogDescription>
            <ApiManageCard />
          </DialogContent>
        </Dialog>
      </SidebarFooter>
    </Sidebar>
  )
}