"use client"

import {
  ChatContainerContent,
  ChatContainerRoot,
} from "@/components/ui/chat-container"
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
} from "@/components/ui/message"
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input"
import { ScrollButton } from "@/components/ui/scroll-button"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  ArrowUp,
  Copy,
  Globe,
  Mic,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  ThumbsDown,
  ThumbsUp,
  Trash,
} from "lucide-react"
import { useRef, useState, useEffect, useCallback } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useChatroomContext } from "../contexts/useChatroomContext"
import { io, Socket } from "socket.io-client"

// Interfaces for chatroom data
interface Chatroom {
  id: string
  title: string
  base_persona_id: string
  created_at: string
  updated_at: string
}

// Message interface for better type safety
interface ChatMessage {
  id: number | string
  role: "user" | "assistant"
  content: string
}

// Backend message response interface
interface BackendMessage {
  id: string
  chatroom_id: string
  role: string
  content: string
  persona_id: string | null
  created_at: string
}

// API Key interface for backend response
interface ApiKey {
  id: string
  user_id: string | null
  api_key: string
  description: string | null
  token_used: number
  created_at: string
}

export function ChatContent() {
  const assistantContentRef = useRef("")
  const { chatroomId } = useParams<{ chatroomId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatroom, setChatroom] = useState<Chatroom | null>(null)
  const [isLoadingChatroom, setIsLoadingChatroom] = useState(!!chatroomId)
  const [error, setError] = useState<string | null>(null)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [selectedApiKey, setSelectedApiKey] = useState<string>("")
  const [isLoadingApiKeys, setIsLoadingApiKeys] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const chatroomIdRef = useRef<string | undefined>(chatroomId)
  
  // Update chatroomId ref when it changes
  useEffect(() => {
    chatroomIdRef.current = chatroomId
  }, [chatroomId])
  
  // Get the refresh function from context
  const { refreshChatrooms } = useChatroomContext()

  // Fetch API keys from backend
  const fetchApiKeys = useCallback(async () => {
    try {
      setIsLoadingApiKeys(true)
      const response = await fetch('http://localhost:3000/api_keys')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch API keys: ${response.statusText}`)
      }
      
      const apiKeysData: ApiKey[] = await response.json()
      setApiKeys(apiKeysData)
      
      // Set the first API key as selected by default if available
      if (apiKeysData.length > 0 && !selectedApiKey) {
        setSelectedApiKey(apiKeysData[0].api_key)
      }
    } catch (err) {
      console.error('Error fetching API keys:', err)
      setError(err instanceof Error ? err.message : 'Failed to load API keys')
    } finally {
      setIsLoadingApiKeys(false)
    }
  }, [selectedApiKey])

  // Fetch API keys when component mounts
  useEffect(() => {
    fetchApiKeys()
  }, [fetchApiKeys]) // Add fetchApiKeys as dependency

  // Initialize WebSocket connection
  useEffect(() => {
    console.log('Initializing WebSocket connection...')
    const socketInstance = io('http://localhost:3000', {
      transports: ['websocket'],
    })
    
    socketInstance.on('connect', () => {
      console.log('Connected to server. Socket ID:', socketInstance.id)
      setIsConnecting(false)
    })

    socketInstance.on('disconnect', (reason) => {
      console.log('Disconnected from server. Reason:', reason)
    })

    socketInstance.on('error', (error) => {
      console.error('WebSocket error:', error)
      setIsConnecting(false)
    })

    // Handle AI response stream - simplified like Vue version
    socketInstance.on('new_chunk', (data: { text: string }) => {
      console.log('Received chunk:', data.text?.substring(0, 20) + '...', 'Length:', data.text?.length)
      
      // 累積 chunk 到 ref
      assistantContentRef.current += data.text
      console.log('[assistantContentRef] Received chunk, current content:', assistantContentRef.current)
    })

    socketInstance.on('stream_end', async () => {
      console.log('[assistantContentRef] Stream ended')
      setIsLoading(false)
      const content = assistantContentRef.current.trim()
      assistantContentRef.current = ""
      if (!content) return
      const currentChatroomId = chatroomIdRef.current
      const newId = `temp-${Date.now()}`
      // 1. push 一則完整 assistant 訊息到 chatMessages
      setChatMessages(prev => {
        const newMessages: ChatMessage[] = [
          ...prev,
          { id: newId, role: "assistant", content }
        ]
        console.log('[assistantContentRef] Push assistant message:', { id: newId, content })
        return newMessages
      })
      // 2. 儲存到資料庫
      if (currentChatroomId) {
        fetch('http://localhost:3000/chatroom-messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chatroom_id: currentChatroomId,
            role: 'assistant',
            content,
            persona_id: null,
          }),
        })
          .then(response => {
            if (response.ok) {
              return response.json()
            }
            throw new Error('Failed to save assistant message')
          })
          .then(savedMessage => {
            console.log('[assistantContentRef] Assistant message saved to database:', savedMessage.id)
            setChatMessages(current => {
              const updated = [...current]
              const messageIndex = updated.findIndex(msg =>
                msg.role === 'assistant' && msg.id === newId
              )
              if (messageIndex >= 0) {
                updated[messageIndex] = {
                  ...updated[messageIndex],
                  id: savedMessage.id
                }
              }
              return updated
            })
          })
          .catch(error => {
            console.error('[assistantContentRef] Error saving assistant message:', error)
          })
      }
    })

    socketInstance.on('stream_error', (data: { message: string }) => {
      console.error('Stream error:', data.message)
      setError(data.message || 'An error occurred while processing the message')
      setIsLoading(false)
    })

    setSocket(socketInstance)

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up WebSocket connection...')
      socketInstance.disconnect()
    }
  }, []) // Keep empty dependency array to run only once

  // Fetch chatroom data when component mounts or chatroomId changes
  useEffect(() => {
    // If no chatroom ID, we're in the empty state - no need to fetch
    if (!chatroomId) {
      setIsLoadingChatroom(false)
      setChatroom(null)
      setChatMessages([])
      setError(null)
      return
    }

    const fetchChatroom = async () => {
      try {
        setIsLoadingChatroom(true)
        const response = await fetch(`http://localhost:3000/chatrooms/${chatroomId}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch chatroom: ${response.statusText}`)
        }
        
        const chatroomData: Chatroom = await response.json()
        setChatroom(chatroomData)
        
        // Load existing messages from database
        try {
          const messagesResponse = await fetch(`http://localhost:3000/chatroom-messages/${chatroomId}`)
          if (messagesResponse.ok) {
            const messages = await messagesResponse.json()
            // Sort messages by creation time to ensure proper order
            const sortedMessages = messages.sort((a: BackendMessage, b: BackendMessage) => 
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            )
            const formattedMessages: ChatMessage[] = sortedMessages.map((msg: BackendMessage, index: number) => ({
              id: msg.id || index + 1,
              role: msg.role as "user" | "assistant",
              content: msg.content,
            }))
            setChatMessages(formattedMessages)
            
            // Check if we have an initial message from navigation state (for newly created chatrooms)
            // and if there's only one message (the user message we just created)
            const initialMessage = (location.state && typeof location.state === 'object' && 'initialMessage' in location.state 
              ? (location.state as { initialMessage: string }).initialMessage 
              : null) || sessionStorage.getItem(`initialMessage_${chatroomId}`)
              
            if (initialMessage && formattedMessages.length === 1 && formattedMessages[0].role === 'user') {
              // Clear the sessionStorage item since we're using it
              sessionStorage.removeItem(`initialMessage_${chatroomId}`)
              
              // This is a newly created chatroom with only the initial user message
              // Generate AI response via WebSocket like Vue version
              setTimeout(() => {
                if (socket && socket.connected && selectedApiKey) {
                  setIsLoading(true)
                  
                  // Build history from existing messages
                  const historyForApi = formattedMessages
                    .filter(msg => msg.content && msg.content.trim() !== '')
                    .map(msg => ({
                      role: msg.role === 'user' ? 'user' : 'model',
                      parts: [{ text: msg.content }],
                    }))
                  
                  // Don't add empty assistant message here - let new_chunk handle it
                  
                  const payload = {
                    prompt: initialMessage,
                    history: historyForApi,
                    model: 'gemini-1.5-flash',
                    api_key: selectedApiKey
                  }
                  console.log('Sending initial message via WebSocket:', payload)
                  socket.emit('chat', payload)
                } else {
                  console.error('WebSocket not connected or no API key selected for initial message')
                  console.log('Socket connected:', socket?.connected)
                  console.log('Selected API key:', selectedApiKey)
                }
              }, 500) // Small delay to ensure socket is ready
            }
          } else {
            // If no messages found, start with empty array
            setChatMessages([])
          }
        } catch (err) {
          console.error('Error loading messages:', err)
          setChatMessages([])
        }
        
        setError(null)
      } catch (err) {
        console.error('Error fetching chatroom:', err)
        setError(err instanceof Error ? err.message : 'Failed to load chatroom')
      } finally {
        setIsLoadingChatroom(false)
      }
    }

    fetchChatroom()
  }, [chatroomId, location.state, socket, selectedApiKey])

  const handleSubmit = async () => {
    if (!prompt.trim()) return

    const userMessage = prompt.trim()
    setPrompt("")
    setIsLoading(true)
    // If we don't have a chatroom ID, create a new chatroom first
    if (!chatroomId) {
      try {
        // Step 1: Create the chatroom
        const title = userMessage.slice(0, 50) + (userMessage.length > 50 ? '...' : '') // Use first 50 chars as title
        const chatroomResponse = await fetch('http://localhost:3000/chatrooms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: title,
            persona_ids: [],
          }),
        })

        if (!chatroomResponse.ok) {
          throw new Error(`Failed to create chatroom: ${chatroomResponse.statusText}`)
        }

        const newChatroom = await chatroomResponse.json()

        // Step 2: Create the user message in the chatroom
        const messageResponse = await fetch('http://localhost:3000/chatroom-messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chatroom_id: newChatroom.id,
            role: 'user',
            content: userMessage,
            persona_id: null,
          }),
        })

        if (!messageResponse.ok) {
          throw new Error(`Failed to create message: ${messageResponse.statusText}`)
        }

        // Refresh the chatroom list in sidebar
        await refreshChatrooms()
        
        // Navigate to the new chatroom with the user message as state
        // Also store in sessionStorage as backup
        sessionStorage.setItem(`initialMessage_${newChatroom.id}`, userMessage)
        navigate(`/${newChatroom.id}`, { 
          replace: true, 
          state: { initialMessage: userMessage } 
        })
        return
      } catch (err) {
        console.error('Error creating chatroom or message:', err)
        setError(err instanceof Error ? err.message : 'Failed to create chatroom')
        setIsLoading(false)
        return
      }
    }

    // If we have a chatroom ID, proceed with normal message handling
    try {
      // Save user message to database
      const messageResponse = await fetch('http://localhost:3000/chatroom-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatroom_id: chatroomId,
          role: 'user',
          content: userMessage,
          persona_id: null,
        }),
      })

      if (!messageResponse.ok) {
        throw new Error(`Failed to save message: ${messageResponse.statusText}`)
      }

      const savedMessage = await messageResponse.json()

      // Add user message to UI immediately
      const newUserMessage: ChatMessage = {
        id: savedMessage.id || chatMessages.length + 1,
        role: "user" as const,
        content: userMessage,
      }

      setChatMessages([...chatMessages, newUserMessage])

      // Send message to AI via WebSocket if socket is connected
      if (socket && socket.connected && selectedApiKey) {
        // Build conversation history like Vue version
        const historyForApi = chatMessages
          .filter(msg => msg.content && msg.content.trim() !== '')
          .map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
          }))
        
        // Don't add empty assistant message here - let new_chunk handle it
        
        const payload = {
          prompt: userMessage,
          history: historyForApi,
          model: 'gemini-1.5-flash',
          api_key: selectedApiKey
        }
        console.log('Sending message via WebSocket:', payload)
        socket.emit('chat', payload)
      } else {
        console.error('WebSocket not connected or no API key selected')
        console.log('Socket connected:', socket?.connected)
        console.log('Selected API key:', selectedApiKey)
        setIsLoading(false)
        setError('WebSocket not connected or no API key selected')
        return
      }
    } catch (err) {
      console.error('Error saving message:', err)
      setError(err instanceof Error ? err.message : 'Failed to save message')
      setIsLoading(false)
      return
    }
  }

  // Show loading state while fetching chatroom
  if (isLoadingChatroom) {
    return (
      <main className="flex h-screen flex-col overflow-hidden">
        <header className="bg-background z-10 flex h-16 w-full shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="text-foreground">Loading chatroom...</div>
        </header>
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading chatroom...</p>
          </div>
        </div>
      </main>
    )
  }

  // Show error state if there was an error fetching chatroom
  if (error) {
    return (
      <main className="flex h-screen flex-col overflow-hidden">
        <header className="bg-background z-10 flex h-16 w-full shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="text-foreground">Error</div>
        </header>
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
            <p className="text-gray-600">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex h-screen flex-col overflow-hidden">
      <header className="bg-background z-10 flex h-16 w-full shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="text-foreground">{chatroom?.title || "New Chat"}</div>
        {(isConnecting || !socket?.connected) && (
          <div className="text-sm text-muted-foreground">
            {isConnecting ? "Connecting..." : "Disconnected"}
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
          <Select value={selectedApiKey} onValueChange={setSelectedApiKey}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={isLoadingApiKeys ? "Loading..." : "Select API Key"} />
            </SelectTrigger>
            <SelectContent>
              {isLoadingApiKeys ? (
                <SelectItem value="loading" disabled>Loading API keys...</SelectItem>
              ) : apiKeys.length === 0 ? (
                <SelectItem value="no-api-keys" disabled>No API keys available</SelectItem>
              ) : (
                apiKeys.map((apiKey) => (
                  <SelectItem key={apiKey.id} value={apiKey.api_key}>
                    {apiKey.description || apiKey.api_key.slice(0, 20) + '...'}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchApiKeys}
            disabled={isLoadingApiKeys}
            className="h-10 w-10"
            title="Reload API keys"
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingApiKeys ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </header>

      <div ref={chatContainerRef} className="relative flex-1 overflow-y-auto">
        <ChatContainerRoot className="h-full">
          <ChatContainerContent className="space-y-0 px-5 py-12">
            {chatMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md mx-auto">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    Welcome to Gemini Switch
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    Start a conversation by typing your message below. I'm here to help with any questions or tasks you have.
                  </p>
                </div>
              </div>
            ) : (
              chatMessages.map((message, index) => {
              const isAssistant = message.role === "assistant"
              const isLastMessage = index === chatMessages.length - 1

              return (
                <Message
                  key={message.id}
                  className={cn(
                    "mx-auto flex w-full max-w-3xl flex-col gap-2 px-6",
                    isAssistant ? "items-start" : "items-end"
                  )}
                >
                  {isAssistant ? (
                    <div className="group flex w-full flex-col gap-0">
                      <MessageContent
                        className="text-foreground prose flex-1 rounded-lg bg-transparent p-0"
                        markdown
                      >
                        {message.content}
                      </MessageContent>
                      <MessageActions
                        className={cn(
                          "-ml-2.5 flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100",
                          isLastMessage && "opacity-100"
                        )}
                      >
                        <MessageAction tooltip="Copy" delayDuration={100}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                          >
                            <Copy />
                          </Button>
                        </MessageAction>
                        <MessageAction tooltip="Upvote" delayDuration={100}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                          >
                            <ThumbsUp />
                          </Button>
                        </MessageAction>
                        <MessageAction tooltip="Downvote" delayDuration={100}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                          >
                            <ThumbsDown />
                          </Button>
                        </MessageAction>
                      </MessageActions>
                    </div>
                  ) : (
                    <div className="group flex flex-col items-end gap-1">
                      <MessageContent className="bg-muted text-primary max-w-[85%] rounded-3xl px-5 py-2.5 sm:max-w-[75%]">
                        {message.content}
                      </MessageContent>
                      <MessageActions
                        className={cn(
                          "flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                        )}
                      >
                        <MessageAction tooltip="Edit" delayDuration={100}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                          >
                            <Pencil />
                          </Button>
                        </MessageAction>
                        <MessageAction tooltip="Delete" delayDuration={100}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                          >
                            <Trash />
                          </Button>
                        </MessageAction>
                        <MessageAction tooltip="Copy" delayDuration={100}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                          >
                            <Copy />
                          </Button>
                        </MessageAction>
                      </MessageActions>
                    </div>
                  )}
                </Message>
              )
              })
            )}
          </ChatContainerContent>
          <div className="absolute bottom-4 left-1/2 flex w-full max-w-3xl -translate-x-1/2 justify-end px-5">
            <ScrollButton className="shadow-sm" />
          </div>
        </ChatContainerRoot>
      </div>

      <div className="bg-background z-10 shrink-0 px-3 pb-3 md:px-5 md:pb-5">
        <div className="mx-auto max-w-3xl">
          <PromptInput
            isLoading={isLoading}
            value={prompt}
            onValueChange={setPrompt}
            onSubmit={handleSubmit}
            className="border-input bg-popover relative z-10 w-full rounded-3xl border p-0 pt-1 shadow-xs"
          >
            <div className="flex flex-col">
              <PromptInputTextarea
                placeholder="Ask anything"
                className="min-h-[44px] pt-3 pl-4 text-base leading-[1.3] sm:text-base md:text-base"
              />

              <PromptInputActions className="mt-5 flex w-full items-center justify-between gap-2 px-3 pb-3">
                <div className="flex items-center gap-2">
                  <PromptInputAction tooltip="Add a new action">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-9 rounded-full"
                    >
                      <Plus size={18} />
                    </Button>
                  </PromptInputAction>

                  <PromptInputAction tooltip="Search">
                    <Button variant="outline" className="rounded-full">
                      <Globe size={18} />
                      Search
                    </Button>
                  </PromptInputAction>

                  <PromptInputAction tooltip="More actions">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-9 rounded-full"
                    >
                      <MoreHorizontal size={18} />
                    </Button>
                  </PromptInputAction>
                </div>
                <div className="flex items-center gap-2">
                  <PromptInputAction tooltip="Voice input">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-9 rounded-full"
                    >
                      <Mic size={18} />
                    </Button>
                  </PromptInputAction>

                  <Button
                    size="icon"
                    disabled={!prompt.trim() || isLoading || !socket?.connected || !selectedApiKey}
                    onClick={handleSubmit}
                    className="size-9 rounded-full"
                    title={
                      !socket?.connected ? "WebSocket disconnected" :
                      !selectedApiKey ? "Please select an API key" :
                      !prompt.trim() ? "Enter a message" :
                      isLoading ? "Sending..." : "Send message"
                    }
                  >
                    {!isLoading ? (
                      <ArrowUp size={18} />
                    ) : (
                      <span className="size-3 rounded-xs bg-white" />
                    )}
                  </Button>
                </div>
              </PromptInputActions>
            </div>
          </PromptInput>
        </div>
      </div>
    </main>
  )
}