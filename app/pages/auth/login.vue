<template>
  <div >
    <!-- Header -->
    <div class="space-y-2 mb-4">
      <h1 class="text-2xl font-bold text-gray-800">Sign in</h1>
      <p class="text-gray-500 text-sm">
        Enter your credentials to access your account
      </p>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Email -->
      <div>
        <InputText 
          placeholder="E-mail" 
          type="email" 
          v-model="form.email" 
          variant="filled" 
          required 
          class="w-full"
        />
      </div>

      <!-- Password -->
      <div>
        <Password 
          v-model="form.password" 
          name="password" 
          placeholder="Password" 
          :feedback="false" 
          toggleMask 
          fluid
          class="w-full"
        />
      </div>

      <!-- Sign in button -->
      <Button 
        type="submit"
        :disabled="loading"
        class="w-full font-semibold"
        icon="pi pi-sign-in"
        :label="loading ? 'Signing in...' : 'Sign In'"
      />
      <div>
        <Message size="small" severity="info">Only @msunaawan.edu.ph email addresses are allowed.</Message>
      </div>

      <!-- Error -->
      <div v-if="error" class="text-red-600 text-sm text-center">
        {{ error }}
      </div>
    </form>

    <!-- Divider -->
    <div class="relative my-6">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-gray-300"></div>
      </div>
      <div class="relative flex justify-center text-sm">
        <span class="px-2 bg-white text-gray-500">Or continue with</span>
      </div>
    </div>

    <Button 
      @click="handleGoogleSignIn"
      class="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
      :disabled="loading"
    >
      <img src="https://www.google.com/favicon.ico" alt="Google" class="w-5 h-5" />
      <span>Continue with Google</span>
    </Button>


    <!-- Footer links -->
    <div class="flex justify-center text-sm pt-4">
      <span>
        Don't have an account yet?
        <NuxtLink to="/auth/sign-up" class="text-blue-600 hover:underline">
          Create Account
        </NuxtLink>
      </span>
    </div>
  </div>
</template>

<script setup>
import {useAuth} from '../../../composables/useAuth'

definePageMeta({
  layout: 'auth-layout'
})

const { signIn, signInWithGoogle } = useAuth()

const form = reactive({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  try {
    loading.value = true
    error.value = ''
    await signIn(form)
  } catch (err) {
    error.value = err.statusMessage || 'Invalid email or password. Please try again.'
  } finally {
    loading.value = false
  }
}

const handleGoogleSignIn = async () => {
  try {
    loading.value = true
    await signInWithGoogle()
  } catch (err) {
    error.value = 'Google sign-in failed'
  } finally {
    loading.value = false
  }
}


// const signInWithGoogle = async () => {
//   try {
//     await signInWithGoogle()
//   } catch (err) {
//     error.value = 'Google sign-in failed'
//   }
// }
</script>
