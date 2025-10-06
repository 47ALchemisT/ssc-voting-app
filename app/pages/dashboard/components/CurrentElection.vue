<template>
    <div>
        <!--Welcome-->
        <div>
            <h1 class="text-2xl font-semibold text-gray-800">Admin Dashboard</h1>
            <p class="text-gray-500">Welcome to your admin dashboard</p>
        </div>
        <div v-if="currentElection" class="grid grid-cols-2 gap-8 mt-4">
            <div>
                <div>
                <div class="flex justify-between">
                    <div>
                    <h1 class="text-xs text-gray-500 font-semibold">Current Election</h1>
                    <h1 class="text-xl font-semibold text-gray-800">{{ currentElection.title }}</h1>
                    </div>
                    <div>
                    <Tag class="capitalize" :severity="currentElection.status === 'active' ? 'success' : 'warning'" :value="currentElection.status"/>
                    </div>
                </div>
                <p class="text-gray-700 mt-2">{{ currentElection.description }}</p>
                <div class="mt-4 space-x-4 text-sm text-gray-500 flex">
                    <span>Start: {{ new Date(currentElection.start_date).toLocaleDateString() }}</span>
                    <span>End: {{ new Date(currentElection.end_date).toLocaleDateString() }}</span>
                </div>
                </div>
            </div>
            <div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="group bg-white rounded-lg border border-gray-200 p-6 transition-all duration-300 hover:border-blue-500">
                        <div class="flex justify-between">
                        <h1 class="font-regular text-gray-500 group-hover:text-blue-500 transition-colors duration-200">Total Candidates</h1>
                        <Button variant="text" severity="secondary" rounded class="group-hover:!text-blue-500 transition-colors duration-200">
                            <i class="pi pi-arrow-right rotate-330"></i>
                        </Button>
                        </div>
                        <h1 class="text-2xl mt-1 font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                            {{ candidates.length }}
                        </h1>
                    </div>
                    <div class="group bg-white rounded-lg border border-gray-200 p-6 transition-all duration-300 hover:border-blue-500">
                        <div class="flex justify-between">
                        <h1 class="font-regular text-gray-500 group-hover:text-blue-500 transition-colors duration-200">Total Voters</h1>
                        <Button variant="text" severity="secondary" rounded class="group-hover:!text-blue-500 transition-colors duration-200">
                            <i class="pi pi-arrow-right rotate-330"></i>
                        </Button>
                        </div>
                        <h1 class="text-2xl mt-1 font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                            {{ voters.length }}
                        </h1>
                    </div>
                    <div class="group bg-white rounded-lg border border-gray-200 p-6 transition-all duration-300 hover:border-blue-500">
                        <div class="flex justify-between">
                        <h1 class="font-regular text-gray-500 group-hover:text-blue-500 transition-colors duration-200">Pending Approvals</h1>
                        <Button variant="text" severity="secondary" rounded class="group-hover:!text-blue-500 transition-colors duration-200">
                            <i class="pi pi-arrow-right rotate-330"></i>
                        </Button>
                        </div>
                        <h1 class="text-2xl mt-1 font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                            {{ pendingCandidates.length }}
                        </h1>
                    </div>
                    <div class="group bg-white rounded-lg border border-gray-200 p-6 transition-all duration-300 hover:border-blue-500">
                        <div class="flex justify-between">
                        <h1 class="font-regular text-gray-500 group-hover:text-blue-500 transition-colors duration-200">Positions</h1>
                        <Button variant="text" severity="secondary" rounded class="group-hover:!text-blue-500 transition-colors duration-200">
                            <i class="pi pi-arrow-right rotate-330"></i>
                        </Button>
                        </div>
                        <h1 class="text-2xl mt-1 font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                            {{ positions.length }}
                        </h1>
                    </div>
                </div>
            </div>
        </div>

        <div v-else>
            <p>No current election found</p>
        </div>
    </div>
</template>
<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  currentElection: {
    type: Object,
    default: null
  },
  candidates: {
    type: Array,
    default: () => []
  },
  pendingCandidates: {
    type: Array,
    default: () => []
  },
  voters: {
    type: Array,
    default: () => []
  },
  positions: {
    type: Array,
    default: () => []
  }
});
</script>