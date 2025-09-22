<template>
    <div>
        <ElectionResults />
    </div>
</template>

<script setup>
import ElectionResults from '~/components/election/ElectionResults.vue'

    definePageMeta({
        middleware: 'auth',
        layout: 'dashboard-layout',
    })
</script>
