<template>
  <header class="flex items-center justify-between bg-white/30 backdrop-blur-sm px-4 py-3 lg:px-6 sticky top-0 z-40">
    <!-- Left: Menu Button and Title -->
    <div class="flex items-center">

      <div>
        <h1 class="text-lg font-semibold text-gray-900">
          <template v-if="isDashboard">
            <h1 class="capitalize">
              Welcome back, {{ userDisplayName }}
            </h1>
          </template>
          <template v-else>
            {{ currentPageTitle }}
          </template>
        </h1>
      </div>
    </div>

    <!-- Right: Actions -->
    <div class="flex items-center gap-4">
      <!-- Notifications Button -->
      <button
        class="relative p-2 cursor-pointer rounded-full hover:bg-gray-100 transition-colors"
        @click="$emit('toggleNotifications')"
      >
        <i class="pi pi-bell text-gray-600 text-lg"></i>
        <!-- Badge -->
        <span
          v-if="notifications > 0"
          class="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full"
        >
          {{ notifications }}
        </span>
      </button>
      <button 
        @click="$emit('toggle-sidebar')" 
        class="mr-3 p-2 rounded-full hover:bg-gray-100"
        :class="{'lg:flex hidden': !sidebarOpen, 'flex': true}"
        :aria-label="sidebarOpen ? 'Close menu' : 'Open menu'"
      >
        <i class="pi pi-bars" />
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const props = defineProps({
  sidebarOpen: {
    type: Boolean,
    default: false
  },
  notifications: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['toggle-sidebar', 'toggleNotifications'])

const route = useRoute()
const authStore = useAuthStore()

const isDashboard = computed(() => route.path === '/dashboard')

const userDisplayName = computed(() => {
  const user = authStore.user
  if (!user) return 'User'
  
  // Try to get name from profile first, then from user_metadata, then from email
  if (authStore.profile?.first_name) {
    return authStore.profile.first_name
  } else if (user.user_metadata?.full_name) {
    return user.user_metadata.full_name.split(' ')[0]
  } else if (user.email) {
    return user.email.split('@')[0]
  }
  return 'User'
})

const routeTitles = {
  'elections': 'Elections',
  'candidates': 'Candidates',
  'results': 'Results',
  'profile': 'My Profile',
  'settings': 'Settings'
}

const currentPageTitle = computed(() => {
  if (route.meta?.title) return route.meta.title
  
  // Get the first path segment after /
  const pathSegments = route.path.split('/').filter(Boolean)
  const mainRoute = pathSegments[0] || 'dashboard'
  
  // Convert kebab-case to Title Case
  return routeTitles[mainRoute] || mainRoute
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
})
</script>
