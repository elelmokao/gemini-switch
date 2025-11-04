import { useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { ChatroomContext } from './chatroomContextDef'
import type { ChatroomContextType } from './chatroomContextDef'

export interface Chatroom {
  id: string
  title: string
  created_at: string
  updated_at: string
}

interface ChatroomProviderProps {
  children: ReactNode
}

export function ChatroomProvider({ children }: ChatroomProviderProps) {
  const [chatrooms, setChatrooms] = useState<Chatroom[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshChatrooms = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('http://localhost:3000/chatrooms')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch chatrooms: ${response.statusText}`)
      }
      
      const chatroomsData: Chatroom[] = await response.json()
      
      // Sort chatrooms by creation time (newest first)
      const sortedChatrooms = chatroomsData.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      
      setChatrooms(sortedChatrooms)
    } catch (err) {
      console.error('Error fetching chatrooms:', err)
      setError(err instanceof Error ? err.message : 'Failed to load chatrooms')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateChatroom = useCallback(async (id: string, title: string) => {
    try {
      const response = await fetch(`http://localhost:3000/chatrooms/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to update chatroom: ${response.statusText}`)
      }
      
      // Refresh chatrooms to get updated data
      await refreshChatrooms()
    } catch (err) {
      console.error('Error updating chatroom:', err)
      throw err
    }
  }, [refreshChatrooms])

  const deleteChatroom = useCallback(async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3000/chatrooms/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error(`Failed to delete chatroom: ${response.statusText}`)
      }
      
      // Refresh chatrooms to get updated list
      await refreshChatrooms()
    } catch (err) {
      console.error('Error deleting chatroom:', err)
      throw err
    }
  }, [refreshChatrooms])

  const value: ChatroomContextType = {
    chatrooms,
    setChatrooms,
    refreshChatrooms,
    updateChatroom,
    deleteChatroom,
    isLoading,
    error,
  }

  return (
    <ChatroomContext.Provider value={value}>
      {children}
    </ChatroomContext.Provider>
  )
}