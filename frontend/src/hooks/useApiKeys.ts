import { useState, useCallback, useEffect } from 'react'
import { apiService, type ApiKey } from '@/services/api.service'

export function useApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [selectedApiKey, setSelectedApiKey] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchApiKeys = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const apiKeysData = await apiService.getApiKeys()
      setApiKeys(apiKeysData)
      
      // Set the first API key as selected by default if available
      if (apiKeysData.length > 0 && !selectedApiKey) {
        setSelectedApiKey(apiKeysData[0].api_key)
      }
    } catch (err) {
      console.error('Error fetching API keys:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load API keys'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [selectedApiKey])

  // Fetch API keys when hook is first used
  useEffect(() => {
    fetchApiKeys()
  }, [fetchApiKeys])

  return {
    apiKeys,
    selectedApiKey,
    setSelectedApiKey,
    isLoading,
    error,
    refetch: fetchApiKeys,
  }
}
