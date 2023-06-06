<script lang="ts">
	import { onMount } from 'svelte';
	import { DevContext } from '$lib/context/dev/DevContext';
	import { writable } from 'svelte/store';

	import { GridContext } from '$lib/context/GridContext';
	import { TokensContext } from '$lib/context/TokensContext';
	import type { Token } from '$lib/types/Tokens';

	// Elements
	let grid: HTMLCanvasElement;

	let localGrid: HTMLCanvasElement;

	$: console.log($TokensContext);

	// Types
	type Object = {
		uuid: string;
		x: number;
		y: number;
		width: number;
		height: number;
		image: string;
		ringColor: string;
	};

	// Variables / Stores
	const localObject = writable({} as Object);

	let squareSize: number;

	$: squareSize = 94 * $GridContext.scale;

	let mouse = {
		x: 0,
		y: 0,
		target: '',
		down: false,
		click: '0, 0',
		onGrid: false
	};

	let shift = { x: 0, y: 0 };

	let lastMouse = { x: 0, y: 0 };

	// Functions
	// make a infinite grid of 94px squares (default) and where you are able to drag the grid around
	function makeGrid() {
		let width = grid.clientWidth;
		let height = grid.clientHeight;

		GridContext.update((grid) => {
			grid.grid.width = width;
			grid.grid.height = height;
			return grid;
		});

		let ctx = grid.getContext('2d') as CanvasRenderingContext2D;

		ctx.canvas.width = width;
		ctx.canvas.height = height;

		let layers: HTMLImageElement[] = [];

		$TokensContext.forEach((object) => {
			let layer = new Image() as HTMLImageElement;
			layer.src = object.image;
			layer.alt = object.uuid;
			layers.push(layer);
		});

		layers.forEach((layer, index) => {
			layer.onload = () => {
				const strokeWidth = 10 * $GridContext.scale;

				ctx.strokeStyle = $TokensContext[index].ringColor;
				ctx.lineWidth = strokeWidth;

				ctx.drawImage(
					layer,
					$TokensContext[index].x * squareSize + shift.x,
					$TokensContext[index].y * squareSize + shift.y,
					$TokensContext[index].width * squareSize,
					$TokensContext[index].height * squareSize
				);
				ctx.beginPath();
				// draw a circle around the image
				ctx.arc(
					$TokensContext[index].x * squareSize +
						($TokensContext[index].width * squareSize) / 2 +
						shift.x,
					$TokensContext[index].y * squareSize +
						($TokensContext[index].height * squareSize) / 2 +
						shift.y,
					($TokensContext[index].width * squareSize) / 2 - strokeWidth / 2 + 1,
					0,
					2 * Math.PI
				);
				ctx.stroke();
				ctx.closePath();
			};
			makeLocalGrid();
		});
	}

	function makeLocalGrid() {
		let width = localGrid.clientWidth;
		let height = localGrid.clientHeight;

		let ctx = localGrid.getContext('2d') as CanvasRenderingContext2D;

		ctx.canvas.width = width;
		ctx.canvas.height = height;

		let x = 0 + shift.x;
		let y = 0 + shift.y;

		while (x < width) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, height);
			ctx.stroke();
			x += squareSize;
		}

		while (y < height) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(width, y);
			ctx.stroke();
			y += squareSize;
		}

		if ($localObject.uuid) {
			// Draw a rectangle with the size of the selected object on the local grid based on the mouse position
			ctx.beginPath();
			ctx.rect(
				mouse.x - ($localObject.width * squareSize) / 2,
				mouse.y - ($localObject.height * squareSize) / 2,
				$localObject.width * squareSize,
				$localObject.height * squareSize
			);
			ctx.stroke();
		}
	}

	function placeObject(x: number, y: number) {
		// Place the object on the grid based on the mouse position and update the objects array
		TokensContext.update((objects) => {
			let index = objects.findIndex((object) => object.uuid === $localObject.uuid);
			objects[index].x = Math.round(x / $GridContext.scale - objects[index].width / 2);
			objects[index].y = Math.round(y / $GridContext.scale - objects[index].width / 2);
			return objects;
		});
		makeGrid();
	}

	function UpdateGrid(x: Token[]) {
		if (grid) {
			makeGrid();
			makeLocalGrid();
		}
		console.log(x);
	}

	$: UpdateGrid($TokensContext);

	function setMouseCordinates(event: MouseEvent) {
		mouse.x = event.clientX;
		mouse.y = event.clientY;

		DevContext.update((DevContext) => {
			DevContext.mouse = mouse;
			return DevContext;
		});

		GridContext.update((GridContext) => {
			GridContext.mouse = mouse;
			return GridContext;
		});

		if (mouse.down && $localObject.uuid) {
			makeLocalGrid();
		} else if (mouse.down && mouse.target === 'grid') {
			// Set the shift of the grid based on the mouse movement
			if (lastMouse.x > mouse.x) {
				shift.x -= lastMouse.x - mouse.x;
			} else {
				shift.x += mouse.x - lastMouse.x;
			}
			if (lastMouse.y > mouse.y) {
				shift.y -= lastMouse.y - mouse.y;
			} else {
				shift.y += mouse.y - lastMouse.y;
			}

			// Set the shift of the grid to 0 if it goes out of bounds
			if (shift.x > 0) {
				shift.x = 0;
			}
			if (shift.y > 0) {
				shift.y = 0;
			}
			DevContext.update((DevContext) => {
				DevContext.shift = shift;
				return DevContext;
			});
			if (shift.x != 0 || shift.y != 0) {
				requestAnimationFrame(makeGrid);
				requestAnimationFrame(makeLocalGrid);
			}
		}
		lastMouse = { x: mouse.x, y: mouse.y };
		DevContext.update((DevContext) => {
			DevContext.lastMouse = lastMouse;
			return DevContext;
		});
	}

	function selectTarget(event: MouseEvent) {
		let x = Math.floor(mouse.x / squareSize - shift.x / squareSize);
		let y = Math.floor(mouse.y / squareSize - shift.y / squareSize);

		mouse.down = true;
		const target =
			$TokensContext.find((object) => {
				// returns the object if the mouse is between or eaqual to object postition and object posisition + object.width for both x and y
				if (object.x <= x && object.x + object.width > x && object.y <= y && object.y + object.height > y) {
					return object;
				}
				// Old code that only returns the object if the mouse is on the top left corner of the object
				// if (object.x === x && object.y === y) {
				// 	return object;
				// }
				return;
			}) || ({} as Object);
		if (target.uuid) {
			mouse.target = target.uuid;
			localObject.set(target);
		} else {
			mouse.target = 'grid';
		}
	}

	function releseTarget(event: MouseEvent) {
		let x = Math.floor(mouse.x / squareSize - shift.x / squareSize) * $GridContext.scale;
		let y = Math.floor(mouse.y / squareSize - shift.y / squareSize) * $GridContext.scale;

		mouse.down = false;
		if ($localObject.uuid) {
			placeObject(x, y);
			DevContext.update((DevContext) => {
				DevContext.objects.find((object) => {
					if (object.uuid === $localObject.uuid) {
						object.x = Math.floor(x / $GridContext.scale);
						object.y = Math.floor(y / $GridContext.scale);
						return object;
					} else return object;
				});
				return DevContext;
			});
			mouse.target = '';
			localObject.set({} as Object);
		} else {
			mouse.target = '';
		}
		makeLocalGrid();
	}

	function handleClick(event: MouseEvent) {
		// Get the mouse position and update the mouse object
		let x = Math.floor(mouse.x / squareSize);
		let y = Math.floor(mouse.y / squareSize);

		mouse.click = `${x + Math.floor((shift.x * -1) / (squareSize * $GridContext.scale))}, ${
			y + Math.floor((shift.y * -1) / (squareSize * $GridContext.scale))
		}`;
		DevContext.update((DevContext) => {
			DevContext.mouse = mouse;
			return DevContext;
		});
	}

	function handleMouseWheel(event: WheelEvent) {
		// Zoom in and out via mouse wheel and update the scale
		if ($GridContext.scale <= 0.2 && event.deltaY > 0) return;
		if ($GridContext.scale >= 3 && event.deltaY < 0) return;

		if (event.deltaY < 0) {
			$GridContext.scale += 0.1;
		} else {
			$GridContext.scale -= 0.1;
		}

		setTimeout(() => {
			makeGrid();
		}, 0);
	}

	function handleMouseLeave(event: MouseEvent) {
		releseTarget(event);
	}

	onMount(() => {
		DevContext.update((DevContext) => {
			DevContext.objects = $TokensContext;
			return DevContext;
		});
		makeGrid();
	});
</script>

<div class="relative overflow-hidden h-screen">
	<canvas
		class="w-full h-full"
		bind:this={grid}
		on:pointermove={setMouseCordinates}
		on:pointerdown={selectTarget}
		on:pointerup={releseTarget}
		on:click={handleClick}
		on:mousewheel={handleMouseWheel}
		on:mouseleave={handleMouseLeave}
	/>
	<canvas bind:this={localGrid} class="absolute w-full h-full top-0 pointer-events-none" />
	<p
		class="absolute top-1 right-1 z-10 border border-primary-500 p-1 px-2 bg-white rounded-full pointer-events-none"
	>
		Scale: {$GridContext.scale.toFixed(2)}
	</p>
</div>

<style lang="scss">
</style>
