export function EmptyState() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center max-w-md mx-auto">
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          Welcome to Gemini Switch
        </h2>
        <p className="text-muted-foreground mb-8">
          Start a conversation by typing your message below. I'm here to help with any questions or tasks you have.
        </p>
      </div>
    </div>
  )
}
