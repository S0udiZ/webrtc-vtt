import { writable } from 'svelte/store';

export const DevContext = writable({
	mouse: {
		x: 0,
		y: 0,
		target: "",
		down: false,
        click: "0, 0",
	}
});
