import { useContext } from 'react'
import { ChatroomContext } from './chatroomContextDef'

export function useChatroomContext() {
  const context = useContext(ChatroomContext)
  if (context === undefined) {
    throw new Error('useChatroomContext must be used within a ChatroomProvider')
  }
  return context
}