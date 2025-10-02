import { ThemeProvider } from "./components/theme-provider"
import { ChatContent } from "./components/chat-content"

function App() {
  return (
    <ThemeProvider>
      <ChatContent />
    </ThemeProvider>
  )
}

export default App