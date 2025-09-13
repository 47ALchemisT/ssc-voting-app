<template>
    <div>
        <h1>this is the dashboards</h1>
        <button
            @click="handleSignOut()"
        >
            logout
        </button>
        <h1>shhshs</h1>
    </div>
</template>

<script setup>
import {useAuth} from '../../../composables/useAuth'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard-layout'
})

const user = useSupabaseUser()
const { signOut } = useAuth()

const handleSignOut = async () => {
  await signOut()
}

</script>

<style>

</style>