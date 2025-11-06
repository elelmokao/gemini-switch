import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input"
import { Button } from "@/components/ui/button"
import {
  ArrowUp,
  Globe,
  Mic,
  MoreHorizontal,
  Plus,
} from "lucide-react"

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
  return (
    <div className="bg-background z-10 shrink-0 px-3 pb-3 md:px-5 md:pb-5">
      <div className="mx-auto max-w-3xl">
        {isConnecting && (
          <div className="mb-2 text-sm text-muted-foreground flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
            <span>Connecting to server...</span>
          </div>
        )}
        <PromptInput
          isLoading={isLoading}
          value={value}
          onValueChange={onValueChange}
          onSubmit={onSubmit}
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
