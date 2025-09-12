<template>
  <div class="chat-room">
    <div class="chat-header">
      <h2>Chat Header</h2>
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
      />
      <button @click="sendMessage">Send</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { marked } from 'marked';

interface ChatMessage {
  text: string;
  type: 'send' | 'receive';
}

const inputText = ref('');
const messages = ref<ChatMessage[]>([]);

async function sendMessage() {
  const text = inputText.value.trim();
  if (text) {
    messages.value.push({ text, type: 'send' });
    inputText.value = '';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超時

      const response = await fetch('http://localhost:3000/gemini/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text.toString() }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok || !response.body) {
        throw new Error('Network response was not ok');
      }

      // 新增一個空訊息，之後逐步填充
      const receiveMsg = { text: '', type: 'receive' as const };
      messages.value.push(receiveMsg);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let buffer = '';

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        if (value) {
          buffer += decoder.decode(value, { stream: !streamDone });
          try {
            // 嘗試解析最新的 JSON
            const data = JSON.parse(buffer);
            if (typeof data.text === 'string') {
              receiveMsg.text = data.text;
              messages.value = [...messages.value]; // 強制刷新
              buffer = ''; // 清空 buffer
            }
          } catch (e) {
            // 尚未接收完整 JSON，繼續累積
          }
        }
        done = streamDone;
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // 請求被手動中止，不顯示錯誤訊息
        return;
      }
      console.error('Error sending message:', error);
      messages.value.push({ text: 'Error: Unable to send message.', type: 'receive' });
    }
  }
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
