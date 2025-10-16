<template>
  <div>
    <CurrentElection 
      :current-election="currentElection"
      :candidates="candidates"
      :pending-candidates="[]"
      :voters="[]"
      :positions="[]"
      class="mb-6"
    />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '~~/stores/auth';
import CurrentElection from './components/CurrentElection.vue';

const router = useRouter();
const authStore = useAuthStore();

// Accept data as props from parent
const props = defineProps({
  currentElection: {
    type: Object,
    default: null
  },
  candidates: {
    type: Array,
    default: () => []
  },
  activeElections: {
    type: Array,
    default: () => []
  }
});

const navigateTo = (path) => {
  router.push(path);
};

// Quick actions (if needed)
const quickActions = [
  {
    title: 'Vote Now',
    description: 'Cast your vote in active elections',
    icon: '🗳️',
    bgColor: 'bg-blue-50',
    handler: () => navigateTo('/elections')
  },
  {
    title: 'View Results',
    description: 'See current election results',
    icon: '📊',
    bgColor: 'bg-green-50',
    handler: () => navigateTo('/results')
  },
  {
    title: 'Election Rules',
    description: 'Review voting guidelines',
    icon: '📜',
    bgColor: 'bg-yellow-50',
    handler: () => navigateTo('/election-rules')
  },
  {
    title: 'Help Center',
    description: 'Get assistance with voting',
    icon: '❓',
    bgColor: 'bg-purple-50',
    handler: () => navigateTo('/help')
  }
];
</script>

<style scoped>
/* Add any custom styles here */
</style>