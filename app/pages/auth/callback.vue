<template>
  <div class="flex justify-center items-center h-screen bg-gray-50">
    <transition name="fade-vertical" mode="out-in">
      <div v-if="!error" key="loading" class="flex flex-col items-center space-y-4">
        <!-- Animated spinner -->
        <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>

        <!-- Glowing text -->
        <p class="text-gray-700 text-lg font-medium animate-pulse">
          Signing you in, please wait...
        </p>
      </div>

      <!-- Error state -->
      <div v-else key="error" class="space-y-4 text-center">
        <i style="font-size: 3rem;" class="pi pi-exclamation-triangle text-red-600 animate-bounce"></i>
        <h1 class="text-2xl font-bold text-gray-800">Ooops! Something went wrong...</h1>
        <p class="text-red-600 text-sm font-medium">{{ error }}</p>
        <Button 
          @click="goToLogin"
          class="px-4 py-2 bg-blue-600 font-medium text-white rounded hover:bg-blue-700 transition-colors"
        >
          Return to Login
        </Button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useSupabaseClient, useSupabaseUser } from '#imports'

const router = useRouter()
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const error = ref('')

const goToLogin = () => {
  router.push('/auth/login')
}

onMounted(async () => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) throw sessionError

    if (session?.user?.email) {
      if (!session.user.email.endsWith('@msunaawan.edu.ph')) {
        await supabase.auth.signOut()
        error.value = 'Only @msunaawan.edu.ph email addresses are allowed.'
        return
      }
      router.push('/dashboard')
    } else {
      router.push('/auth/login')
    }
  } catch (err) {
    console.error('Auth error:', err)
    error.value = 'An error occurred during sign in. Please try again.'
  }
})
</script>

<style scoped>
/* Smooth fade with vertical slide */
.fade-vertical-enter-active,
.fade-vertical-leave-active {
  transition: all 0.4s ease;
}

.fade-vertical-enter-from {
  opacity: 0;
  transform: translateY(20px); /* slide up from below */
}

.fade-vertical-leave-to {
  opacity: 0;
  transform: translateY(-20px); /* slide up when leaving */
}
</style>
