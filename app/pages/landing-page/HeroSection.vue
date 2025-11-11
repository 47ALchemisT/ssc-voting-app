<template>
  <section class="relative min-h-[100vh] flex items-center overflow-hidden bg-gradient-to-br from-blue-900 to-indigo-900">
    <!-- Optimized Background Image -->
    <img 
      src="~/assets/images/background-image.jpg" 
      alt="Students on campus"
      class="absolute inset-0 w-full h-full object-cover z-0"
      loading="eager"
      decoding="async"
      :style="{ 
        'content-visibility': 'auto',
        'contain-intrinsic-size': '800px'
      }"
    >
    
    <!-- Background overlay with gradient -->
    <div class="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-blue-800/60 z-0"></div>
    
    <!-- Content -->
    <div class="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-24 2xl:px-32 relative z-10 py-20">
      <div class="grid grid-cols-1 gap-12 items-center">
        <!-- Hero Section-->
        <div class="text-white w-full text-center sm:text-left">

          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div class="col-span-1 md:col-span-2">
              <!-- University Badge -->
              <div class="flex gap-3 mb-4">
                <img 
                  src="~/assets/images/Background.png" 
                  alt="MSU Naawan Logo" 
                  class="w-16 h-16 rounded-full"
                  loading="eager"
                  width="64"
                  height="64"
                >
                <img 
                  src="~/assets/images/SSC-logo-final.jpg" 
                  alt="MSU Naawan Logo" 
                  class="w-16 h-16 rounded-full"
                  loading="eager"
                  width="64"
                  height="64"
                >
              </div>
              
              <!-- Main Heading -->
              <h1 class="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4 sm:mb-6">
                <span class="block">Supreme Student Council Elections</span>
              </h1>
              
              <!-- Subtitle -->
              <div class="relative px-6 sm:pl-6 mb-6 sm:mb-8">
                <div class="hidden sm:block absolute left-0 top-0 h-full w-1 bg-yellow-400 rounded-full"></div>
                <p class="text-lg sm:text-xl md:text-2xl text-blue-100 font-light leading-relaxed">
                  Mindanao State University at Naawan<br>
                  <span class="text-yellow-300 font-medium">Digital Voting Platform</span>
                </p>
              </div>
              <!-- Description -->
              <div class="prose prose-sm sm:prose-base text-blue-100 max-w-none mb-8 sm:mb-10">
                <p class="text-base sm:text-lg md:text-xl leading-relaxed">
                  Your voice shapes our campus. Participate in the most transparent and accessible 
                  student council elections. Cast your vote securely from anywhere, at any time.
                </p>
              </div>
              
              <!-- CTA Buttons -->
              <div class="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
                <NuxtLink 
                  to="/vote" 
                  class="px-8 py-3.5 bg-yellow-500 text-blue-900 font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 text-center focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-blue-900"
                >
                  Cast Your Vote
                </NuxtLink>
                <NuxtLink 
                  to="/about"
                  class="px-8 py-3.5 border-2 border-white/30 hover:bg-white/10 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 text-center focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-900"
                >
                  Learn More
                </NuxtLink>
              </div>
              
              <!-- Quick Stats -->
              <div class="mt-8 sm:mt-12 flex flex-wrap justify-center sm:justify-start gap-6 sm:gap-8">
                <div class="flex items-center">
                  <div class="bg-blue-600/30 p-2 rounded-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div class="text-2xl font-bold">100%</div>
                    <div class="text-sm text-blue-200">Secure</div>
                  </div>
                </div>
                <div class="flex items-center">
                  <div class="bg-blue-600/30 p-2 rounded-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div class="text-2xl font-bold">24/7</div>
                    <div class="text-sm text-blue-200">Access</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-span-1 w-full">
              <!-- Current Election Card -->
              <div class="w-full bg-white/10 backdrop-blur-sm my-0 md:my-24 rounded-xl p-6 border border-white/10 shadow-lg">
                <!-- Loading State (Skeleton) -->
                <div v-if="loading" class="animate-pulse">
                  <div class="flex items-center mb-4">
                    <div class="h-6 w-6 bg-white/20 rounded-full mr-2"></div>
                    <div class="h-6 w-32 bg-white/20 rounded"></div>
                  </div>
                  <div class="space-y-4">
                    <div>
                      <div class="h-4 w-20 bg-white/20 rounded mb-2"></div>
                      <div class="h-6 w-full bg-white/20 rounded"></div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <div class="h-3 w-16 bg-white/20 rounded mb-1"></div>
                        <div class="h-4 w-24 bg-white/20 rounded"></div>
                      </div>
                      <div>
                        <div class="h-3 w-16 bg-white/20 rounded mb-1"></div>
                        <div class="h-4 w-24 bg-white/20 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Empty State -->
                <div v-else-if="!currentElection" class="text-center py-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 class="mt-4 text-lg font-medium text-white">No Active Elections</h3>
                  <p class="mt-1 text-sm text-blue-100">Check back later for upcoming elections</p>
                </div>
                
                <!-- Data Loaded State -->
                <div v-else>
                  <h3 class="text-xl font-bold text-yellow-300 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Current Election
                  </h3>
                  <div class="space-y-4">
                    <div>
                      <p class="text-sm text-blue-100 font-medium">Election Title</p>
                      <p class="text-lg font-semibold text-white">{{ currentElection.title }}</p>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <p class="text-sm text-blue-100 font-medium">Starts</p>
                        <p class="text-white">{{ formatDate(currentElection.start_date) }}</p>
                      </div>
                      <div>
                        <p class="text-sm text-blue-100 font-medium">Ends</p>
                        <p class="text-white">{{ formatDate(currentElection.end_date) }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  </template>
  
<script setup>
// Import Vue composition API
import { ref, onMounted } from 'vue';
// Import Nuxt composables
import { useSeoMeta, useHead } from '#imports';
// Import store
import { useElectionStore } from '../../../stores/elections';
  
  // Initialize store
  const electionStore = useElectionStore();
  const currentElection = ref(null);
  const loading = ref(true);
  
  // Fetch current elections on component mount
  onMounted(async () => {
    try {
      const { data } = await electionStore.getCurrentElections();
      if (data && data.length > 0) {
        currentElection.value = data[0]; // Get the first current election
      }
    } catch (error) {
      console.error('Error fetching current election:', error);
    } finally {
      loading.value = false;
    }
  });
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
// Set up SEO metadata
useSeoMeta({
  title: 'SSC Elections - Digital Voting Platform',
  description: 'Participate in transparent and accessible student council elections at Mindanao State University at Naawan',
  ogTitle: 'SSC Elections - Cast Your Vote',
  ogDescription: 'Participate in the most transparent and accessible student council elections at MSU Naawan',
  ogImage: '/og-image.jpg',
  twitterCard: 'summary_large_image',
})

// Preload critical resources
useHead({
  link: [
    {
      rel: 'preload',
      href: '/assets/images/background-image.jpg',
      as: 'image',
    },
    {
      rel: 'preload', 
      href: '/assets/images/Background.png',
      as: 'image',
    }
  ]
})
  </script>
  
  <style scoped>
  /* Optimize rendering performance */
  section {
    transform: translateZ(0);
    backface-visibility: hidden;
    perspective: 1000;
  }
  
  /* Smooth image loading */
  img {
    transition: opacity 0.3s ease-in-out;
  }
  
  /* Reduce motion for users who prefer it */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  </style>