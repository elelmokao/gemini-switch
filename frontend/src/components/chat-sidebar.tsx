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
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ApiManageCard } from "./api-manage-card"
import {
  Bot,
  KeyRound,
  PlusIcon,
  Search,
  Settings,
  Pencil,
  Trash2,
  MoreVertical,
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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const navigate = useNavigate()
  
  // Use the chatroom context
  const { chatrooms, refreshChatrooms, updateChatroom, deleteChatroom, isLoading, error } = useChatroomContext()

  // Update conversation history when chatrooms change
  useEffect(() => {
    setConversationHistory(groupChatroomsByTime(chatrooms))
  }, [chatrooms])

  // Fetch chatrooms on component mount
  useEffect(() => {
    refreshChatrooms()
  }, [refreshChatrooms])

  const handleStartEdit = (id: string, currentTitle: string) => {
    setEditingId(id)
    setEditTitle(currentTitle)
  }

  const handleSaveEdit = async () => {
    if (editingId && editTitle.trim()) {
      try {
        await updateChatroom(editingId, editTitle.trim())
        setEditingId(null)
        setEditTitle("")
      } catch (error) {
        console.error('Failed to update chatroom:', error)
      }
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditTitle("")
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteChatroom(id)
      setDeleteConfirmId(null)
      // If we deleted the current chatroom, navigate to home
      if (window.location.pathname === `/${id}`) {
        navigate("/")
      }
    } catch (error) {
      console.error('Failed to delete chatroom:', error)
    }
  }

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
                  <div key={conversation.id} className="group flex items-center gap-1 pr-2 hover:bg-sidebar-accent rounded-md">
                    {editingId === conversation.id ? (
                      <div className="flex items-center gap-1 flex-1 px-2">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit()
                            if (e.key === 'Escape') handleCancelEdit()
                          }}
                          className="h-8 text-sm"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleSaveEdit}
                          className="h-8 px-2"
                        >
                          ✓
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelEdit}
                          className="h-8 px-2"
                        >
                          ✕
                        </Button>
                      </div>
                    ) : (
                      <>
                        <SidebarMenuButton 
                          onClick={() => navigate(`/${conversation.id}`)}
                          className="flex-1"
                        >
                          <span className="truncate">{conversation.title}</span>
                        </SidebarMenuButton>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => handleStartEdit(conversation.id, conversation.title)}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setDeleteConfirmId(conversation.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </div>
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

        <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
          <DialogContent>
            <DialogTitle>Delete Chatroom</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this chatroom? This action cannot be undone.
            </DialogDescription>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </SidebarFooter>
    </Sidebar>
  )
}