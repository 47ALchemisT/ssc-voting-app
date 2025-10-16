<template>
  <div class="flex h-screen">
    <!-- Sidebar Component -->
    <div class="relative z-40 h-screen overflow-hidden">
      <aside
        class="fixed lg:sticky top-0 left-0 h-screen transition-all duration-300 ease-in-out bg-gray-50 overflow-hidden"
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
      <!-- Inactive Account Dialog -->
      <Dialog
        v-model:visible="showInactiveDialog"
        :modal="true"
        :closable="false"
        :style="{ width: '450px' }"
      >
        <template #header>
          <div class="flex items-center">
            <i class="pi pi-exclamation-triangle text-yellow-500 mr-2" />
            <span class="font-semibold">Account Deactivated</span>
          </div>
        </template>
        <p class="m-0">Your account has been deactivated by an administrator. Please contact support if you believe this is a mistake.</p>
        <template #footer>
          <Button 
            label="Logout" 
            icon="pi pi-sign-out" 
            class="p-button-danger" 
            @click="handleSignOut"
            :loading="isSigningOut"
          />
        </template>
      </Dialog>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useAuth } from '../../composables/useAuth';
import Sidebar from '@/components/Sidebar.vue';
import Header from '@/components/Header.vue';

const isSidebarOpen = ref(true);
const isMobileSidebarOpen = ref(false);
const windowWidth = ref(process.client ? window.innerWidth : 1024);
const showInactiveDialog = ref(false);
const isSigningOut = ref(false);
const authStore = useAuthStore();
const { signOut } = useAuth();

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

// Check if account is inactive
const checkInactiveStatus = async () => {
  try {
    await authStore.fetchProfile();
    const { isInactive, error } = await authStore.checkInactiveStatus();
    
    if (error) {
      console.error('Error checking account status:', error);
      return;
    }
    
    if (isInactive) {
      showInactiveDialog.value = true;
    }
  } catch (error) {
    console.error('Error checking inactive status:', error);
  }
};

// Handle sign out
const handleSignOut = async () => {
  try {
    isSigningOut.value = true;
    await signOut();
    await navigateTo('/auth/login');
  } catch (error) {
    console.error('Error signing out:', error);
  } finally {
    isSigningOut.value = false;
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
  
  // Check if account is inactive
  checkInactiveStatus();
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>
