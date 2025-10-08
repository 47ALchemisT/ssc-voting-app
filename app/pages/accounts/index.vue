<template>
  <div class="pb-6">
    <AppBreadCrumbs :home="home" :items="items" />
    <div class="flex justify-between items-center mb-6">
      <div>
          <h1 class="text-xl font-medium text-gray-800">Profile Information</h1>
          <p class="text-sm text-gray-500">View and edit your profile information</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <i class="pi pi-spin pi-spinner text-2xl text-blue-500"></i>
      <p class="mt-2 text-gray-600">Loading users...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div class="flex items-center">
        <i class="pi pi-exclamation-triangle text-red-500 mr-2"></i>
        <span class="text-red-700">{{ error }}</span>
      </div>
    </div>

    <!-- Search and Table -->
    <div v-else>
      <!-- Search and Filter Bar -->
      <div class="flex flex-col sm:flex-row justify-between gap-4 mb-4">
        <div >
          <IconField class="w-72">
            <InputIcon class="pi pi-search" />
            <InputText size="small" v-model="searchQuery" placeholder="Search..." class="w-full" />
          </IconField>
        </div>
        <div class="w-full sm:w-44">
          <Dropdown 
            size="small"
            v-model="selectedCollege" 
            :options="colleges" 
            optionLabel="college_name" 
            optionValue="id"
            placeholder="Filter college"
            :showClear="false"
            class="w-full"
          >
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex items-center">
                <img 
                  v-if="getCollegeLogo(slotProps.value)" 
                  :src="getCollegeLogo(slotProps.value)" 
                  :alt="getCollegeName(slotProps.value)"
                  class="w-6 h-6 rounded-full object-cover mr-2"
                />
                <div>{{ getCollegeName(slotProps.value) }}</div>
              </div>
              <span v-else>
                {{ slotProps.placeholder }}
              </span>
            </template>
            <template #option="slotProps">
              <div class="flex items-center">
                <img 
                  v-if="slotProps.option.college_logo" 
                  :src="slotProps.option.college_logo" 
                  :alt="slotProps.option.college_name"
                  class="w-6 h-6 rounded-full object-cover mr-2"
                />
                <div>{{ slotProps.option.alias }}</div>
              </div>
            </template>
          </Dropdown>
        </div>
      </div>
      
      <!-- Users Table -->
      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <!-- Empty State -->
        <div v-if="filteredUsers.length === 0" class="text-center py-12">
          <i class="pi pi-search text-4xl text-gray-400 mb-3" />
          <h3 class="text-lg font-medium text-gray-700 mb-1">No users found</h3>
          <p class="text-gray-500">
            {{ searchQuery ? 'Try a different search term' : 'No users available' }}
          </p>
        </div>
        
        <!-- DataTable -->
        <DataTable 
          v-else
          :value="filteredUsers" 
          :paginator="true" 
          :rows="10"
          :rowsPerPageOptions="[5, 10, 20]"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users"
          class="p-datatable-sm"
      >
        <Column field="full_name" header="Name" :sortable="true">
          <template #body="{ data }">
            <div class="flex items-center">
              <Avatar 
                :image="data.avatar_url || 'https://via.placeholder.com/40'" 
                :label="!data.avatar_url ? data.first_name?.charAt(0) + data.last_name?.charAt(0) : null"
                class="mr-3"
                shape="circle"
              />
              <div>
                <div class="font-medium text-gray-900">{{ data.first_name }} {{ data.last_name }}</div>
                <div class="text-sm text-gray-500">
                  <span v-if="data.is_admin === 1" class="text-gray-600 text-xs">Admin</span>
                  <span v-else-if="data.is_admin === 2" class="text-gray-600 text-xs">Candidate</span>
                  <span v-else class="text-gray-600 text-xs">User</span>
                </div>
              </div>
            </div>
          </template>
        </Column>

        <Column field="college" header="College" :sortable="true">
          <template #body="{ data }">
            <div class="text-gray-700">{{ data.colleges?.college_name || 'N/A' }}</div>
          </template>
        </Column>

        <Column field="school_number" header="School ID" :sortable="true" />

        <Column field="status" header="Status">
          <template #body="{ data }" >
            <Tag v-if="data.status === 1" value="Active" severity="success"></Tag>
            <Tag v-else value="Deactivated" severity="danger"></Tag>
          </template>
        </Column>
        
        <Column header="Actions" style="width: 150px">
          <template #body="{ data }">
            <div class="flex space-x-2">
              <Button 
                v-if="data.status === 1"
                icon="pi pi-user-minus" 
                class="p-button-sm p-button-text p-button-warning"
                @click="confirmDelete(data)"
                v-tooltip.top="'Deactivate User'"
              />
              <Button 
                v-else
                icon="pi pi-user-plus" 
                class="p-button-sm p-button-text p-button-success"
                @click="confirmActivate(data)"
                v-tooltip.top="'Activate User'"
              />
            </div>
          </template>
        </Column>
      </DataTable>
      </div>
    </div>

    <!-- Deactivation Confirmation Dialog -->
    <Dialog 
      v-model:visible="deleteDialog.visible" 
      header="Confirm Deactivation" 
      :modal="true"
      :style="{ width: '450px' }"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle text-yellow-500 mr-3" style="font-size: 2rem" />
        <span>
          Are you sure you want to deactivate <b>{{ deleteDialog.userName }}</b>?
          <span class="block text-sm text-gray-600 mt-1">This will prevent the user from logging in.</span>
        </span>
      </div>
      <template #footer>
        <Button 
          label="Cancel" 
          icon="pi pi-times" 
          class="p-button-text" 
          @click="deleteDialog.visible = false" 
          :disabled="deleteDialog.loading"
        />
        <Button 
          label="Deactivate" 
          icon="pi pi-user-minus" 
          class="p-button-warning" 
          @click="deactivateUser" 
          :loading="deleteDialog.loading"
        />
      </template>
    </Dialog>

    <!-- Activation Confirmation Dialog -->
    <Dialog 
      v-model:visible="activateDialog.visible" 
      header="Confirm Activation" 
      :modal="true"
      :style="{ width: '450px' }"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-circle text-green-500 mr-3" style="font-size: 2rem" />
        <span>
          Are you sure you want to activate <b>{{ activateDialog.userName }}</b>?
          <span class="block text-sm text-gray-600 mt-1">This will allow the user to log in again.</span>
        </span>
      </div>
      <template #footer>
        <Button 
          label="Cancel" 
          icon="pi pi-times" 
          class="p-button-text" 
          @click="activateDialog.visible = false" 
          :disabled="activateDialog.loading"
        />
        <Button 
          label="Activate" 
          icon="pi pi-check" 
          class="p-button-success" 
          @click="activateUser" 
          :loading="activateDialog.loading"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../../stores/auth';
