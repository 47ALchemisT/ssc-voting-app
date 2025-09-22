<template>
    <div class="flex flex-col min-h-screen">
        <div class="flex-grow">
            <HeroSection />
            <About />
            <Guidelines />
            <HowToVote />
            <Candidates />
        </div>
        
        <Footer />
    </div>
</template>

<script setup>
import HeroSection from '../pages/landing-page/HeroSection.vue';
import About from '../pages/landing-page/About.vue';
import Guidelines from '../pages/landing-page/Guidelines.vue';
import HowToVote from '../pages/landing-page/HowToVote.vue';
import Candidates from '../pages/landing-page/Candidates.vue';
import Footer from '../pages/landing-page/Footer.vue';
</script>
