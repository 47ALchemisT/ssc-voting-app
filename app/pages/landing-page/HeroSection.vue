<template>
<section class="relative min-h-[100vh] flex items-center overflow-hidden bg-gradient-to-br from-blue-900 to-indigo-900">
  <!-- Background image -->
  <img 
    src="~/assets/images/background-image.jpg" 
    alt="Students on campus"
    class="absolute inset-0 w-full h-full object-cover z-0"
  >
  <!-- Background overlay with gradient -->
  <div class="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-blue-800/60 z-0"></div>
  
  <!-- Content -->
  <div class="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-24 2xl:px-32 relative z-10 py-20">
    <div class="grid grid-cols-1 gap-12 items-center">
      <!-- Hero Section-->
      <div class="text-white max-w-4xl">
        <!-- University Badge -->
        <div class="inline-block mb-4">
          <img src="~/assets/images/Background.png" alt="Logo" class="w-16 h-16 rounded-full">
        </div>
        
        <!-- Main Heading -->
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6">
          <span class="block">Supreme Student Council Elections</span>
        </h1>
        
        <!-- Subtitle -->
        <div class="relative pl-6 mb-8">
          <div class="absolute left-0 top-0 h-full w-1 bg-yellow-400 rounded-full"></div>
          <p class="text-xl md:text-2xl text-blue-100 font-light leading-relaxed">
            Mindanao State University at Naawan<br>
            <span class="text-yellow-300 font-medium">Digital Voting Platform</span>
          </p>
        </div>
        
        <!-- Description -->
        <div class="prose prose-lg text-blue-100 max-w-none mb-10">
          <p class="text-lg md:text-xl leading-relaxed">
            Your voice shapes our campus. Participate in the most transparent and accessible 
            student council elections. Cast your vote securely from anywhere, at any time.
          </p>
        </div>
        
        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row gap-4">
          <NuxtLink 
            to="/vote" 
            class="px-8 py-3.5 bg-yellow-500 text-blue-900 font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 text-center"
          >
            Cast Your Vote
          </NuxtLink>
          <NuxtLink 
            to="/about"
            class="px-8 py-3.5 border-2 border-white/30 hover:bg-white/10 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 text-center"
          >
            Learn More
          </NuxtLink>
        </div>
        
        <!-- Quick Stats -->
        <div class="mt-12 flex flex-wrap gap-8">
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
    </div>
  </div>
  
</section>
</template>

<script setup>
// Component logic can be added here
</script>