import {useColleges} from '../../../stores/colleges';
import { useToast } from 'primevue/usetoast';
import AppBreadCrumbs from '~/components/AppBreadCrumbs.vue';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';

definePageMeta({
    layout: 'dashboard-layout',
    middleware: 'auth'
})

const home = ref({
    label: 'Dashboard',
    icon: 'pi pi-home',
    route: '/dashboard'
});

const items = ref([
    { label: 'Accounts', icon: 'pi pi-user' },
]);

const authStore = useAuthStore();
const toast = useToast();
const collegeStore = useColleges();

// State
const users = computed(() => {
  // Ensure users have consistent college data structure
  return authStore.users.map(user => ({
    ...user,
    // Ensure college_id is always available, either directly or from nested college object
    college_id: user.college_id || user.colleges?.id
  }));
});
const colleges = computed(() => [
  { id: null, college_name: 'All Colleges', alias: 'All' },
  ...collegeStore.colleges
]);
const loading = computed(() => authStore.loading || collegeStore.loading);
const error = ref(null);
const searchQuery = ref('');
const selectedCollege = ref(null); // null will represent 'All Colleges'
const deleteDialog = ref({
  visible: false,
  loading: false,
  userId: null,
  userName: ''
});

const activateDialog = ref({
  visible: false,
  loading: false,
  userId: null,
  userName: ''
});

