import { SidebarTrigger } from "@/components/ui/sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import type { ApiKey } from "@/services/api.service"

interface ChatHeaderProps {
  title: string
  isConnecting: boolean
  socketConnected: boolean
  apiKeys: ApiKey[]
  selectedApiKey: string
  isLoadingApiKeys: boolean
  onApiKeyChange: (value: string) => void
  onRefreshApiKeys: () => void
}

export function ChatHeader({
  title,
  isConnecting,
  socketConnected,
  apiKeys,
  selectedApiKey,
  isLoadingApiKeys,
  onApiKeyChange,
  onRefreshApiKeys,
}: ChatHeaderProps) {
  return (
    <header className="bg-background z-10 flex h-16 w-full shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <div className="text-foreground">{title}</div>
      {(isConnecting || !socketConnected) && (
        <div className="text-sm text-muted-foreground">
          {isConnecting ? "Connecting..." : "Disconnected"}
        </div>
      )}
      <div className="ml-auto flex items-center gap-2">
        <Select value={selectedApiKey} onValueChange={onApiKeyChange}>
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
          onClick={onRefreshApiKeys}
          disabled={isLoadingApiKeys}
          className="h-10 w-10"
          title="Reload API keys"
        >
          <RefreshCw className={`h-4 w-4 ${isLoadingApiKeys ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </header>
  )
}
