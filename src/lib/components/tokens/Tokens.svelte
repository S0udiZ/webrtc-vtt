<script lang="ts">
	import { TokensContext } from '$lib/context/TokensContext';
	import { DevContext } from '$lib/context/dev/DevContext';
	import { localStorageStore, toastStore } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import type { Writable } from 'svelte/store';
	import type { ToastSettings } from '@skeletonlabs/skeleton';

	import type { Token } from '$lib/types/Tokens';
	import { GridContext } from '$lib/context/GridContext';

	type TokenLibraryToken = {
		id: string;
		image: string;
		ringColor: string;
		width: number;
		height: number;
	};

	let squareSize: number;
	$: squareSize = 94 * $GridContext.scale;

	let createTokenDialog: HTMLDialogElement;

	const TokenLibrary: Writable<string> = localStorageStore('TokenLibrary', '[]');

	const ringColorOptions: Record<string, string> = {
		red: 'red',
		blue: 'blue',
		green: 'green',
		yellow: 'yellow',
		purple: 'purple',
		pink: 'pink',
		indigo: 'indigo',
		gray: 'gray',
		black: 'black',
		white: 'white',
		none: 'transparent'
	};

	let selectedRingColor: string;
	let imageValue: string;
	let size = { w: 1, h: 1 };

	let selectedToken: TokenLibraryToken;

	function handleUploadButton() {
		createTokenDialog.showModal();
	}

	function handleTokenUpload() {
		if (!imageValue) {
			const t: ToastSettings = {
				message: 'Please enter an image link',
				timeout: 5000,
				background: 'variant-filled-error'
			};
			toastStore.trigger(t);
			return;
		}

		if (selectedRingColor === 'undefined') {
			const t: ToastSettings = {
				message: 'Please select a ring color',
				timeout: 5000,
				background: 'variant-filled-error'
			};
			toastStore.trigger(t);
			return;
		}

		const token: TokenLibraryToken = {
			id: crypto.randomUUID().toString(),
			image: imageValue,
			ringColor: ringColorOptions[selectedRingColor],
			width: size.w,
			height: size.h
		};

		try {
			TokenLibrary.update((tokens) => {
				const newTokens = [...JSON.parse(tokens), token];
				return JSON.stringify(newTokens);
			});
			createTokenDialog.close();
			selectedRingColor = 'undefined';
			imageValue = '';
			size = { w: 1, h: 1 };
		} catch (error) {
			const t: ToastSettings = {
				message: 'Something went wrong',
				timeout: 5000,
				background: 'variant-filled-error'
			};
			toastStore.trigger(t);
		}
	}

	function handleMouseDown(event: MouseEvent) {
		if (event.target instanceof HTMLImageElement) {
			selectedToken = JSON.parse($TokenLibrary).find(
				// @ts-ignore - event target is an image element and not null
				(token: TokenLibraryToken) => token.id === event.target.alt
			);
			console.table(selectedToken);
		}
	}

	function handleMouseUp(event: MouseEvent) {
		if ($GridContext.mouse.onGrid) {
			const token: Token = {
				uuid: crypto.randomUUID().toString(),
				image: selectedToken.image,
				ringColor: selectedToken.ringColor,
				width: selectedToken.width,
				height: selectedToken.height,
				x: Math.round(
					$GridContext.mouse.x / squareSize -
						($GridContext.shift.x / squareSize) * $GridContext.scale -
						selectedToken.width / 2
				),
				y: Math.round(
					$GridContext.mouse.y / squareSize -
						($GridContext.shift.y / squareSize) * $GridContext.scale -
						selectedToken.width / 2
				)
			};
			console.log(token);
			TokensContext.update((tokens) => [...tokens, token]);
		}

		selectedToken = {} as TokenLibraryToken;
	}

	function handleMouseCordinates(event: MouseEvent) {
		$GridContext.mouse.x = event.clientX;
		$GridContext.mouse.y = event.clientY;

		if (
			$GridContext.mouse.x <= $GridContext.grid.width &&
			$GridContext.mouse.y <= $GridContext.grid.height
		) {
			$GridContext.mouse.onGrid = true;
		} else {
			$GridContext.mouse.onGrid = false;
		}
	}

	onMount(() => {
		if (!$TokenLibrary) {
			TokenLibrary.set('[]');
		}
	});
</script>

<div>
	<button class="btn variant-filled-primary" on:click={handleUploadButton}>Upload</button>
	<div class="grid grid-cols-3 p-2 w-full h-full" on:pointerdown={handleMouseDown}>
		{#each JSON.parse($TokenLibrary) as token}
			<figure
				class="relative mx-auto aspect-square"
				style="grid-column: span {token.width} / span {token.width}; grid-row: span {token.height} / span {token.heigth}"
			>
				<img class="w-full" src={token.image} alt={token.id} />
				<div
					class="absolute inset-0 border-8 rounded-full pointer-events-none"
					style="border-color: {token.ringColor}"
				/>
			</figure>
		{/each}
	</div>
	<div
		on:pointerup={handleMouseUp}
		on:pointermove={handleMouseCordinates}
		class="fixed inset-0 grid"
		style="pointer-events: {selectedToken?.id ? 'auto' : 'none'};
		grid-template-columns: repeat(auto-fill, {squareSize}px);"
	>
		{#if selectedToken?.id}
			<figure
				class="aspect-square pointer-events-none"
				style="transform: translate({$GridContext.mouse.x -
					(selectedToken.width * squareSize) / 2}px, {$GridContext.mouse.y -
					(selectedToken.width * squareSize) / 2}px); 
					grid-column: span {selectedToken.width} / span {selectedToken.width};"
			>
				<img class="w-full" src={selectedToken.image} alt={selectedToken.id} />
				<div
					class="absolute inset-0 border-8 rounded-full pointer-events-none"
					style="border-color: {selectedToken.ringColor}"
				/>
			</figure>
		{/if}
	</div>
</div>
<dialog bind:this={createTokenDialog}>
	<form on:submit|preventDefault={handleTokenUpload}>
		<input
			class="input p-2"
			type="text"
			name="image"
			placeholder="Image link"
			required
			bind:value={imageValue}
		/>
		<select bind:value={selectedRingColor}>
			<option value="undefined" selected>select ring color</option>
			{#each Object.keys(ringColorOptions) as color}
				<option value={color}>{color}</option>
			{/each}
		</select>
		<label>
			width
			<input type="number" bind:value={size.w} />
		</label>
		<label>
			height
			<input type="number" bind:value={size.h} />
		</label>
		<button type="submit" class="btn variant-filled-primary">Upload</button>
		<button type="button" on:click={() => createTokenDialog.close()}>Close</button>
	</form>
</dialog>
