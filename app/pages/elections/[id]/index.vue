<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <i class="pi pi-spin pi-spinner text-2xl text-blue-500"></i>
      <p class="mt-2 text-gray-600">Loading election details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
      <div class="flex items-center">
        <i class="pi pi-exclamation-triangle text-red-500 mr-2"></i>
        <span class="text-red-700">{{ error }}</span>
      </div>
    </div>

    <!-- Election Details -->
    <div v-else-if="election" class="space-y-6">
      <div class="grid grid-cols-5 gap-4">
        <!-- Election Information -->
        <InfoCard class="col-span-3">
          <template #header>
            <div class="flex justify-between">
              <h3 class="font-medium text-gray-800">Election Details</h3>
              <div class="flex gap-2">
                <StartElectionDialog
                  v-if="election.status === 'upcoming'"
                  :election="election"
                  @confirm="startElection"
                />
                <VoteEligibilityModal 
                  v-if="election.status === 'ongoing'"
                  :election-id="election.id"
                  :is-voting-period="isVotingPeriod"
                  @eligible="onEligible"
                  @not-eligible="onNotEligible"
                />
                <Button
                  label="Voters List"
                  size="small"
                  variant="outlined"
                  icon="pi pi-list"
                  @click="navigateToVotersList"
                />
                <Button 
                  v-if="authStore.isAdmin"
                  label="Candidate Applicants" 
                  icon="pi pi-users" 
                  outlined
                  size="small"
                  @click="navigateToCandidates"
                />
                <Button 
                  label="View Results" 
                  icon="pi pi-chart-bar" 
                  size="small"
                  outlined
                  @click="navigateToResults"
                  :disabled="!isElectionEnded"
                  v-tooltip.top="!isElectionEnded ? 'Results will be available after the election ends' : ''"
                />
                <EndElectionDialog
                  v-if="election.status === 'ongoing'"
                  :election="election"
                  @confirm="endElection"
                />
              </div>
            </div>
          </template>
          <div class="flex justify-between">
            <div>
              <h4 class="text-xs font-medium text-gray-600 uppercase">Title</h4>
              <p class="text-gray-800 text-md font-medium mt-1">{{ election.title }}</p>
            </div>
            <div>
              <Tag class="text-xs capitalize">{{ election.status }}</Tag>
            </div>
          </div>
          <div class="mt-4">
            <h4 class="text-xs font-medium text-gray-600 uppercase">Description</h4>
            <p class="text-gray-800 text-sm mt-1 text-justify">{{ election.description }}</p>
          </div>
          <div class="mt-4">
            <h4 class="text-xs font-medium text-gray-600 uppercase">Schedule</h4>
            <div>
              <div class="flex gap-4 text-sm mt-1 text-gray-800">
                <div>
                  <i class="pi pi-calendar-clock mt-1"></i>
                  {{ formatDate(election.start_date) }}
                </div>
                <div> - </div>
                <div>
                  <i class="pi pi-calendar-clock mt-1"></i>
                  {{ formatDate(election.end_date) }}
                </div>
              </div>
            </div>
          </div>
        </InfoCard>
        <InfoCard class="h-full col-span-2">
          <template #header>
            <div class="flex justify-between items-center">
              <h3 class="font-medium text-gray-800">Vote Statistics</h3>
              <Button 
                icon="pi pi-sync" 
                text 
                rounded 
                size="small"
                :loading="refreshingStats"
                @click="refreshStatistics"
              />
            </div>
          </template>
          <VoteStatistics :election-id="electionId" />
        </InfoCard>
      </div>

      <!-- Import Voters Dialog -->
      <ImportVotersDialog
        v-model:visible="showImportDialog"
        :election-id="electionId"
        @imported="handleVotersImported"
      />

      <!-- Election Tabs Component -->
      <ElectionTabs
        :grouped-candidates="groupedCandidates"
        :flattened-candidates="flattenedCandidates"
        :loading="loading"
        :election="election"
        @view-candidate="viewCandidate"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useElectionStore } from '../../../../stores/elections'
import { useVoteStore } from '../../../../stores/votes'
import VoteStatistics from '~/components/election/VoteStatistics.vue'
import { useAuthStore } from '../../../../stores/auth'
import { useCandidacyApplicationStore } from '../../../../stores/candidacy_application'
import { useVotersListStore } from '../../../../stores/votersList'
import InfoCard from '~/components/ui/InfoCard.vue';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import ElectionTabs from '~/components/election/ElectionTabs.vue';
import ImportVotersDialog from '~/components/election/ImportVotersDialog.vue';
import VoteEligibilityModal from '~/components/election/VoteEligibilityModal.vue';
import StartElectionDialog from '~/components/election/StartElectionDialog.vue';
import EndElectionDialog from '~/components/election/EndElectionDialog.vue';

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard-layout',
})

const route = useRoute()
const router = useRouter()
const electionStore = useElectionStore()
const toast = useToast()
const voteStore = useVoteStore()
const authStore = useAuthStore()
const candidacyStore = useCandidacyApplicationStore()
const votersListStore = useVotersListStore()

// UI State
const showImportDialog = ref(false)

const electionId = route.params.id
const election = ref(null)
const loading = ref(true)
const candidates = ref([])
const error = ref(null)
const refreshingStats = ref(false)

const currentDate = computed(() => new Date())
const startDate = computed(() => election.value ? new Date(election.value.start_date) : null)
const endDate = computed(() => election.value ? new Date(election.value.end_date) : null)

