<script lang="ts">
	import { TokensContext } from '$lib/context/TokensContext';
	import { localStorageStore, popup, toastStore } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import type { Writable } from 'svelte/store';
	import type { PopupSettings, ToastSettings } from '@skeletonlabs/skeleton';

	import type { Token } from '$lib/types/Tokens';
	import { GridContext } from '$lib/context/GridContext';
	import { ContextMenuToken } from '$lib/context/ContextMenuToken';

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

	let transparent: boolean = false;

	let selectedRingColor: string;
	let imageValue: string;
	let size = { w: 1, h: 1 };

	let selectedToken: TokenLibraryToken;

	let popupSettings: PopupSettings = {
		event: 'click',
		target: 'TokenMenu',
		placement: 'right'
	}

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
			ringColor: transparent ? 'transparent' : selectedRingColor,
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
		ContextMenuToken.set({
			x: event.clientX,
			y: event.clientY,
			token: null,
			flipped: false
		})
		if (event.target instanceof HTMLImageElement && event.button === 0) {
			selectedToken = JSON.parse($TokenLibrary).find(
				// @ts-ignore - event target is an image element and not null
				(token: TokenLibraryToken) => token.id === event.target.alt
			);
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

function handleContextMenu(event: MouseEvent, token: Token) {
		let x = event.clientX;
		let y = event.clientY;
		let flipped = false;

		if (x + 200 > window.innerWidth) {
			flipped = true;
		}

		ContextMenuToken.set({
			x,
			y,
			token,
			flipped
		});
	}

	onMount(() => {
		if (!$TokenLibrary) {
			TokenLibrary.set('[]');
		}
	});
</script>

<div>
	<button class="btn variant-filled-primary" on:click={handleUploadButton}>Upload</button>
	<div class="grid grid-cols-3 p-2 w-full h-full overflow-scroll" on:pointerdown={handleMouseDown}>
		{#each JSON.parse($TokenLibrary) as token}
			<figure
				class="relative mx-auto aspect-square col-span-1"
				on:contextmenu|preventDefault={(event) => {handleContextMenu(event, token)}}
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
		<label><input type="color" bind:value={selectedRingColor} /><input type="checkbox" bind:checked={transparent}>: Transparent</label>
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
