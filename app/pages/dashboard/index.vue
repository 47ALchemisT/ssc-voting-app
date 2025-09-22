<template>
  <div>
    <div v-if="isLoading" class="flex items-center justify-center h-screen">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
    
    <div v-else>
      <AdminDashboard v-if="isAdmin" />
      <UserDashboard v-else />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineAsyncComponent } from 'vue'
import { useAuth } from '../../../composables/useAuth'
import { useAuthStore } from '../stores/auth'
import { useSupabaseUser } from '#imports'

// Components
const AdminDashboard = defineAsyncComponent(() => import('./admin.vue'))
const UserDashboard = defineAsyncComponent(() => import('./user.vue'))

const authStore = useAuthStore()
const { signOut } = useAuth()
const user = useSupabaseUser()

const isLoading = ref(true)
const isAdmin = ref(false)

// Check user role and load appropriate dashboard
const checkUserRole = async () => {
  try {
    await authStore.fetchProfile()
    isAdmin.value = authStore.isAdmin
  } catch (error) {
    console.error('Error checking user role:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  checkUserRole()
})

const handleSignOut = async () => {
  await signOut()
}

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard-layout'
})
</script>

<style>

</style>