// Computed
const filteredUsers = computed(() => {
  let result = [...users.value];
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase().trim();
    result = result.filter(user => {
      const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
      const collegeName = user.colleges?.college_name?.toLowerCase() || '';
      
      return fullName.includes(query) ||
             user.email?.toLowerCase().includes(query) ||
             user.school_number?.toLowerCase().includes(query) ||
             collegeName.includes(query);
    });
  }
  
  // Apply college filter (skip if 'All Colleges' is selected)
  if (selectedCollege.value !== null) {
    result = result.filter(user => {
      // Handle both direct college_id and nested college object
      const userCollegeId = user.college_id || user.colleges?.id;
      return userCollegeId == selectedCollege.value; // Use == for loose comparison in case types differ
    });
  }
  
  return result;
});

// Methods
const fetchUsers = async () => {
  try {
    const { error: fetchError } = await authStore.fetchAllUsers();
    if (fetchError) throw new Error(fetchError);
  } catch (err) {
    console.error('Failed to fetch users:', err);
    error.value = 'Failed to load users. Please try again.';
  }
};

const fetchColleges = async () => {
  try {
    const { data, error: fetchError } = await collegeStore.getColleges();
    if (fetchError) throw new Error(fetchError);
    return data;
  } catch (err) {
    console.error('Failed to fetch colleges:', err);
    error.value = 'Failed to load colleges. Please try again.';
    return [];
  }
};

const getCollegeLogo = (collegeId) => {
  const college = colleges.value.find(c => c.id === collegeId);
  return college?.college_logo || null;
};

const getCollegeName = (collegeId) => {
  const college = colleges.value.find(c => c.id === collegeId);
  return college?.college_name || 'Unknown College';
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const editUser = (user) => {
  // Navigate to edit page or open edit dialog
  console.log('Edit user:', user);
  // navigateTo(`/accounts/${user.id}/edit`);
};

const confirmDelete = (user) => {
  deleteDialog.value = {
    visible: true,
    loading: false,
    userId: user.user_id,
    userName: `${user.first_name} ${user.last_name}`
  };
};

const confirmActivate = (user) => {
  activateDialog.value = {
    visible: true,
    loading: false,
    userId: user.user_id,
    userName: `${user.first_name} ${user.last_name}`
  };
};

const activateUser = async () => {
  try {
    activateDialog.value.loading = true;
    
    // Call the activateUser method from the auth store
    const { error } = await authStore.activateUser(activateDialog.value.userId);
    
    if (error) throw error;
    
    // Refresh the users list to reflect the changes
    await fetchUsers();
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'User activated successfully',
      life: 3000
    });
    
    activateDialog.value.visible = false;
  } catch (err) {
    console.error('Failed to activate user:', err);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err.message || 'Failed to activate user',
      life: 3000
    });
  } finally {
    activateDialog.value.loading = false;
  }
};

const deactivateUser = async () => {
  try {
    deleteDialog.value.loading = true;
    
    // Call the deactivateUser method from the auth store
    const { error } = await authStore.deactivateUser(deleteDialog.value.userId);
    
    if (error) throw error;
    
    // Refresh the users list to reflect the changes
    await fetchUsers();
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'User deactivated successfully',
      life: 3000
    });
    
    deleteDialog.value.visible = false;
  } catch (err) {
    console.error('Failed to deactivate user:', err);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err.message || 'Failed to deactivate user',
      life: 3000
    });
  } finally {
    deleteDialog.value.loading = false;
  }
};

// Lifecycle
onMounted(() => {
  fetchUsers();
  fetchColleges();
});
</script>

<style scoped>
.confirmation-content {
  display: flex;
  align-items: center;
}

:deep(.p-datatable) {
  font-size: 0.9rem;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: #f9fafb;
  color: #4b5563;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}
</style>