<template>
  <div>
    <div class="mb-4 space-y-4">
        <AppBreadCrumbs :home="home" :items="items" />
        <div class="flex justify-between items-center">
            <div>
                <h2 class="text-lg font-medium text-gray-800">Voters List</h2>
                <p class="text-gray-500 text-sm">List below are the people that are eligible to vote in this election.</p>
            </div>
        </div>
        <div>
            <div class="flex justify-between gap-2">
              <IconField>
                  <InputIcon class="pi pi-search" />
                  <InputText v-model="searchTerm" placeholder="Search" size="small" />
              </IconField>

              <div class="flex items-center gap-2">
                <Button 
                    label="Delete Selected" 
                    icon="pi pi-trash" 
                    severity="danger" 
                    size="small"
                    v-if="authStore.isAdmin && selectedVoters.length > 0"
                    :disabled="!selectedVoters.length" 
                    @click="confirmDeleteSelected" 
                />
                <Button 
                    v-if="authStore.isAdmin"
                    label="Import Voters List"
                    icon="pi pi-upload"
                    @click="showImportDialog = true"
                    size="small"
                />
              </div>
            </div>
        </div>
    </div>

    <div class="rounded-lg border border-gray-200 mb-8 overflow-hidden">
        <DataTable 
          :value="filteredVoters"
          dataKey="id"
          v-model:selection="selectedVoters"
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

          <Column selectionMode="multiple" headerStyle="width:3rem" :exportable="false"></Column>

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
          <Column header="Actions" headerStyle="width:8rem" :exportable="false">
            <template #body="{ data }">
              <div class="flex gap-2">
                <Button icon="pi pi-pencil" size="small" outlined @click="openEdit(data)" />
                <Button icon="pi pi-trash" size="small" severity="danger" outlined @click="confirmDeleteOne(data)" />
              </div>
            </template>
          </Column>
          <template #empty>
            <div class="flex flex-col items-center justify-center py-12 text-gray-500">
              <i class="pi pi-users text-4xl mb-4 text-gray-300"></i>
              <p class="text-lg font-medium mb-2">
                {{ searchTerm ? 'No voters found' : 'No voters yet' }}
              </p>
              <p class="text-sm text-center max-w-md">
                {{ searchTerm 
                  ? 'Try adjusting your search terms or clearing the search to see all voters.' 
                  : 'No voters have been added to this election yet. Import a voters list to get started.' 
                }}
              </p>
              <Button 
                v-if="!searchTerm && authStore.isAdmin"
                label="Import Voters"
                icon="pi pi-upload"
                @click="showImportDialog = true"
                class="mt-4"
                size="small"
              />
            </div>
          </template>
        </DataTable>
    </div>
    <ImportVotersDialog 
      v-model:visible="showImportDialog"
      :election-id="electionId"
      @imported="fetchVoters"
      class="m-6 sm:m-0"
    />

  <Dialog v-model:visible="showEditDialog" modal header="Edit Voter" :style="{ width: '30rem' }">
    <div class="flex flex-col gap-3">
      <div>
        <label class="text-sm text-gray-600">Full name</label>
        <InputText v-model="editForm.fullname" class="w-full" />
      </div>
      <div>
        <label class="text-sm text-gray-600">Email</label>
        <InputText v-model="editForm.reg_email" class="w-full" />
      </div>
      <div>
        <label class="text-sm text-gray-600">College</label>
        <InputText v-model="editForm.college" class="w-full" />
      </div>
      <div>
        <label class="text-sm text-gray-600">School ID</label>
        <InputText v-model="editForm.school_id" class="w-full" />
      </div>
    </div>
    <template #footer>
      <Button label="Cancel" class="p-button-text" @click="showEditDialog = false" />
      <Button label="Save" icon="pi pi-check" @click="saveEdit" :loading="saving" />
    </template>
  </Dialog>

  <Dialog v-model:visible="showConfirmDialog" modal :header="confirmTitle" :style="{ width: '28rem' }">
    <div class="py-2">
      <p class="text-gray-700">{{ confirmMessage }}</p>
    </div>
    <template #footer>
      <Button label="Cancel" class="p-button-text" @click="onCancelConfirm" :disabled="confirming" />
      <Button label="Confirm" icon="pi pi-check" severity="danger" @click="onConfirm" :loading="confirming" />
    </template>
  </Dialog>
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
const selectedVoters = ref([]);
const showEditDialog = ref(false);
const editingId = ref(null);
const saving = ref(false);
const editForm = ref({ fullname: '', reg_email: '', college: '', school_id: '' });
const showConfirmDialog = ref(false);
const confirming = ref(false);
const confirmTitle = ref('Confirm Delete');
const confirmMessage = ref('Are you sure? This action cannot be undone.');
let confirmAction = async () => {};

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

const openEdit = (row) => {
  editingId.value = row.id;
  editForm.value = {
    fullname: row.fullname || '',
    reg_email: row.reg_email || '',
    college: row.college || '',
    school_id: row.school_id || ''
  };
  showEditDialog.value = true;
};

const saveEdit = async () => {
  try {
    saving.value = true;
    const { error } = await votersListStore.updateVoter(editingId.value, editForm.value);
    if (error) throw error;
    showEditDialog.value = false;
    await fetchVoters();
  } catch (err) {
    console.error('Save edit failed:', err);
  } finally {
    saving.value = false;
  }
};

const confirmDeleteOne = async (row) => {
  openConfirm({
    title: 'Delete Voter',
    message: `Delete voter \"${row.fullname || row.reg_email || row.school_id || 'this record'}\"? This action cannot be undone.`,
    action: async () => {
      await votersListStore.deleteVotersByIds(electionId, [row.id]);
      await fetchVoters();
    }
  });
};

const confirmDeleteSelected = async () => {
  const ids = selectedVoters.value.map(v => v.id);
  if (!ids.length) return;
  openConfirm({
    title: 'Delete Selected Voters',
    message: `Delete ${ids.length} selected voter(s)? This action cannot be undone.`,
    action: async () => {
      await votersListStore.deleteVotersByIds(electionId, ids);
      selectedVoters.value = [];
      await fetchVoters();
    }
  });
};

const confirmDeleteAll = async () => {
  if (!voters.value.length) return;
  openConfirm({
    title: 'Delete ALL Voters',
    message: 'Delete ALL voters for this election? This action cannot be undone.',
    action: async () => {
      await votersListStore.deleteAllVoters(electionId);
      selectedVoters.value = [];
      await fetchVoters();
    }
  });
};

function openConfirm({ title, message, action }) {
  confirmTitle.value = title || 'Please Confirm';
  confirmMessage.value = message || 'Are you sure?';
  confirmAction = action || (async () => {});
  showConfirmDialog.value = true;
}

async function onConfirm() {
  try {
    confirming.value = true;
    await confirmAction();
    showConfirmDialog.value = false;
  } catch (e) {
    console.error('Confirmation action failed:', e);
  } finally {
    confirming.value = false;
  }
}

function onCancelConfirm() {
  showConfirmDialog.value = false;
}
</script>
