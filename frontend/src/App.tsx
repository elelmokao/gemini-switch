import { ThemeProvider } from "./components/theme-provider"
import { ChatContent } from "./components/chat-content"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Layout from "./layout"
import PersonaManagePage from "./components/persona-manage-page"

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<ChatContent />} />
            <Route path="/personas" element={<PersonaManagePage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App