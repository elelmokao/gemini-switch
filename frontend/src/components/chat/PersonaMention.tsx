import React from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import type { Persona } from "@/services/api.service"

interface PersonaMentionProps {
  children: React.ReactNode
  persona: Persona
}

export function PersonaMention({ children, persona }: PersonaMentionProps) {
  const isString = typeof children === "string"
  
  // If children has other children, return early
  if (!isString) {
    return children
  }

  const fallback = persona.name.substring(0, 2).toUpperCase()

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <span className="inline-flex items-center rounded bg-blue-100 px-1 text-blue-900 dark:bg-blue-900 dark:text-blue-100 cursor-pointer">
          {children}
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="max-w-xs w-auto">
        <div className="flex justify-between space-x-4">
          <Avatar>
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">{persona.name}</h4>
            {persona.description && (
              <p className="text-sm">{persona.description}</p>
            )}
            <div className="text-xs text-muted-foreground">
              Model: {persona.model_used}
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
