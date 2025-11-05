const BASE_URL = 'http://localhost:3000'

// ==================== Types ====================
export interface ApiKey {
  id: string
  user_id: string | null
  api_key: string
  description: string | null
  token_used: number
  created_at: string
}

export interface Chatroom {
  id: string
  title: string
  base_persona_id: string
  created_at: string
  updated_at: string
}

export interface ChatroomMessage {
  id: string
  chatroom_id: string
  role: 'user' | 'assistant'
  content: string
  persona_id: string | null
  created_at: string
}

export interface CreateChatroomDto {
  title: string
  persona_ids?: string[]
}

export interface CreateMessageDto {
  chatroom_id: string
  role: 'user' | 'assistant'
  content: string
  persona_id?: string | null
}

// ==================== API Service ====================
export const apiService = {
  // API Keys
  async getApiKeys(): Promise<ApiKey[]> {
    const response = await fetch(`${BASE_URL}/api_keys`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch API keys: ${response.statusText}`)
    }
    
    return response.json()
  },

  // Chatrooms
  async getChatroom(chatroomId: string): Promise<Chatroom> {
    const response = await fetch(`${BASE_URL}/chatrooms/${chatroomId}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch chatroom: ${response.statusText}`)
    }
    
    return response.json()
  },

  async createChatroom(data: CreateChatroomDto): Promise<Chatroom> {
    const response = await fetch(`${BASE_URL}/chatrooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to create chatroom: ${response.statusText}`)
    }

    return response.json()
  },

  // Chatroom Messages
  async getChatroomMessages(chatroomId: string): Promise<ChatroomMessage[]> {
    const response = await fetch(`${BASE_URL}/chatroom-messages/${chatroomId}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.statusText}`)
    }
    
    return response.json()
  },

  async createMessage(data: CreateMessageDto): Promise<ChatroomMessage> {
    const response = await fetch(`${BASE_URL}/chatroom-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to create message: ${response.statusText}`)
    }

    return response.json()
  },
}
