<script lang="ts">
	import type { Token } from '$lib/types/Tokens';
	import { TokensContext } from '$lib/context/TokensContext';
	import { ContextMenuToken } from '$lib/context/ContextMenuToken';
	import { GridContext } from '$lib/context/GridContext';
	export let user: string;

	let squareSize: number;
	$: squareSize = 94 * $GridContext.scale;

	let square: boolean;
	$: handleDimensions(
		$ContextMenuToken.token?.width as number,
		$ContextMenuToken.token?.height as number
	);

	let layer: number;
	let length: number;
    let transparent: boolean;
	$: handleTokenUpdate($ContextMenuToken.token as Token);

	function handleDimensions(width: number, height: number) {
		if ($ContextMenuToken.token === undefined || $ContextMenuToken.token === null) return;
		if (square) {
			$ContextMenuToken.token.height = width;
		}
	}

	function handleTokenUpdate(token: Token) {
		if (token === undefined || token === null) return;
		if (token.width === token.height) {
			square = true;
		} else {
			square = false;
		}
		layer = $TokensContext.findIndex((t) => t.uuid === token.uuid);
		length = $TokensContext.length - 1;
        if (token.ringColor === 'transparent') {
            transparent = true;
        } else {
            transparent = false;
        }
	}

	function handleLayerDown() {
        // Update the token to be 1 layer down
        if (layer == length) return;
		TokensContext.update((tokens) => {
            let temp = tokens[layer];
            tokens[layer] = tokens[layer + 1];
            tokens[layer + 1] = temp;
			return tokens;
		});
		layer = $TokensContext.findIndex((t) => t.uuid === $ContextMenuToken.token?.uuid);
	}

	function handleLayerUp() {
        // Update the token to be 1 layer up
        if (layer == 0) return;
        TokensContext.update((tokens) => {
            let temp = tokens[layer];
            tokens[layer] = tokens[layer - 1];
            tokens[layer - 1] = temp;
            return tokens;
        });
		layer = $TokensContext.findIndex((t) => t.uuid === $ContextMenuToken.token?.uuid);
	}

	function handleTokenChange() {
        if (transparent) {
            // Can't be null since you run this with a token selected
            $ContextMenuToken.token.ringColor = 'transparent';
        }
		TokensContext.update((tokens) => {
			const index = tokens.findIndex((token) => token.uuid === $ContextMenuToken.token?.uuid);
			tokens[index] = $ContextMenuToken.token as Token;
			return tokens;
		});
	}

	function handleDelete() {
		TokensContext.update((tokens) => {
			const index = tokens.findIndex((token) => token.uuid === $ContextMenuToken.token?.uuid);
			if (index === -1) return tokens;
			tokens.splice(index, 1);
			return tokens;
		});
	}
</script>

{#if $ContextMenuToken.token && user === 'DM'}
	<div
		class="fixed card border border-secondary-500 z-[9999]"
		style="
    {$ContextMenuToken.flipped
			? `top: ${$ContextMenuToken.y}px; right: ${window.innerWidth - $ContextMenuToken.x}px;`
			: `top: ${$ContextMenuToken.y}px;
    left: ${$ContextMenuToken.x}px;`}"
	>
		<div class="flex justify-between">
			{user}
			<span
				><button on:click={handleDelete}>🗑️</button><button on:click={handleLayerUp}
					>⬆️{layer}</button
				><button on:click={handleLayerDown}>⬇️{length}</button></span
			>
		</div>
		<form class="flex flex-col gap-1 p-4" on:change={handleTokenChange}>
			<label
				>Width<input
					type="number"
					class="w-8"
					min="1"
					bind:value={$ContextMenuToken.token.width}
				/>, Height<input
					type="number"
					class="w-8"
					min="1"
					bind:value={$ContextMenuToken.token.height}
					disabled={square}
				/> <input type="checkbox" bind:checked={square} /> :Square</label
			>
			<label><input type="text" bind:value={$ContextMenuToken.token.image} /></label>
			<label><input type="color" bind:value={$ContextMenuToken.token.ringColor} /> <input type="checkbox" bind:checked={transparent}></label>
		</form>
	</div>
{/if}

<style>
	label {
		width: fit-content;
	}
</style>
