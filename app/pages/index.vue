<template>
    <div class="flex flex-col min-h-screen">
      <LandingPageHeader :nav-items="navItems">
        <!-- Auth buttons slots remain the same -->
        <template #auth-buttons>
          <NuxtLink 
            to="/auth/login" 
            class="text-gray-700 hover:text-blue-600 px-4 py-2 text-sm font-medium transition-colors duration-200"
          >
            Log in
          </NuxtLink>
          <NuxtLink 
            to="/auth/register" 
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
          >
            Register
          </NuxtLink>
        </template>
  
        <template #mobile-auth-buttons>
          <NuxtLink 
            to="/auth/login" 
            class="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md"
          >
            Log in
          </NuxtLink>
          <NuxtLink 
            to="/auth/register" 
            class="block w-full text-center px-4 py-2 border border-transparent text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            Register
          </NuxtLink>
        </template>
      </LandingPageHeader>
  
      <main class="flex-grow pt-16">
        <section id="hero" class="min-h-screen">
          <HeroSection />
        </section>
        <section id="about">
          <About />
        </section>
        <section id="guidelines">
          <Guidelines />
        </section>
        <section id="how-to-vote">
          <HowToVote />
        </section>
        <section id="candidates">
          <Candidates />
        </section>
        <Footer />
      </main>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const navItems = ref([
    { name: 'Home', id: 'hero' },
    { name: 'About', id: 'about' },
    { name: 'Guidelines', id: 'guidelines' },
    { name: 'How to Vote', id: 'how-to-vote' },
    { name: 'Candidates', id: 'candidates' },
  ]);
  
  // Import components with defineAsyncComponent for code splitting
  const HeroSection = defineAsyncComponent(() => import('../pages/landing-page/HeroSection.vue'));
  const About = defineAsyncComponent(() => import('../pages/landing-page/About.vue'));
  const Guidelines = defineAsyncComponent(() => import('../pages/landing-page/Guidelines.vue'));
  const HowToVote = defineAsyncComponent(() => import('../pages/landing-page/HowToVote.vue'));
  const Candidates = defineAsyncComponent(() => import('../pages/landing-page/Candidates.vue'));
  const Footer = defineAsyncComponent(() => import('../pages/landing-page/Footer.vue'));
  </script>