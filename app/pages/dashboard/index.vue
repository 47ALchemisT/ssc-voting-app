<template>
  <div>
    <AppBreadCrumbs :home="home" :items="items" />
    
    <!-- Centralized loading state -->
    <div v-if="isLoading" class="p-6">
      <Loader />
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="bg-red-50 border-l-4 border-red-400 p-4 m-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{{ error }}</p>
        </div>
      </div>
    </div>
    
    <!-- Render dashboard after all data is loaded -->
    <template v-else>
      <AdminDashboard 
        v-if="isAdmin"
        :current-election="currentElection"
        :candidates="candidates"
        :pending-candidates="pendingCandidates"
        :voters="voters"
        :positions="positions"
        :votes="votes"
      />
      <UserDashboard 
        v-else
        :current-election="currentElection"
        :candidates="candidates"
        :active-elections="activeElections"
      />
    </template>
    
    <!-- Profile Completion Modal -->
    <ProfileCompletionModal
      v-if="showProfileModal"
      v-model:visible="showProfileModal"
      :initial-data="authStore.profile || {}"
      @saved="onProfileSaved"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, defineAsyncComponent, computed } from 'vue'
import { useAuth } from '../../../composables/useAuth'
import { useAuthStore } from '../stores/auth'
import { useElectionStore } from '~~/stores/elections'
import { useCandidacyApplicationStore } from '~~/stores/candidacy_application'
import { useVotersListStore } from '~~/stores/votersList'
import { useVoteStore } from '~~/stores/votes'
import { usePositionStore } from '~~/stores/positions'
import { useSupabaseUser } from '#imports'
import AppBreadCrumbs from '~/components/AppBreadCrumbs.vue'
import Loader from '~/components/Loader.vue'

// Components (lazy loaded)
const AdminDashboard = defineAsyncComponent(() => import('./admin.vue'))
const UserDashboard = defineAsyncComponent(() => import('./user.vue'))
const ProfileCompletionModal = defineAsyncComponent(() => import('~/components/ProfileCompletionModal.vue'))

// Note: Update admin.vue and user.vue to accept props instead of fetching data
// admin.vue should accept: currentElection, candidates, pendingCandidates, voters, positions, votes
// user.vue should accept: currentElection, candidates, activeElections

// Stores
const authStore = useAuthStore()
const electionStore = useElectionStore()
const candidacyApplicationStore = useCandidacyApplicationStore()
const votersListStore = useVotersListStore()
const voteStore = useVoteStore()
const positionStore = usePositionStore()

const { signOut } = useAuth()
const user = useSupabaseUser()
const route = useRoute()

// State
const isLoading = ref(true)
const isAdmin = ref(false)
const initialProfileCheck = ref(false)
const error = ref(null)

// Data
const currentElection = ref(null)
const candidates = ref([])
const pendingCandidates = ref([])
const voters = ref([])
const positions = ref([])
const votes = ref([])
const activeElections = ref([])

const home = ref({
  label: 'Dashboard',
  icon: 'pi pi-home',
  route: '/dashboard'
})

const items = ref([])

// Show profile modal
const showProfileModal = computed({
  get: () => {
    return (
      !isLoading.value &&
      initialProfileCheck.value &&
      user.value &&
      !authStore.hasCompletedProfile &&
      route.name !== 'profile'
    )
  },
  set: (value) => {}
})

// Fetch all election data
const fetchElectionData = async () => {
  try {
    const { data: electionData, error: electionError } = await electionStore.getCurrentElections()
    if (electionError) throw electionError
    
    if (electionData && electionData.length > 0) {
      currentElection.value = electionData[0]
      
      if (isAdmin.value) {
        // Admin needs all data
        await Promise.all([
          fetchCandidates(),
          fetchPendingCandidates(),
          fetchVoters(),
          fetchPositions(),
          fetchVotes()
        ])
      } else {
        // User only needs candidates and voting status
        await Promise.all([
          fetchCandidates(),
          checkVotingStatus(electionData)
        ])
      }
    }
  } catch (err) {
    console.error('Error fetching election data:', err)
    throw err
  }
}

const fetchCandidates = async () => {
  if (!currentElection.value?.id) return
  const { data, error: err } = await candidacyApplicationStore.getApplicationsByElection(currentElection.value.id, 1)
  if (err) throw err
  candidates.value = data || []
}

const fetchPendingCandidates = async () => {
  if (!currentElection.value?.id) return
  const { data, error: err } = await candidacyApplicationStore.getApplicationsByElection(currentElection.value.id, 0)
  if (err) throw err
  pendingCandidates.value = data || []
}

const fetchVoters = async () => {
  if (!currentElection.value?.id) return
  const { data, error: err } = await votersListStore.getVotersByElection(currentElection.value.id)
  if (err) throw err
  voters.value = data || []
}

const fetchPositions = async () => {
  if (!currentElection.value?.id) return
  const { data, error: err } = await positionStore.getPositions()
  if (err) throw err
  positions.value = data || []
}

const fetchVotes = async () => {
  if (!currentElection.value?.id) return
  try {
    await voteStore.fetchVotes()
    const electionVotes = voteStore.getVotesByElection(currentElection.value.id)
    votes.value = electionVotes
  } catch (err) {
    console.error('Error fetching votes:', err)
    votes.value = []
  }
}

const checkVotingStatus = async (elections) => {
  const electionsWithStatus = await Promise.all(
    elections.map(async (election) => {
      const hasVoted = await voteStore.hasCurrentUserVoted(election.id)
      return {
        ...election,
        status: hasVoted ? 'voted' : 'active'
      }
    })
  )
  activeElections.value = electionsWithStatus
}

// Initialize dashboard
const initializeDashboard = async () => {
  try {
    isLoading.value = true
    error.value = null
    
    // First check user role
    await authStore.fetchProfile()
    isAdmin.value = authStore.isAdmin
    
    // Then fetch all necessary data
    await fetchElectionData()
    
  } catch (err) {
    error.value = 'Failed to load dashboard data. Please try again later.'
  } finally {
    isLoading.value = false
    initialProfileCheck.value = true
  }
}

// Handle profile saved
const onProfileSaved = () => {
  authStore.fetchProfile()
}

onMounted(() => {
  initializeDashboard()
})

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard-layout'
})
</script>

<style scoped>
/* Add any custom styles here */
</style>