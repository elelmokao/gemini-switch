<template>
  <div class="chat-room">
    <div class="chat-header">
      <h2 style="margin: 0;">Chat Header</h2>
      <select v-model="selectedModel">
      <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
      <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
      </select>
    </div>
    <div class="chat-messages">
      <div
        v-for="(msg, idx) in messages"
        :key="idx"
        :class="msg.type === 'send' ? 'chat-send-message' : 'chat-receive-message'"
      >
        <template v-if="msg.type === 'receive'">
          <div v-html="marked(msg.text)"></div>
        </template>
        <template v-else>
          {{ msg.text }}
        </template>
      </div>
    </div>
    <div class="chat-input">
      <input
        type="text"
        placeholder="Type your message..."
        v-model="inputText"
        @keyup.enter="sendMessage"
        :disabled="isStreaming" />
      <button @click="sendMessage" :disabled="isStreaming"> {{ isStreaming ? '...' : 'Send' }} </button>
</div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { marked } from 'marked';
import { io, Socket } from 'socket.io-client';


interface ChatMessage {
  text: string;
  type: 'send' | 'receive';
}

const inputText = ref('');
const messages = ref<ChatMessage[]>([]);
const isStreaming = ref(false);
const selectedModel = ref('gemini-2.0-flash');

let socket: Socket;

onMounted(() => {
  socket = io('http://localhost:3000', {
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('Connected to server. Socket ID:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from server. Reason: ', socket.disconnected);
  });

  socket.on('new_chunk', (data: { text: string}) => {
    if (messages.value.length > 0) {
      const lastMessage = messages.value[messages.value.length - 1];
      if (lastMessage.type === 'receive') {
        lastMessage.text += data.text;
      }
    }
  })

socket.on('stream_end', () => {
    isStreaming.value = false;
  });

socket.on('steram_error', (data: { message: string}) => {
  console.error('Socket error:', data.message);
  messages.value.push({
    text: `Error: ${data.message}`,
    type: 'receive',
  });
  isStreaming.value = false;
});

});
onUnmounted(() => {
  if (socket) {
    socket.disconnect();
  }
});


async function sendMessage() {
  const text = inputText.value.trim();
  if (!text || !socket || isStreaming.value) {
    return;
  }

  isStreaming.value = true;

  // turn historical msgs to Gemini Content[]
  const historyForApi = messages.value
    .filter(msg => msg.text && msg.text.trim() !== '')
    .map(msg => ({
      role: msg.type === 'send' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));
  messages.value.push({ text, type: 'send' });
  inputText.value = '';

  messages.value.push({ text: '', type: 'receive' });

  socket.emit('chat', {
    prompt: text,
    history: historyForApi,
    model: selectedModel.value,
  });
}
</script>

<style scoped>
.chat-room {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.chat-header {
  flex-shrink: 0;
  padding: 16px;
  border-bottom: 1px solid #eee;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.chat-messages {
  flex: 1 1 0;
  min-height: 0;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
}
.chat-input {
  flex-shrink: 0;
  display: flex;
  border-top: 1px solid #eee;
  padding: 16px;
  gap: 8px;
}
.chat-input input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.chat-input button {
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.chat-input button:hover {
  background-color: #0056b3;
}
.chat-send-message {
  margin-bottom: 8px;
  padding: 8px 12px;
  background: #8b8b8b;
  color: #fff;
  border-radius: 16px 16px 16px 4px;
  max-width: 70%;
  min-width: 40px;
  display: inline-block;
  word-break: break-word;
  align-self: flex-start;
  text-align: right;
  width: fit-content;
}
.chat-receive-message {
  margin-bottom: 8px;
  padding: 8px 12px;
  background: #e0e0e0;
  color: #222;
  border-radius: 16px 16px 4px 16px;
  max-width: 70%;
  min-width: 40px;
  display: inline-block;
  word-break: break-word;
  align-self: flex-end;
  text-align: left;
  width: fit-content;
}
</style>
