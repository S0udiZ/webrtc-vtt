import { writable } from "svelte/store";
import type { Writable } from "svelte/store";
import type { Token } from "$lib/types/Tokens";

export const TokensContext: Writable<Token[]> = writable([] as Token[]);