<template>
  <div>
    <!-- Header -->
    <div class="space-y-2 mb-4">
      <h1 class="text-2xl font-bold text-gray-800">Create account</h1>
      <p class="text-gray-500 text-sm">
        Fill in the details below to create your account
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

      <!-- Confirm Password -->
      <div>
        <Password 
          v-model="form.confirmPassword" 
          name="confirmPassword" 
          placeholder="Confirm Password" 
          :feedback="false" 
          toggleMask 
          fluid
          class="w-full"
        />
      </div>

      <!-- Sign Up button -->
      <Button 
        type="submit"
        :disabled="loading"
        class="w-full font-semibold"
        icon="pi pi-user-plus"
        :label="loading ? 'Creating account...' : 'Sign Up'"
      />

      <!-- Error -->
      <div v-if="error" class="text-red-600 text-sm text-center">
        {{ error }}
      </div>

      <!-- Success -->
      <div v-if="success" class="text-green-600 text-sm text-center">
        {{ success }}
      </div>
    </form>

    <!-- Divider -->
    <div class="flex my-4 items-center">
      <div class="flex-grow border-t border-gray-300"></div>
      <span class="px-2 text-gray-400 text-sm">or</span>
      <div class="flex-grow border-t border-gray-300"></div>
    </div>

    <!-- Google signup -->
    <Button 
      type="button"
      severity="secondary"
      outlined
      class="w-full"
      icon="pi pi-google"
      label="Sign up with Google"
      @click="signUpWithGoogle"
    />

    <!-- Footer links -->
    <div class="flex justify-center text-sm pt-4">
      <span>
        Already have an account?
        <NuxtLink to="/login" class="text-blue-600 hover:underline">
          Sign In
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

const { signUp, signUpWithGoogle } = useAuth()

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const error = ref('')
const success = ref('')

const handleSubmit = async () => {
  if (form.password !== form.confirmPassword) {
    error.value = "Passwords don't match"
    success.value = ''
    return
  }

  try {
    loading.value = true
    error.value = ''
    success.value = ''
    await signUp(form)

    // show success message
    success.value = 'Account created successfully! Please check your email for verification.'

    // optional: redirect after a delay
    setTimeout(() => {
      navigateTo('/login')
    }, 2000)
  } catch (err) {
    error.value = err.statusMessage || 'An error occurred'
  } finally {
    loading.value = false
  }
}
</script>
