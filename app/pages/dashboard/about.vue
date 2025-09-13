<template>
    <div>
        hello this is about
    </div>
</template>

<script setup>
import {useAuth} from '../../../composables/useAuth'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard-layout'
})

</script>

<style>

</style>