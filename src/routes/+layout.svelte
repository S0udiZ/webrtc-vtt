<script lang="ts">
	// The ordering of these imports is critical to your app working properly
	import '../theme.postcss';
	// If you have source.organizeImports set to true in VSCode, then it will auto change this ordering
	import '@skeletonlabs/skeleton/styles/skeleton.css';
	// Most of your app wide CSS should be put in this file
	import '../app.postcss';
	import { Toast } from '@skeletonlabs/skeleton';
	import ContextMenu from '$lib/components/contextMenu/ContextMenu.svelte';

	import { setContext } from 'svelte';

	let user: string = 'GM';
	setContext('player', user);
</script>

<slot />

<ContextMenu {user} />
<Toast />
