// dto of chatroom_messages
export interface ChatroomMessagesDto {
  chatroom_id: string;
  role: string;
  content: string;
  persona_id?: string | null;
}
