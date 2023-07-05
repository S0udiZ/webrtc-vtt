import type { Token } from "$lib/types/Tokens";
import { writable } from "svelte/store";

export const ContextMenuToken = writable({
    x: 0,
    y: 0,
    token: {} as Token | null,
    flipped: false
})