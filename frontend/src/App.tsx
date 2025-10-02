import { ThemeProvider } from "./components/theme-provider"
import { ChatBasic } from "./components/chat-container"


function App() {
  return (
    <ThemeProvider>
      <ChatBasic></ChatBasic>
    </ThemeProvider>
  )
}

export default App