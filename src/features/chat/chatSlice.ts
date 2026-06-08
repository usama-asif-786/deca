import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ChatMessage } from '@/lib/mockData'

interface ChatState {
  messages: ChatMessage[]
  activeConvo: number
  isTyping: boolean
}

const initialState: ChatState = {
  messages: [],
  activeConvo: 0,
  isTyping: false,
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setMessages(state, action: PayloadAction<ChatMessage[]>) {
      state.messages = action.payload
    },
    addMessage(state, action: PayloadAction<ChatMessage>) {
      state.messages.push(action.payload)
    },
    setActiveConvo(state, action: PayloadAction<number>) {
      state.activeConvo = action.payload
    },
    setTyping(state, action: PayloadAction<boolean>) {
      state.isTyping = action.payload
    },
  },
})

export const { setMessages, addMessage, setActiveConvo, setTyping } = chatSlice.actions
export default chatSlice.reducer
