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
      <!-- Notifications -->
      <Notification />
      <button 
        @click="$emit('toggle-sidebar')" 
        class="flex mr-3 p-2 rounded-full hover:bg-gray-100"
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
import Notification from './Notification.vue'

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
