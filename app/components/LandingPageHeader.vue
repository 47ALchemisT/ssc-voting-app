<template>
    <header class="bg-white shadow-sm fixed w-full z-50">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex-shrink-0 flex items-center">
            <a href="#" class="flex items-center" @click.prevent="scrollToSection('hero')">
              <img class="h-8 w-auto" src="../assets/images/Background.png" alt="MSU Naawan Logo">
              <span class="ml-3 text-xl font-bold text-gray-900">SSC Elections</span>
            </a>
          </div>
  
          <!-- Desktop Navigation -->
          <nav class="hidden md:ml-6 md:flex space-x-8">
            <a 
              v-for="item in navItems" 
              :key="item.id" 
              :href="`#${item.id}`"
              @click.prevent="scrollToSection(item.id)"
              class="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
              :class="{ 'text-blue-600 border-b-2 border-blue-600': activeSection === item.id }"
            >
              {{ item.name }}
            </a>
          </nav>
  
          <!-- Auth Buttons (Desktop) -->
          <div class="hidden md:ml-6 md:flex items-center space-x-4">
            <slot name="auth-buttons"></slot>
          </div>
  
          <!-- Mobile menu button -->
          <div class="md:hidden flex items-center">
            <button 
              @click="isOpen = !isOpen"
              type="button" 
              class="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span class="sr-only">Open main menu</span>
              <i v-if="!isOpen" class="pi pi-bars text-xl"></i>
              <i v-else class="pi pi-times text-xl"></i>
            </button>
          </div>
        </div>
      </div>
  
      <!-- Mobile menu -->
      <Transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div v-show="isOpen" class="md:hidden" id="mobile-menu">
          <div class="pt-2 pb-3 space-y-1 bg-white shadow-lg">
            <a 
              v-for="item in navItems" 
              :key="'mobile-' + item.id" 
              :href="`#${item.id}`"
              @click.prevent="() => { scrollToSection(item.id); isOpen = false; }"
              class="block px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-blue-600 border-l-4 border-transparent hover:border-blue-600"
              :class="{ 'bg-blue-50 text-blue-600 border-l-4 border-blue-600': activeSection === item.id }"
            >
              {{ item.name }}
            </a>
            <div class="pt-4 pb-3 border-t border-gray-200 px-4 space-y-3">
              <slot name="mobile-auth-buttons"></slot>
            </div>
          </div>
        </div>
      </Transition>
    </header>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  
  const props = defineProps({
    navItems: {
      type: Array,
      required: true,
      default: () => []
    }
  });
  
  const isOpen = ref(false);
  const activeSection = ref('');
  
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 64, // Adjust for header height
        behavior: 'smooth'
      });
    }
  };
  
  const handleScroll = () => {
    const scrollPosition = window.scrollY + 100; // Adjust for header height + some offset
  
    // Find which section is in view
    props.navItems.forEach(item => {
      const section = document.getElementById(item.id);
      if (section) {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          activeSection.value = item.id;
        }
      }
    });
  };
  
  onMounted(() => {
    window.addEventListener('scroll', handleScroll);
    // Set initial active section
    handleScroll();
  });
  
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
  });
  </script>