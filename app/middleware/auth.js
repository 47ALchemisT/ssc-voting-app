export default defineNuxtRouteMiddleware(() => {
  const user = useSupabaseUser()
  //if not user redirect to login
  if (!user.value) {
    return navigateTo('/auth/login')
  }
})