const isVotingPeriod = computed(() => {
  if (!election.value) return false
  // Treat 'ongoing' status as open for voting
  if (election.value.status === 'ongoing') return true
  // Otherwise, use the scheduled window
  if (!startDate.value || !endDate.value) return false
  return currentDate.value >= startDate.value && currentDate.value <= endDate.value
})

const isElectionEnded = computed(() => {
  return endDate.value && currentDate.value > endDate.value
})

// Computed properties
const groupedCandidates = computed(() => {
  if (!candidates.value) return []
  
  const groups = {}
  
  candidates.value.forEach(candidate => {
    const positionKey = candidate.position?.id || candidate.position_id || 'unknown'
    if (!groups[positionKey]) {
      groups[positionKey] = {
        position: candidate.position || { id: candidate.position_id, title: 'Unknown Position' },
        candidates: []
      }
    }
    groups[positionKey].candidates.push(candidate)
  })
  
  // Sort groups by position order if available
  return Object.values(groups).sort((a, b) => {
    const orderA = a.position?.order ?? 999
    const orderB = b.position?.order ?? 999
    return orderA - orderB
  })
})

const flattenedCandidates = computed(() => {
  return groupedCandidates.value.flatMap(group => group.candidates)
})

// Methods
const refreshStatistics = async () => {
  refreshingStats.value = true;
  try {
    await voteStore.getVoteStatistics(electionId);
  } finally {
    refreshingStats.value = false;
  }
};

const fetchElection = async () => {
  try {
    const response = await electionStore.getElectionById(electionId)
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    if (!response.data) {
      throw new Error('No election data found')
    }
    
    return response.data
  } catch (err) {
    console.error('Error fetching election:', err)
    throw new Error(err.message || 'Failed to load election details')
  }
}

const fetchCandidates = async () => {
  try {
    const { data, error: fetchError } = await candidacyStore.getApplicationsByElection(
      electionId,
      candidacyStore.STATUS.APPROVED
    )
    
    if (fetchError) {
      throw new Error(fetchError.message || 'Failed to fetch candidates')
    }
    
    if (!data) {
      candidates.value = []
      return
    }
    
    // Transform the data to match our component's expected format
    candidates.value = data.map(candidate => ({
      id: candidate.id,
      name: `${candidate.user?.first_name || ''} ${candidate.user?.last_name || ''}`.trim() || 'Unknown Candidate',
      position: candidate.position || { id: candidate.position_id, title: candidate.position_name || 'Unknown Position' },
      position_id: candidate.position_id,
      party: candidate.party || 'Independent',
      platform: candidate.platform || 'No platform information available',
      photo: candidate.user?.avatar_url || 'https://via.placeholder.com/150',
      user: candidate.user // Keep the full user object if needed
    }))
    
  } catch (err) {
    console.error('Error in fetchCandidates:', err)
    // Don't set error state here to prevent hiding the rest of the page
    candidates.value = []
  }
}

const viewCandidate = (candidateId) => {
  // Navigate to candidate profile or open a modal
  console.log('View candidate:', candidateId);
};

const handleVotersImported = (result) => {
  const toast = useToast();
  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: `Successfully imported ${result.count} voters`,
    life: 5000
  });
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const onEligible = () => {
  // Optional: Add any additional logic when user is eligible
  console.log('User is eligible to vote')
}

const onNotEligible = () => {
  // Optional: Add any additional logic when user is not eligible
  console.log('User is not eligible to vote')
}

const navigateToVotersList = () => {
  router.push(`/elections/${electionId}/voters-list`)
}

const navigateToCandidates = () => {
  router.push(`/elections/${electionId}/candidates`)
}

const navigateToResults = () => {
  if (isElectionEnded.value) {
    router.push(`/elections/${electionId}/results`)
  }
}

// Start election -> set status to 'ongoing'
const startElection = async () => {
  try {
    const { error: err } = await electionStore.updateElectionStatus(electionId, 'ongoing')
    if (err) throw new Error(err)
    // Update local state
    election.value.status = 'ongoing'
    toast.add({ severity: 'success', summary: 'Election Started', detail: 'Status updated to ongoing.', life: 3000 })
  } catch (e) {
    console.error('Failed to start election:', e)
    toast.add({ severity: 'error', summary: 'Error', detail: e.message || 'Failed to start election', life: 4000 })
  }
}

// End election -> set status to 'completed'
const endElection = async () => {
  try {
    // Update both status and is_current in the database
    const { error: err } = await electionStore.updateElectionStatus(
      electionId, 
      'completed',
      0  // This sets is_current to 0
    );
    
    if (err) throw new Error(err);
    
    // Update local state
    election.value.status = 'completed';
    election.value.is_current = 0;
    
  } catch (e) {
    console.error('Failed to end election:', e);
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: e.message || 'Failed to end election', 
      life: 4000 
    });
  }
}

// Lifecycle hooks
onMounted(async () => {
  try {
    loading.value = true
    error.value = null
    
    // Fetch election details first
    election.value = await fetchElection()

    // Fetch all voters list
    const allVotersList = await voteStore.fetchAllVotersList(electionId)
    console.log('All voters list:', allVotersList)
    
    // Then fetch candidates
    await fetchCandidates()
    
  } catch (err) {
    error.value = err.message || 'Failed to load data. Please try again later.'
    console.error('Error in onMounted:', err)
  } finally {
    loading.value = false
  }
})
</script>