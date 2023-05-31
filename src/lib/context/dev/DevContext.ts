import { writable } from 'svelte/store';

export const DevContext = writable({
	mouse: {
		x: 0,
		y: 0,
		target: "",
		down: false,
        click: "0, 0",
		onGrid: false,
	},
	objects: [
		{
			uuid: "",
			x: 0,
			y: 0,
			width: 0,
			height: 0,
			image: "",
			ringColor: "",
		}
	],
	shift: {
		x: 0,
		y: 0
	},
	lastMouse: {
		x: 0,
		y: 0
	}
});
