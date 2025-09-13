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
      <div class="text-end">
        <NuxtLink to="/forgot-password" class="text-blue-600 text-sm hover:underline">
          Forgot Password?
        </NuxtLink>
      </div>


      <!-- Error -->
      <div v-if="error" class="text-red-600 text-sm text-center">
        {{ error }}
      </div>
    </form>

    <!-- Divider -->
    <div class="flex my-4 items-center">
      <div class="flex-grow border-t border-gray-300"></div>
      <span class="px-2 text-gray-400 text-sm">or</span>
      <div class="flex-grow border-t border-gray-300"></div>
    </div>

    <!-- Google login -->
    <Button 
      type="button"
      severity="secondary"
      outlined
      class="w-full"
      icon="pi pi-google"
      label="Sign in with Google"
      @click="signInWithGoogle"
    />

    <!-- Footer links -->
    <div class="flex justify-center text-sm pt-4">
      <span>
        Dont have an account yet?
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
    error.value = err.statusMessage || 'An error occurred'
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
