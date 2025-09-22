<template>
  <div>
    <div class="flex justify-between mb-4">
        <div>
            <h2 class="text-lg font-medium text-gray-800">Voters List</h2>
            <p class="text-gray-500 text-sm">List below are the people that are eligible to vote in this election.</p>
        </div>
        <div>
            <div class="flex gap-2">
                <Button 
                    v-if="authStore.isAdmin"
                    label="Import Voters List"
                    size="small"
                    icon="pi pi-upload"
                    @click="showImportDialog = true"
                />
                <Button 
                    label="Back to Election" 
                    icon="pi pi-arrow-left" 
                    size="small"
                    @click="navigateBack"
                    class="p-button-outlined"
                />
            </div>
        </div>
    </div>

    <div class="p-1 rounded-lg border border-gray-200">
        <DataTable 
          :value="voters" 
          :loading="loading"
          :paginator="true" 
          :rows="10"
          :rowsPerPageOptions="[5, 10, 20, 50]"
          stripedRows
          responsiveLayout="scroll"
          class="p-datatable-sm"
        >
          <Column field="reg_email" header="Email Address" :sortable="true"></Column>
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
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../../../stores/auth';
import { useVotersListStore } from '../../../../stores/votersList';
import ImportVotersDialog from '~/components/election/ImportVotersDialog.vue';

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
