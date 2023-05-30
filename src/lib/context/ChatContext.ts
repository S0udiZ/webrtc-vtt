import { writable } from "svelte/store";
import type { ChatMessage } from "../types/ChatMessage";

export const ChatMessages = writable<ChatMessage[]>([]);