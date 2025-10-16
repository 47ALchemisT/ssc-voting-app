<template>
  <div class="space-y-6">
    <CurrentElection
      :current-election="currentElection"
      :candidates="candidates"
      :pending-candidates="pendingCandidates"
      :voters="voters"
      :positions="positions"
    />

    <!-- Statistics - Only show when there's an election -->
    <div v-if="currentElection" class="grid gap-4 mb-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <VotersDistribution
        :voted-count="votes.length"
        :total-voters="voters.length"
      />
      <VotesOverTime
        :votes="votes"
        :election-id="currentElection?.id?.toString()"
        :is-loading="false"
      />
    </div>
  </div>
</template>

<script setup>
import CurrentElection from './components/CurrentElection.vue';
import VotersDistribution from './components/VotersDistribution.vue';
import VotesOverTime from './components/VotesOverTime.vue';

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
  },
  votes: {
    type: Array,
    default: () => []
  }
});
</script>

<style scoped>
/* Add any custom styles here */
</style>