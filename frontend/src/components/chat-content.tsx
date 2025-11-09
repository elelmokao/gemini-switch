"use client"

import { useRef, useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useChatroomContext } from "../contexts/useChatroomContext"
import { io, Socket } from "socket.io-client"
import { apiService, type Chatroom } from "@/services/api.service"
import { useApiKeys } from "@/hooks/useApiKeys"
import { ChatHeader } from "./chat/ChatHeader"
import { ChatMessages } from "./chat/ChatMessages"
import { ChatInput } from "./chat/ChatInput"
import { EmptyState } from "./chat/EmptyState"

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

export function ChatContent() {
  const assistantContentRef = useRef("")
  const currentPersonaIdRef = useRef<string | null>(null) // Track current persona ID for AI response
  const { chatroomId } = useParams<{ chatroomId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatroom, setChatroom] = useState<Chatroom | null>(null)
  const [isLoadingChatroom, setIsLoadingChatroom] = useState(!!chatroomId)
  const [error, setError] = useState<string | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const chatroomIdRef = useRef<string | undefined>(chatroomId)
  
  // Use API Keys hook
  const { 
    apiKeys, 
    selectedApiKey, 
    setSelectedApiKey, 
    isLoading: isLoadingApiKeys,
    error: apiKeysError,
    refetch: fetchApiKeys 
  } = useApiKeys()
  
  // Merge API keys error into general error if needed
  useEffect(() => {
    if (apiKeysError && !error) {
      setError(apiKeysError)
    }
  }, [apiKeysError, error])
  
  // Update chatroomId ref when it changes
  useEffect(() => {
    chatroomIdRef.current = chatroomId
  }, [chatroomId])
  
  // Get the refresh function from context
  const { refreshChatrooms } = useChatroomContext()

  // Initialize WebSocket connection
  useEffect(() => {
    console.log('Initializing WebSocket connection...')
    setIsConnecting(true)
    
    const socketInstance = io('http://localhost:3000', {
      transports: ['websocket'],
    })
    
    socketInstance.on('connect', () => {
      console.log('Connected to server. Socket ID:', socketInstance.id)
      setIsConnecting(false)
    })

    socketInstance.on('disconnect', (reason) => {
      console.log('Disconnected from server. Reason:', reason)
      setIsConnecting(true)
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
        apiService.createMessage({
          chatroom_id: currentChatroomId,
          role: 'assistant',
          content,
          persona_id: currentPersonaIdRef.current, // Use the persona ID from the request
        })
          .then(savedMessage => {
            console.log('[assistantContentRef] Assistant message saved to database:', savedMessage.id)
            // Clear the persona ID after saving
            currentPersonaIdRef.current = null
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
        const chatroomData = await apiService.getChatroom(chatroomId)
        setChatroom(chatroomData)
        
        // Load existing messages from database
        try {
          const messages = await apiService.getChatroomMessages(chatroomId)
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
            
            // Get persona IDs from the chatroom (if any were mentioned during creation)
            const chatroomPersonaIds = chatroomData.persona_ids || []
            const firstPersonaId = chatroomPersonaIds.length > 0 ? chatroomPersonaIds[0] : null
            
            // Store persona ID for AI response
            currentPersonaIdRef.current = firstPersonaId
            
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
                    api_key: selectedApiKey,
                    mentioned_persona_ids: chatroomPersonaIds
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

  const handleSubmit = async (mentionedPersonaIds: string[] = []) => {
    if (!prompt.trim()) return

    const userMessage = prompt.trim()
    setPrompt("")
    setIsLoading(true)
    // If we don't have a chatroom ID, create a new chatroom first
    if (!chatroomId) {
      try {
        // Step 1: Create the chatroom
        const title = userMessage.slice(0, 50) + (userMessage.length > 50 ? '...' : '') // Use first 50 chars as title
        const newChatroom = await apiService.createChatroom({
          title: title,
          persona_ids: mentionedPersonaIds,
        })

        // Step 2: Create the user message in the chatroom
        await apiService.createMessage({
          chatroom_id: newChatroom.id,
          role: 'user',
          content: userMessage,
          persona_id: mentionedPersonaIds.length > 0 ? mentionedPersonaIds[0] : null,
        })

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
      const savedMessage = await apiService.createMessage({
        chatroom_id: chatroomId,
        role: 'user',
        content: userMessage,
        persona_id: mentionedPersonaIds.length > 0 ? mentionedPersonaIds[0] : null,
      })

      // Add user message to UI immediately
      const newUserMessage: ChatMessage = {
        id: savedMessage.id || chatMessages.length + 1,
        role: "user" as const,
        content: userMessage,
      }

      setChatMessages([...chatMessages, newUserMessage])

      // Send message to AI via WebSocket if socket is connected
      if (socket && socket.connected && selectedApiKey) {
        // Store the persona ID for later use when saving AI response
        currentPersonaIdRef.current = mentionedPersonaIds.length > 0 ? mentionedPersonaIds[0] : null
        
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
          api_key: selectedApiKey,
          mentioned_persona_ids: mentionedPersonaIds
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
      <ChatHeader
        title={chatroom?.title || "New Chat"}
        isConnecting={isConnecting}
        socketConnected={socket?.connected || false}
        apiKeys={apiKeys}
        selectedApiKey={selectedApiKey}
        isLoadingApiKeys={isLoadingApiKeys}
        onApiKeyChange={setSelectedApiKey}
        onRefreshApiKeys={fetchApiKeys}
      />

      <ChatMessages messages={chatMessages}>
        <EmptyState />
      </ChatMessages>

      <ChatInput
        value={prompt}
        isLoading={isLoading}
        isConnecting={isConnecting}
        isDisabled={!prompt.trim() || isLoading || isConnecting || !socket?.connected || !selectedApiKey}
        disabledReason={
          isConnecting ? "Connecting to server..." :
          !socket?.connected ? "WebSocket disconnected" :
          !selectedApiKey ? "Please select an API key" :
          !prompt.trim() ? "Enter a message" :
          undefined
        }
        onValueChange={setPrompt}
        onSubmit={handleSubmit}
      />
    </main>
  )
}