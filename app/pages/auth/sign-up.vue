<template>
  <div class="max-w-md mx-auto">
    <!-- Header -->
    <div class="space-y-1 mb-8">
      <h1 class="text-2xl font-bold text-gray-800">Create your account</h1>
      <p class="text-gray-600 text-sm">
        Sign up using your <span class="font-semibold text-blue-600">@msunaawan.edu.ph</span> email
      </p>
      <Message severity="info" class="text-sm">
        Only @msunaawan.edu.ph email addresses are allowed.
      </Message>
    </div>

    <!-- Google Sign Up Button -->
    <div class="space-y-3">
      <Button 
        @click="handleGoogleSignUp"
        class="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-4 rounded-lg transition-colors shadow-sm"
        :disabled="loading"
      >
        <img src="https://www.google.com/favicon.ico" alt="Google" class="w-5 h-5" />
        <span class="text-base font-medium">Sign up with Google</span>
      </Button>

      <!-- Error Message -->
      <div v-if="error" class="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">
        {{ error }}
      </div>
      <!-- Footer links -->
      <div class="text-center text-sm text-gray-600 pt-4 border-t border-gray-100">
        <p>
          Already have an account?
          <NuxtLink to="/auth/login" class="text-blue-600 hover:underline font-medium">
            Sign In
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../../composables/useAuth'

definePageMeta({
  layout: 'auth-layout'
})
const router = useRouter()
const { signUpWithGoogle } = useAuth()

const loading = ref(false)
const error = ref('')

const handleGoogleSignUp = async () => {
  try {
    loading.value = true
    error.value = ''
    
    // Redirect to Google OAuth
    const { error: googleError } = await signUpWithGoogle()
    
    if (googleError) {
      // Check if the error is due to invalid domain
      if (googleError.message?.includes('invalid email domain')) {
        error.value = 'Please use your @msunaawan.edu.ph email address'
      } else {
        throw googleError
      }
    }
  } catch (err) {
    console.error('Google sign-up error:', err)
    error.value = err.message || 'Failed to sign up with Google. Please try again.'
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/auth/login')
}
</script>