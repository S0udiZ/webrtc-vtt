<script lang="ts">
	import { onMount } from 'svelte';
	import { DevContext } from '$lib/context/dev/DevContext';
	import { writable } from 'svelte/store';

	let grid: HTMLCanvasElement;

	let localGrid: HTMLCanvasElement;

	type Object = {
		uuid: string;
		x: number;
		y: number;
		width: number;
		height: number;
		image: string;
        ringColor: string;
	};

	const localObject = writable({} as Object);

	let scale = 1;

	let squareSize: number;

	const objects = writable([
		{
			uuid: 'a7c59662-94fc-42da-ad1c-977b2027e5a7',
			x: 0,
			y: 0,
			width: 2,
			height: 2,
			image:
				'https://thumbs.dreamstime.com/b/male-avatar-icon-flat-style-male-user-icon-cartoon-man-avatar-hipster-vector-stock-91462914.jpg',
            ringColor: 'red'
		},
		{
			uuid: 'a447ae40-023f-4641-92d3-b6162960399b',
			x: 94,
			y: 94,
			width: 1,
			height: 1,
			image: 'https://static-00.iconduck.com/assets.00/user-avatar-icon-512x512-vufpcmdn.png',
            ringColor: 'blue'
		}
	] as Object[]);

	$: squareSize = 94 * scale;

	let mouse = {
		x: 0,
		y: 0,
		target: '',
		down: false,
		click: '0, 0'
	};

	// make a infinite grid of 94px squares (default) and where you are able to drag the grid around
	function makeGrid() {
		let width = grid.clientWidth;
		let height = grid.clientHeight;

		let ctx = grid.getContext('2d') as CanvasRenderingContext2D;

		ctx.canvas.width = width;
		ctx.canvas.height = height;

		let x = 0;
		let y = 0;

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

		let layers: HTMLImageElement[] = [];

		$objects.forEach((object) => {
			let layer = new Image() as HTMLImageElement;
			layer.src = object.image;
			layer.alt = object.uuid;
            layer.classList.add("rounded-full")
			layers.push(layer);
		});

		layers.forEach((layer, index) => {
			layer.onload = () => {
                // Slice the image into a circle
                const strokeWidth = 10;

                ctx.strokeStyle = $objects[index].ringColor;
                ctx.lineWidth = strokeWidth;

                ctx.drawImage(layer, $objects[index].x * scale, $objects[index].y * scale, $objects[index].width * squareSize, $objects[index].height * squareSize);
				ctx.beginPath();
                ctx.arc($objects[index].x * scale + $objects[index].width * squareSize / 2, $objects[index].y * scale + $objects[index].height * squareSize / 2, $objects[index].width * squareSize / 2 - (strokeWidth/2) + 1, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.closePath();
			};
		});
	}

	function makeLocalGrid() {
		let width = localGrid.clientWidth;
		let height = localGrid.clientHeight;

		let ctx = localGrid.getContext('2d') as CanvasRenderingContext2D;

		ctx.canvas.width = width;
		ctx.canvas.height = height;

		// Draw a rectangle with the size of the selected object on the local grid based on the mouse position
		ctx.beginPath();
		ctx.rect(mouse.x, mouse.y, $localObject.width * squareSize, $localObject.height * squareSize);
		ctx.stroke();
	}

	function clearLocalGrid() {
		let ctx = localGrid.getContext('2d') as CanvasRenderingContext2D;
		ctx.clearRect(0, 0, localGrid.width, localGrid.height);
	}

	function placeObject(x: number, y: number) {
		// Place the object on the grid based on the mouse position and update the objects array
		objects.update((objects) => {
			let index = objects.findIndex((object) => object.uuid === $localObject.uuid);
			objects[index].x = x / scale;
			objects[index].y = y / scale;
			return objects;
		});
		makeGrid();
	}

	function setMouseCordinates(event: MouseEvent) {
		mouse.x = event.clientX;
		mouse.y = event.clientY;

		DevContext.set({ ...DevContext, mouse });

		if (mouse.down && $localObject.uuid) {
			makeLocalGrid();
		}
	}

	function selectTarget(event: MouseEvent) {
		let ctx = grid.getContext('2d');
		let x = Math.floor(mouse.x / squareSize) * squareSize;
		let y = Math.floor(mouse.y / squareSize) * squareSize;

		mouse.down = true;
		const target =
			$objects.find((object) => {
				if (object.x * scale === x && object.y * scale === y) {
					return object;
				}
				return;
			}) || ({} as Object);
		if (target.uuid) {
			mouse.target = target.uuid;
			localObject.set(target);
		}
	}

	function releseTarget(event: MouseEvent) {
		let ctx = grid.getContext('2d');
		let x = Math.floor(mouse.x / squareSize) * squareSize;
		let y = Math.floor(mouse.y / squareSize) * squareSize;

		mouse.down = false;
		if ($localObject.uuid) {
			placeObject(x, y);
			mouse.target = '';
			localObject.set({} as Object);
		}
		clearLocalGrid();
	}

	function handleClick(event: MouseEvent) {
		let ctx = grid.getContext('2d');
		let x = Math.floor(mouse.x / squareSize) * squareSize;
		let y = Math.floor(mouse.y / squareSize) * squareSize;

		mouse.click = `${x}, ${y}`;

		DevContext.set({ ...DevContext, mouse });
	}

	function handleMouseWheel(event: WheelEvent) {
		let ctx = grid.getContext('2d') as CanvasRenderingContext2D;
		let x = Math.floor(mouse.x / squareSize) * squareSize;
		let y = Math.floor(mouse.y / squareSize) * squareSize;

		if (scale <= 0.2 && event.deltaY > 0) return;
		if (scale >= 3 && event.deltaY < 0) return;

		if (event.deltaY < 0) {
			scale += 0.1;
		} else {
			scale -= 0.1;
		}

		setTimeout(() => {
			makeGrid();
		}, 0);
	}

	onMount(() => {
		makeGrid();
	});
</script>

<div class="relative h-full">
	<canvas
		class="w-full h-full"
		bind:this={grid}
		on:pointermove={setMouseCordinates}
		on:pointerdown={selectTarget}
		on:pointerup={releseTarget}
		on:click={handleClick}
		on:mousewheel={handleMouseWheel}
	/>
	<canvas bind:this={localGrid} class="absolute w-full h-full top-0 pointer-events-none" />
	<p
		class="absolute top-1 right-1 z-10 border border-primary-500 p-1 px-2 bg-white rounded-full pointer-events-none"
	>
		Scale: {scale.toFixed(2)}
	</p>
</div>

<style lang="scss">
</style>
