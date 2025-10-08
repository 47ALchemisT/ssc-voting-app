<template>
  <div class="">
    <AppBreadCrumbs :home="home" :items="items" />
    <PendingApplicationsModal
      v-if="isAdmin"
      v-model:visible="showPendingModal"
      :election-id="electionId"
      @updated="handleApplicationsUpdated"
    />
    
    <div class="flex justify-between mb-4">
      <div>
        <h1 class="text-lg font-medium text-gray-800">Candidates for {{ electionTitle }}</h1>
        <p class="text-sm text-gray-500">List below are approved canndidates for this election</p>
      </div>
      <div>
        <div class="flex gap-2">
          <Button 
            v-if="isAdmin"
            label="Pending Applications" 
            icon="pi pi-users" 
            size="small"
            @click="showPendingModal = true"
          />
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex justify-content-center p-4">
      <ProgressSpinner />
    </div>

    <div v-else-if="error" class="p-error">
      {{ error }}
    </div>

    <div class="election-candidates p-1 border border-gray-200 rounded-lg">
      <div v-if="candidates.length === 0" class="text-center p-6 text-gray-500">
        <p>No candidates found for this election.</p>
        <Button 
          v-if="isAdmin"
          label="View Pending Applications" 
          icon="pi pi-users" 
          class="p-button-text"
          @click="showPendingModal = true"
        />
      </div>

      <DataTable v-else
                :value="candidates" 
                rowGroupMode="rowspan" 
                groupRowsBy="position.title"
                sortMode="single" 
                sortField="position.order"
                :sortOrder="1"
                :paginator="candidates.length > 5" 
                :rows="5" 
                :rowsPerPageOptions="[5, 10, 20]" 
                :loading="loading"
                tableStyle="min-width: 50rem"
                class="p-datatable-sm">
        <Column header="#" headerStyle="width:3rem">
          <template #body="{ index }">
            {{ index + 1 }}
          </template>
        </Column>
        
        <Column field="position.title" header="Position" style="min-width: 200px">
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <i class="pi pi-briefcase" style="font-size: 1.25rem"></i>
              <div>
                <div class="font-medium">{{ data.position?.title || 'N/A' }}</div>
                <div v-if="data.position?.description" class="text-xs text-gray-500">
                  {{ data.position.description }}
                </div>
              </div>
            </div>
          </template>
        </Column>
        
        <Column field="name" header="Candidate" style="min-width: 250px">
          <template #body="{ data }">
            <div class="flex items-center gap-3">
              <Avatar :image="data.user?.avatar_url || 'https://via.placeholder.com/40'" 
                    shape="circle" 
                    size="large" 
                    class="bg-gray-100" />
              <div>
                <div class="font-medium">{{ data.user?.first_name }} {{ data.user?.last_name }}</div>
                <div class="text-sm text-gray-500">{{ data.party || 'Independent' }}</div>
              </div>
            </div>
          </template>
        </Column>
        
        <Column field="platform" header="Platform" style="min-width: 200px">
          <template #body="{ data }">
            <div class="line-clamp-2">
              {{ data.platform || 'No platform information available' }}
            </div>
          </template>
        </Column>
        
        <Column header="Actions" style="width: 120px">
          <template #body="{ data }">
            <Button icon="pi pi-eye" label="View" variant="outlined" size="small" @click="viewApplication(data.id)" />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
import { useCandidacyApplicationStore } from '../../../../stores/candidacy_application'
import { useAuth } from '../../../../composables/useAuth'
import AppBreadCrumbs from '~/components/AppBreadCrumbs.vue'

const candidacyApplicationStore = useCandidacyApplicationStore()
const { isAdmin } = useAuth()

definePageMeta({
    middleware: 'auth',
    layout: 'dashboard-layout'
})

const route = useRoute()
const router = useRouter()

const electionId = computed(() => route.params.id)
const electionTitle = ref('Election')
const candidates = ref([])
const loading = ref(true)
const error = ref(null)
const showPendingModal = ref(false)
const home = ref({
  label: 'Dashboard',
  icon: 'pi pi-home',
  route: '/dashboard'
})

const items = ref([
  { label: 'Elections', icon: 'pi pi-list', route: '/elections' },
  { label: 'Election Details', icon: 'pi pi-info-circle', route: `/elections/${electionId.value}` },
  { label: 'Candidates', icon: 'pi pi-user' }
])

onMounted(async () => {
  await loadCandidates()
})

async function loadCandidates() {
  try {
    loading.value = true
    // Only fetch approved candidates with position data
    const { data, error: fetchError } = await candidacyApplicationStore.getApplicationsByElection(
      electionId.value,
      candidacyApplicationStore.STATUS.APPROVED // Only get approved candidates
    )
    
    if (fetchError) throw new Error(fetchError)
    
    // Sort candidates by position order if position data is available
    candidates.value = (data || []).sort((a, b) => {
      const orderA = a.position?.order || 999
      const orderB = b.position?.order || 999
      return orderA - orderB
    })
    
    // Set election title if available
    if (candidates.value.length > 0 && candidates.value[0].election) {
      electionTitle.value = candidates.value[0].election.title
    } else if (candidates.value.length === 0) {
      // If no approved candidates, try to get election title from any application
      const { data: anyData } = await candidacyApplicationStore.getApplicationsByElection(electionId.value)
      if (anyData?.length > 0 && anyData[0].election) {
        electionTitle.value = anyData[0].election.title
      }
    }
  } catch (err) {
    console.error('Error loading candidates:', err)
    error.value = 'Failed to load candidates. Please try again later.'
  } finally {
    loading.value = false
  }
}

function handleApplicationsUpdated() {
  // Refresh the candidates list when pending applications are updated
  loadCandidates()
}

function viewApplication(id) {
  router.push(`/candidacy/${id}`)
}

function navigateBack() {
  router.push(`/elections/${electionId.value}`)
}
</script>