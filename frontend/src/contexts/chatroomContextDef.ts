import { createContext } from 'react'
import type { Chatroom } from './ChatroomContext'

interface ChatroomContextType {
  chatrooms: Chatroom[]
  setChatrooms: React.Dispatch<React.SetStateAction<Chatroom[]>>
  refreshChatrooms: () => Promise<void>
  isLoading: boolean
  error: string | null
}

export const ChatroomContext = createContext<ChatroomContextType | undefined>(undefined)
export type { ChatroomContextType }