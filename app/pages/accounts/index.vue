<template>
  <div class="">
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

    <!-- Users Table -->
    <div v-else class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <DataTable 
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
                <div class="text-sm text-gray-500">{{ data.role || 'User' }}</div>
              </div>
            </div>
          </template>
        </Column>
        
        <Column field="email" header="Email" :sortable="true">
          <template #body="{ data }">
            <div class="text-gray-700">{{ data.email }}</div>
            <div class="text-xs text-gray-500">ID: {{ data.user_id?.substring(0, 8) }}...</div>
          </template>
        </Column>
        
        <Column field="school_number" header="School ID" :sortable="true" />
        
        <Column field="created_at" header="Joined" :sortable="true">
          <template #body="{ data }">
            {{ formatDate(data.created_at) }}
          </template>
        </Column>
        
        <Column field="last_sign_in" header="Last Active" :sortable="true">
          <template #body="{ data }">
            {{ data.last_sign_in ? formatDate(data.last_sign_in) : 'Never' }}
          </template>
        </Column>
        
        <Column header="Status" :sortable="true" sortField="is_active">
          <template #body="{ data }">
            <Tag 
              :value="data.is_active ? 'Active' : 'Inactive'" 
              :severity="data.is_active ? 'success' : 'danger'"
            />
          </template>
        </Column>
        
        <Column header="Actions" style="width: 120px">
          <template #body="{ data }">
            <div class="flex space-x-2">
              <Button 
                icon="pi pi-pencil" 
                class="p-button-sm p-button-text"
                @click="editUser(data)"
              />
              <Button 
                icon="pi pi-trash" 
                class="p-button-sm p-button-text p-button-danger"
                @click="confirmDelete(data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog 
      v-model:visible="deleteDialog.visible" 
      header="Confirm Delete" 
      :modal="true"
      :style="{ width: '450px' }"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span>
          Are you sure you want to delete <b>{{ deleteDialog.userName }}</b>?
          <span class="block text-sm text-gray-600 mt-1">This action cannot be undone.</span>
        </span>
      </div>
      <template #footer>
        <Button 
          label="No" 
          icon="pi pi-times" 
          class="p-button-text" 
          @click="deleteDialog.visible = false" 
        />
        <Button 
          label="Yes" 
          icon="pi pi-check" 
          class="p-button-danger" 
          @click="deleteUser" 
          :loading="deleteDialog.loading"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../../stores/auth';
import { useToast } from 'primevue/usetoast';

definePageMeta({
    layout: 'dashboard-layout',
    middleware: 'auth'
})

const authStore = useAuthStore();
const toast = useToast();

// State
const users = computed(() => authStore.users);
const loading = computed(() => authStore.loading);
const error = ref(null);
const searchQuery = ref('');
const deleteDialog = ref({
  visible: false,
  loading: false,
  userId: null,
  userName: ''
});

// Computed
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  
  const query = searchQuery.value.toLowerCase();
  return users.value.filter(user => 
    user.first_name?.toLowerCase().includes(query) ||
    user.last_name?.toLowerCase().includes(query) ||
    user.email?.toLowerCase().includes(query) ||
    user.school_number?.toLowerCase().includes(query)
  );
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

const deleteUser = async () => {
  try {
    deleteDialog.value.loading = true;
    
    // Here you would typically call an API to delete the user
    // For now, we'll just remove it from the local state
    users.value = users.value.filter(user => user.user_id !== deleteDialog.value.userId);
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'User deleted successfully',
      life: 3000
    });
    
    deleteDialog.value.visible = false;
  } catch (err) {
    console.error('Failed to delete user:', err);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete user',
      life: 3000
    });
  } finally {
    deleteDialog.value.loading = false;
  }
};

// Lifecycle
onMounted(() => {
  fetchUsers();
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