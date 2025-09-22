<template>
  <div>
    <!-- Header -->
    <div class="space-y-2 mb-4">
      <h1 class="text-2xl font-bold text-gray-800">Create account</h1>
      <p class="text-gray-500 text-sm">
        Enter your email to create an account
      </p>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Email -->
      <div>
        <InputText 
          v-model="form.email" 
          type="email" 
          placeholder="Enter your email" 
          required 
          class="w-full"
        />
      </div>

      <!-- Sign Up button -->
      <Button 
        type="submit"
        :disabled="loading"
        class="w-full font-semibold"
        icon="pi pi-user-plus"
        :label="loading ? 'Creating account...' : 'Create Account'"
      />

      <!-- Error -->
      <div v-if="error" class="text-red-600 text-sm text-center">
        {{ error }}
      </div>
    </form>
    <!-- Footer links -->
    <div class="flex justify-center text-sm pt-4">
      <span>
        Already have an account?
        <NuxtLink to="/auth/login" class="text-blue-600 hover:underline">
          Sign In
        </NuxtLink>
      </span>
    </div>

    <!-- Success Modal -->
    <Dialog 
      v-model:visible="showSuccessModal" 
      modal 
      draggable
      header="Account Created Successfully" 
      :style="{ width: '450px' }"
      :closable="false"
    >
      <div class="space-y-4">
        <p>Your account has been created successfully!</p>
        <div>
          <p class="font-medium mb-1">Your password is:</p>
          <div class="flex items-center gap-2">
            <InputText 
              v-model="generatedPassword" 
              type="text" 
              readonly 
              class="flex-1" 
            />
            <Button 
              icon="pi pi-copy" 
              @click="copyToClipboard" 
              text
              :pt="{
                root: { class: 'p-2' }
              }"
            />
          </div>
          <p class="text-sm text-gray-500 mt-1">
            Please copy this password and keep it in a safe place.
          </p>
        </div>
      </div>
      <template #footer>
        <Button 
          label="Continue to Login" 
          icon="pi pi-sign-in" 
          class="p-button-primary" 
          @click="goToLogin"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { useAuth } from '../../../composables/useAuth'
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'

definePageMeta({
  layout: 'auth-layout'
})

const router = useRouter()
const toast = useToast()
const { signUp, signUpWithGoogle } = useAuth()

const form = reactive({
  email: ''
})

const loading = ref(false)
const error = ref('')
const generatedPassword = ref('')
const showSuccessModal = ref(false)

const generatePassword = (email) => {
  // Take the part before @ and add '1#' at the end
  const username = email.split('@')[0];
  return `${username}1#`;
}

const copyToClipboard = () => {
  navigator.clipboard.writeText(generatedPassword.value)
  toast.add({
    severity: 'success',
    summary: 'Copied!',
    detail: 'Password copied to clipboard',
    life: 3000
  })
}

const goToLogin = () => {
  showSuccessModal.value = false
  router.push('/auth/login')
}

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@msunaawan\.edu\.ph$/i;
  return emailRegex.test(email);
}

const handleSubmit = async () => {
  try {
    loading.value = true
    error.value = ''

    // Validate email domain
    if (!validateEmail(form.email)) {
      error.value = 'Please use your @msunaawan.edu.ph email address'
      return
    }

    // Generate password from email
    generatedPassword.value = generatePassword(form.email)

    // Call the signUp function with form data
    const { error: signUpError } = await signUp({
      email: form.email,
      password: generatedPassword.value
    })

    if (signUpError) throw signUpError

    // Show success modal
    showSuccessModal.value = true

  } catch (err) {
    error.value = err.message || 'An error occurred during sign up'
    console.error('Signup error:', err)
  } finally {
    loading.value = false
  }
}
</script>