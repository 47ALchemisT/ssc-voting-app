<template>
    <div class="py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

  
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">Loading candidates...</p>
        </div>
  
        <!-- Error State -->
        <div v-else-if="error" class="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">
                {{ error }}
              </p>
            </div>
          </div>
        </div>
  
        <!-- Main Content Grid -->
        <div v-if="!loading && !error" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Right Side - Candidate Details -->
            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div v-if="selectedCandidate" class="relative">
                <!-- Background Image -->
                <div class="h-[45rem] w-full">
                <img 
                    v-if="selectedCandidate.user?.avatar_url" 
                    :src="selectedCandidate.user.avatar_url" 
                    :alt="getFullName(selectedCandidate.user)" 
                    class="h-full w-full object-cover"
                >
                    <div v-else class="h-full w-full bg-blue-100 flex items-center justify-center">
                        <svg class="h-24 w-24 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                </div>

                <!-- Overlay Info -->
                <div class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6 text-white">
                <h3 class="text-2xl font-bold">
                    {{ getFullName(selectedCandidate.user) }}
                </h3>
                <p class="text-lg font-medium">
                    {{ getPositionTitle(selectedCandidate.position_id) }}
                </p>

                <div v-if="selectedCandidate.platform" class="mt-4">
                    <h4 class="text-lg font-semibold mb-1">Platform:</h4>
                    <p class="text-sm leading-relaxed">
                    {{ selectedCandidate.platform }}
                    </p>
                </div>
                </div>
            </div>

            <!-- Placeholder when no candidate selected -->
            <div v-else class="text-center py-12">
                <svg class="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h3 class="mt-4 text-lg font-medium text-gray-900">Select a Candidate</h3>
                <p class="mt-1 text-sm text-gray-500">
                Click on a candidate from the list to view their details and photo.
                </p>
            </div>
            </div>


          <!-- Left Side - Candidates List -->
          <div class="space-y-4">
            <div class="mb-6">
                <h2 class="text-3xl md:text-4xl font-bold text-gray-900">
                    The Candidates
                </h2>
                <p class="max-w-2xl mx-auto text-lg text-gray-600">
                    This is the candidates for this election.
                </p>
            </div>
            <div class="flex flex-wrap gap-2">
                <button 
                    v-for="position in positions" 
                    :key="position.id"
                    @click="selectedPositionId = position.id"
                    :class="[
                        'px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                        selectedPositionId === position.id 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    ]"
                    >
                    {{ position.title || position.name }}
                </button>
            </div>
            <div v-if="filteredCandidates.length === 0" class="text-center py-12">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 class="mt-2 text-lg font-medium text-gray-900">No candidates found</h3>
              <p class="mt-1 text-sm text-gray-500">
                {{ selectedPositionId ? 'No candidates for this position yet.' : 'No candidates registered yet.' }}
              </p>
            </div>
            <div 
                v-for="candidate in filteredCandidates" 
                :key="candidate.id"
                @click="selectedCandidate = candidate"
                :class="[
                    'rounded-lg p-3 flex items-center gap-4 cursor-pointer transition-all duration-200',
                    selectedCandidate?.id === candidate.id
                    ? 'bg-blue-100 border border-blue-600'
                    : 'bg-gray-100/50 border border-gray-200 hover:bg-gray-100'
                ]"
                >
                <img 
                    :src="candidate.user.avatar_url" 
                    alt="avatar" 
                    class="w-12 h-12 rounded"
                >
                <div>
                    <h4 class="text-lg font-semibold text-gray-900">
                    {{ getFullName(candidate.user) }}
                    </h4>
                    <p class="text-sm text-gray-600">
                    {{ getPositionTitle(candidate.position_id) }}
                    </p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue';
  import { useElectionStore } from '../stores/elections';
  
  const electionStore = useElectionStore();
  
  const loading = ref(true);
  const error = ref(null);
  const currentElection = ref(null);
  const positions = ref([]);
  const candidates = ref([]);
  const selectedPositionId = ref(null);
  const selectedCandidate = ref(null);
  
  // Computed property to filter candidates based on selected position
  const filteredCandidates = computed(() => {
    if (selectedPositionId.value === null) {
      return candidates.value;
    }
    return candidates.value.filter(candidate => 
      candidate.position_id === selectedPositionId.value
    );
  });
  
  // Format candidate name
  const getFullName = (user) => {
    if (!user) return 'Unknown Candidate';
    return [user.first_name, user.middle_name, user.last_name].filter(Boolean).join(' ');
  };
  
  // Get position title by ID
  const getPositionTitle = (positionId) => {
    const position = positions.value.find(p => p.id === positionId);
    return position ? (position.title || position.name) : 'Unknown Position';
  };
  
  // Watch for changes in the filtered candidates
  watch(filteredCandidates, (newCandidates) => {
    if (newCandidates.length > 0) {
      selectedCandidate.value = newCandidates[0];
    } else {
      selectedCandidate.value = null;
    }
  });

  // Fetch all necessary data
  const fetchData = async () => {
    try {
      loading.value = true;
      error.value = null;
      
      // Get current election
      const { data: electionData, error: electionError } = await electionStore.getCurrentElections();
      
      if (electionError) throw new Error('Failed to load current election');
      
      if (!electionData || electionData.length === 0) {
        throw new Error('No active election found');
      }
      
      currentElection.value = electionData[0];
      
      // Get positions for the current election
      const positionsData = await electionStore.getElectionPositions(currentElection.value.id);
      positions.value = positionsData || [];
      
      // Set default selected position to President (assuming President has order = 1)
      const presidentPosition = positions.value.find(p => p.order === 1);
      if (presidentPosition) {
        selectedPositionId.value = presidentPosition.id;
      } else if (positions.value.length > 0) {
        // Fallback to first position if no President found
        selectedPositionId.value = positions.value[0].id;
      }
      
      // Get all candidates for the current election
      const { data: candidatesData, error: candidatesError } = await electionStore.getElectionCandidates(currentElection.value.id);
      
      if (candidatesError) throw candidatesError;
      
      // Format candidates data
      candidates.value = candidatesData || [];
      
    } catch (err) {
      console.error('Error loading candidates:', err);
      error.value = err.message || 'Failed to load candidates. Please try again later.';
    } finally {
      loading.value = false;
    }
  };
  // Fetch data when component mounts
  onMounted(() => {
    fetchData();
  });
  </script>