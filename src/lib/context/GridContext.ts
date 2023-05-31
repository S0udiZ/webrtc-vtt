import { writable } from "svelte/store";
import type { Writable } from "svelte/store";

export const GridContext = writable({
    mouse: {
        x: 0,
        y: 0,
        target: "",
        down: false,
        click: "0, 0",
        onGrid: false
    },
    shift: {
        x: 0,
        y: 0
    },
    scale: 1,
    grid: {
        width: 0,
        height: 0,
    }
});
