<template>
    <div>
        <AppBreadCrumbs :home="home" :items="items" />
        <ElectionResults />
    </div>
</template>

<script setup>
import ElectionResults from '~/components/election/ElectionResults.vue'
import AppBreadCrumbs from '~/components/AppBreadCrumbs.vue'
definePageMeta({
    middleware: 'auth',
    layout: 'dashboard-layout',
})

const route = useRoute()
const electionId = route.params.id

const home = ref({
    label: 'Dashboard',
    icon: 'pi pi-home',
    route: '/dashboard'
});

const items = ref([
    { label: 'Elections', icon: 'pi pi-list', route: '/elections' },
    { label: 'Election Details', icon: 'pi pi-info-circle', route: `/elections/${electionId}` },
    { label: 'Election Results', icon: 'pi pi-info-circle' },
]);

</script>
