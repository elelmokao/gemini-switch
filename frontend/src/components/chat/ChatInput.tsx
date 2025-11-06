import { useState, useEffect, useRef } from "react"
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
} from "@/components/ui/prompt-input"
import { Button } from "@/components/ui/button"
import {
  ArrowUp,
  Globe,
  Mic,
  MoreHorizontal,
  Plus,
} from "lucide-react"
import { apiService, type Persona } from "@/services/api.service"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  value: string
  isLoading: boolean
  isConnecting: boolean
  isDisabled: boolean
  disabledReason?: string
  onValueChange: (value: string) => void
  onSubmit: () => void
}

export function ChatInput({
  value,
  isLoading,
  isConnecting,
  isDisabled,
  disabledReason,
  onValueChange,
  onSubmit,
}: ChatInputProps) {
  const [personas, setPersonas] = useState<Persona[]>([])
  const [isLoadingPersonas, setIsLoadingPersonas] = useState(true)
  const [showMentionMenu, setShowMentionMenu] = useState(false)
  const [mentionSearch, setMentionSearch] = useState("")
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Fetch personas on component mount
  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        setIsLoadingPersonas(true)
        const data = await apiService.getPersonas()
        setPersonas(data)
      } catch (error) {
        console.error('Error fetching personas:', error)
      } finally {
        setIsLoadingPersonas(false)
      }
    }

    fetchPersonas()
  }, [])

  // Filter personas based on search
  const filteredPersonas = personas.filter(persona =>
    persona.name.toLowerCase().includes(mentionSearch.toLowerCase())
  )

  // Handle input change and detect @ mention
  const handleInputChange = (newValue: string) => {
    onValueChange(newValue)

    // Check if user typed @
    const cursorPosition = inputRef.current?.selectionStart || 0
    const textBeforeCursor = newValue.slice(0, cursorPosition)
    const atMatch = textBeforeCursor.match(/@(\w*)$/)

    if (atMatch) {
      setMentionSearch(atMatch[1])
      setShowMentionMenu(true)
      setSelectedIndex(0)
      
      // Calculate position for mention menu (simplified)
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect()
        setMentionPosition({
          top: rect.top - 100, // Position above input
          left: rect.left
        })
      }
    } else {
      setShowMentionMenu(false)
      setMentionSearch("")
    }
  }

  // Insert mention into text
  const insertMention = (persona: Persona) => {
    const cursorPosition = inputRef.current?.selectionStart || 0
    const textBeforeCursor = value.slice(0, cursorPosition)
    const textAfterCursor = value.slice(cursorPosition)
    
    // Find the @ position
    const atPosition = textBeforeCursor.lastIndexOf('@')
    const beforeAt = value.slice(0, atPosition)
    const newValue = beforeAt + `@${persona.name} ` + textAfterCursor
    
    onValueChange(newValue)
    setShowMentionMenu(false)
    setMentionSearch("")
    
    // Focus back to input
    setTimeout(() => {
      inputRef.current?.focus()
      const newCursorPos = atPosition + persona.name.length + 2
      inputRef.current?.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  // Handle keyboard navigation in mention menu
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentionMenu && filteredPersonas.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => 
          prev < filteredPersonas.length - 1 ? prev + 1 : prev
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => prev > 0 ? prev - 1 : prev)
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        insertMention(filteredPersonas[selectedIndex])
        return
      } else if (e.key === 'Escape') {
        setShowMentionMenu(false)
        setMentionSearch("")
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className="bg-background z-10 shrink-0 px-3 pb-3 md:px-5 md:pb-5">
      <div className="mx-auto max-w-3xl">
        {isConnecting && (
          <div className="mb-2 text-sm text-muted-foreground flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
            <span>Connecting to server...</span>
          </div>
        )}
        
        {/* Mention Menu */}
        {showMentionMenu && (
          <div
            className="fixed z-50 min-w-[200px] max-w-[300px] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
            style={{
              top: mentionPosition.top,
              left: mentionPosition.left,
            }}
          >
            {isLoadingPersonas ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                Loading personas...
              </div>
            ) : filteredPersonas.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                No personas found
              </div>
            ) : (
              filteredPersonas.map((persona, index) => (
                <div
                  key={persona.id}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
                    index === selectedIndex
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => insertMention(persona)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{persona.name}</span>
                    {persona.description && (
                      <span className="text-xs text-muted-foreground">
                        {persona.description}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <PromptInput
          isLoading={isLoading}
          onSubmit={onSubmit}
          className="border-input bg-popover relative z-10 w-full rounded-3xl border p-0 pt-1 shadow-xs"
        >
          <div className="flex flex-col">
            <textarea
              ref={inputRef}
              value={value}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything (type @ to mention a persona)"
              className="min-h-[44px] w-full resize-none border-0 bg-transparent pt-3 pl-4 pr-4 text-base leading-[1.3] placeholder:text-muted-foreground focus-visible:outline-none sm:text-base md:text-base"
              rows={1}
              style={{
                height: 'auto',
                minHeight: '44px',
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = target.scrollHeight + 'px'
              }}
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
                  disabled={isDisabled}
                  onClick={onSubmit}
                  className="size-9 rounded-full"
                  title={disabledReason || (isLoading ? "Sending..." : "Send message")}
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
  )
}
