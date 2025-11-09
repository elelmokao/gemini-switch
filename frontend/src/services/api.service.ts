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
  persona_ids: string[]
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

export interface Persona {
  id: string
  name: string
  description: string | null
  system_prompt: string
  model_used: string
  api_key_id: string
  created_at: string
  updated_at: string
}

// Raw persona type from backend (api_key_id might be an object)
interface RawPersona {
  id: string
  name: string
  description: string | null
  system_prompt: string
  model_used: string
  api_key_id: string | { id: string }
  created_at: string
  updated_at: string
}

// Helper function to normalize persona data from backend
function normalizePersona(rawPersona: RawPersona): Persona {
  return {
    id: rawPersona.id,
    name: rawPersona.name,
    description: rawPersona.description,
    system_prompt: rawPersona.system_prompt,
    model_used: rawPersona.model_used,
    // Handle api_key_id which might be an object with {id} or a string
    api_key_id: typeof rawPersona.api_key_id === 'object' && rawPersona.api_key_id?.id 
      ? rawPersona.api_key_id.id 
      : rawPersona.api_key_id as string,
    created_at: rawPersona.created_at,
    updated_at: rawPersona.updated_at,
  }
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

  // Personas
  async getPersonas(): Promise<Persona[]> {
    const response = await fetch(`${BASE_URL}/personas`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch personas: ${response.statusText}`)
    }
    
    const rawPersonas = await response.json()
    return rawPersonas.map(normalizePersona)
  },

  async createPersona(data: Omit<Persona, 'id' | 'created_at' | 'updated_at'>): Promise<Persona> {
    const response = await fetch(`${BASE_URL}/personas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: '00000000-0000-0000-0000-000000000000', // Default UUID for demo
        name: data.name,
        description: data.description,
        system_prompt: data.system_prompt,
        model_used: data.model_used,
        api_key_id: data.api_key_id,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to create persona:', errorText)
      throw new Error(`Failed to create persona: ${response.statusText}`)
    }

    const rawPersona = await response.json()
    return normalizePersona(rawPersona)
  },

  async deletePersona(id: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/personas/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`Failed to delete persona: ${response.statusText}`)
    }
  },
}
