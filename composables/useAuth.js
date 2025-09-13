import { useAuthStore } from '../stores/auth'
import { useSupabaseClient } from '#imports'

export const useAuth = () => {
  const authStore = useAuthStore()
  const supabase = useSupabaseClient()

  const signUp = async (formData) => {
    const { email, password, name } = formData
    // pass metadata (like name) to Supabase
    const { data, error } = await authStore.signUp(email, password, { name })
    if (error) throw error
    return data
  }

  const signIn = async (formData) => {
    const { email, password } = formData
    const { data, error } = await authStore.signIn(email, password)
    if (error) throw error
    await navigateTo('/dashboard')
    return data
  }

  const signOut = async () => {
    return await authStore.signOut()
  }

  const signUpWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) throw error
    return data
  }

  // Use isAdmin from auth store
  const isAdmin = computed(() => authStore.isAdmin)

  return {
    signUp,
    signIn,
    signOut,
    signUpWithGoogle,
    isAdmin
  }
}
