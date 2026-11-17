<script lang="ts">
	import './layout.css';
	import WelcomeToast from '$lib/components/WelcomeToast.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" type="image/png" href="/favicon.png" />
	<meta name="theme-color" content="#0f2340" />
</svelte:head>

{@render children()}
<WelcomeToast />
