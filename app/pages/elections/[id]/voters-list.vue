<template>
  <div>
    <div class="mb-4 space-y-4">
        <AppBreadCrumbs :home="home" :items="items" />
        <div class="flex justify-between items-center">
            <div>
                <h2 class="text-lg font-medium text-gray-800">Voters List</h2>
                <p class="text-gray-500 text-sm">List below are the people that are eligible to vote in this election.</p>
            </div>
            <div class="">
              <Button 
                    label="Back to Election" 
                    icon="pi pi-arrow-left" 
                    size="small"
                    @click="navigateBack"
                    class="p-button-outlined"
                />
            </div>
        </div>
        <div>
            <div class="flex justify-between gap-2">
              <IconField>
                  <InputIcon class="pi pi-search" />
                  <InputText v-model="value1" placeholder="Search" />
              </IconField>
              <Button 
                  v-if="authStore.isAdmin"
                  label="Import Voters List"
                  icon="pi pi-upload"
                  @click="showImportDialog = true"
              />
            </div>
        </div>
    </div>

    <div class="rounded-lg border border-gray-200 overflow-hidden">
        <DataTable 
          :value="filteredVoters"
          :paginator="true"
          :rows="10"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[10, 25, 50, 100]"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} voters" 
          :loading="loading"
          stripedRows
          responsiveLayout="scroll"
          class="p-datatable-sm"
          scrollable
          scrollHeight="flex"
          :loadingIcon="'pi pi-spinner'"
          :globalFilterFields="['fullname', 'reg_email', 'college', 'school_id']"
        >
          <Column field="fullname" header="Full Name" :sortable="true">
            <template #body="{ data }">
              {{ data.fullname || '-' }}
            </template>
          </Column>
          <Column field="reg_email" header="Email" :sortable="true"></Column>
          <Column field="college" header="College" :sortable="true">
            <template #body="{ data }">
              {{ data.college || '-' }}
            </template>
          </Column>
          <Column field="school_id" header="School ID" :sortable="true">
            <template #body="{ data }">
              {{ data.school_id || '-' }}
            </template>
          </Column>
        </DataTable>
    </div>
    <ImportVotersDialog 
      v-model:visible="showImportDialog"
      :election-id="electionId"
      @imported="fetchVoters"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../../../stores/auth';
import { useVotersListStore } from '../../../../stores/votersList';
import ImportVotersDialog from '~/components/election/ImportVotersDialog.vue';
import AppBreadCrumbs from '~/components/AppBreadCrumbs.vue';

definePageMeta({
    middleware: 'auth',
    layout: 'dashboard-layout'
})

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const votersListStore = useVotersListStore();

const electionId = route.params.id;
const voters = ref([]);
const loading = ref(false);
const showImportDialog = ref(false);
const searchTerm = ref('');

const home = ref({
  label: 'Dashboard',
  icon: 'pi pi-home',
  route: '/dashboard'
})

const items = ref([
  { label: 'Elections', icon: 'pi pi-list', route: '/elections' },
  { label: 'Election Details', icon: 'pi pi-info-circle', route: `/elections/${electionId}` },
  { label: 'Voters List', icon: 'pi pi-user' }
])

const filteredVoters = computed(() => {
  if (!searchTerm.value) return voters.value;
  
  const term = searchTerm.value.toLowerCase();
  return voters.value.filter(voter => {
    return (
      (voter.fullname && voter.fullname.toLowerCase().includes(term)) ||
      (voter.reg_email && voter.reg_email.toLowerCase().includes(term)) ||
      (voter.college && voter.college.toLowerCase().includes(term)) ||
      (voter.school_id && voter.school_id.toLowerCase().includes(term))
    );
  });
});

const fetchVoters = async () => {
  try {
    loading.value = true;
    const { data, error } = await votersListStore.getVotersByElection(electionId);
    
    if (error) throw error;
    
    voters.value = data || [];
  } catch (error) {
    console.error('Error fetching voters:', error);
    // You might want to show a toast notification here
  } finally {
    loading.value = false;
  }
};

const navigateBack = () => {
  router.push(`/elections/${electionId}`);
};

onMounted(() => {
  fetchVoters();
});
</script>
