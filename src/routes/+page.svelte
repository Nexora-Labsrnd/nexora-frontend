<script lang='ts'>
    // your script goes here
import NavBar from '$lib/components/NavBar.svelte';
import './layout.css';
import favicon from '$lib/assets/favicon.svg';
import Hero from '$lib/components/Hero.svelte';
import Testimonials from '$lib/components/Testimonials.svelte';
import About from '$lib/components/About.svelte';
import Services from '$lib/components/Services.svelte';
import CallToAction from '$lib/components/CallToAction.svelte';
import Footer from '$lib/components/Footer.svelte';

</script>


<NavBar />
<Hero />
<About />
<Services />
<Testimonials />
<CallToAction />
<Footer />
