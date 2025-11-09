
# GeminiSwitch

GeminiSwitch is designed for users needing a chat application with multiple agents and API key rotation. It enables you to define your own expert agents (personas) and interact with them within a single chatroom, providing agent-level expertise. The application also supports rotation and management of multiple API keys.


## Feature Highlights
* Support for multiple expert agents (personas) in a chatroom
* Customizable agents, each with their own Gemini Model
* Switchable API keys for chatrooms without losing chat history
* [WIP] Limit monitoring for each API key
* [WIP] Memo system for personas
* [WIP] A RAG system for agents


## Tech Stack

**Frontend**
- React with TypeScript & Vite
- UI: Tailwind CSS, Shadcn, Radix UI

**Backend**
- NestJS (TypeScript)
- TypeORM (ORM)
- PostgreSQL
- Socket.io (real-time communication)
