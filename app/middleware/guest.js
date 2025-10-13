export default defineNuxtRouteMiddleware(() => {
  const user = useSupabaseUser()

  //if user redirect to dashboard
  if (user.value) {
    return navigateTo('/dashboard')
  }
})
