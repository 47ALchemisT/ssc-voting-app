<template>
  <div>
    <div>
      <AppBreadCrumbs :home="home" :items="items" />
      
      <!-- Single loading state in parent -->
      <div v-if="isLoading" class="p-6">
        <div class="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div class="grid grid-cols-1 gap-6">
          <div class="bg-white rounded-lg p-6 animate-pulse">
            <div class="h-64 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
      
      <!-- Only render dashboard after loading is complete -->
      <template v-else>
        <UserDashboard v-if="!isAdmin" />
        <AdminDashboard v-else />
      </template>
      
      <!-- Profile Completion Modal -->
      <ProfileCompletionModal
        v-if="showProfileModal"
        v-model:visible="showProfileModal"
        :initial-data="authStore.profile || {}"
        @saved="onProfileSaved"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineAsyncComponent, computed } from 'vue'
import { useAuth } from '../../../composables/useAuth'
import { useAuthStore } from '../stores/auth'
import { useSupabaseUser } from '#imports'
import AppBreadCrumbs from '~/components/AppBreadCrumbs.vue'
// Components
const AdminDashboard = defineAsyncComponent(() => import('./admin.vue'))
const UserDashboard = defineAsyncComponent(() => import('./user.vue'))
const ProfileCompletionModal = defineAsyncComponent(() => import('~/components/ProfileCompletionModal.vue'))

const authStore = useAuthStore()
const { signOut } = useAuth()
const user = useSupabaseUser()
const route = useRoute()

const isLoading = ref(true)
const isAdmin = ref(false)
const initialProfileCheck = ref(false)


const home = ref({
    label: 'Dashboard',
    icon: 'pi pi-home',
    route: '/dashboard'
});

// Check if we should show the profile completion modal
const showProfileModal = computed({
  get: () => {
    // Only show if user is loaded, not loading, and hasn't completed profile
    return (
      !isLoading.value &&
      initialProfileCheck.value &&
      user.value &&
      !authStore.hasCompletedProfile &&
      route.name !== 'profile'
    )
  },
  set: (value) => {
    // We don't need to do anything here as the modal's visibility is controlled by the computed property
  }
})

// Check user role and load appropriate dashboard
const checkUserRole = async () => {
  try {
    isLoading.value = true
    await authStore.fetchProfile()
    isAdmin.value = authStore.isAdmin
  } catch (error) {
    console.error('Error checking user role:', error)
  } finally {
    isLoading.value = false
    initialProfileCheck.value = true
  }
}

// Handle when profile is saved
const onProfileSaved = () => {
  // Refresh the profile data
  authStore.fetchProfile()
}

onMounted(() => {
  checkUserRole()
})

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard-layout'
})
</script>

<style>
/* Add any custom styles here */
</style>