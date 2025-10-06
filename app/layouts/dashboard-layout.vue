<template>
  <div class="flex h-screen">
    <!-- Mobile Overlay -->
    <div 
      v-if="isMobileSidebarOpen"
      class="fixed inset-0 bg-black/50 z-30 lg:hidden"
      @click="toggleSidebar"
    />

    <!-- Sidebar Component -->
    <div class="relative z-40 h-screen">
      <aside 
        class="fixed lg:sticky top-0 left-0 h-screen transition-all duration-300 ease-in-out bg-gray-50"
        :class="{
          '-translate-x-full': isMobile ? !isMobileSidebarOpen : false,
          'translate-x-0': isMobile ? isMobileSidebarOpen : true,
          'w-64': isMobile ? isMobileSidebarOpen : isSidebarOpen,
          'w-20': !isMobile && !isSidebarOpen
        }"
      >
      <Sidebar 
        :collapsed="!isSidebarOpen && !isMobileSidebarOpen"
        @toggle="toggleSidebar"
      />
      </aside>
    </div>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col overflow-y-auto h-screen relative z-30">
      <Header 
        @toggle-sidebar="toggleSidebar" 
        :sidebar-open="isSidebarOpen || isMobileSidebarOpen"
      />

      <!-- Page Content -->
      <section class="flex-1 px-4 lg:px-6">
        <slot />
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import Header from '@/components/Header.vue';

const isSidebarOpen = ref(true);
const isMobileSidebarOpen = ref(false);
const windowWidth = ref(process.client ? window.innerWidth : 1024);

const isMobile = computed(() => windowWidth.value < 1024);

const toggleSidebar = () => {
  if (isMobile.value) {
    isMobileSidebarOpen.value = !isMobileSidebarOpen.value;
  } else {
    isSidebarOpen.value = !isSidebarOpen.value;
    // On desktop, we never want to fully close the sidebar, just collapse it to icons
    if (!isSidebarOpen.value && window.innerWidth >= 1024) {
      isSidebarOpen.value = false; // Keep it collapsed but visible
    }
  }
};

const handleResize = () => {
  if (!process.client) return;
  
  windowWidth.value = window.innerWidth;
  
  // Close mobile sidebar when resizing to desktop
  if (windowWidth.value >= 1024) {
    isMobileSidebarOpen.value = false;
  }
};

onMounted(() => {
  if (!process.client) return;
  
  window.addEventListener('resize', handleResize);
  
  // Initialize sidebar state based on screen size
  if (window.innerWidth < 1024) {
    // On mobile, start with sidebar closed
    isSidebarOpen.value = false;
    isMobileSidebarOpen.value = false;
  } else {
    // On desktop, always show sidebar (either expanded or collapsed)
    isSidebarOpen.value = true;
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>
