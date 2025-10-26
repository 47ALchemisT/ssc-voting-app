<template>
    <div>
      <AppBreadCrumbs :home="home" :items="items" />
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-xl font-semibold text-gray-800">Positions Management</h1>
          <p class="text-gray-500 text-sm">Create and manage positions available for elections</p>
        </div>
        <Button 
          label="Add Position" 
          icon="pi pi-plus" 
          size="small"
          @click="openNew" 
        />
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="py-6">
        <Loader />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <i class="pi pi-exclamation-circle text-red-500 text-xl"></i>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div v-else>

        <!-- Positions DataTable -->
         <div class="p-1 rounded-lg border border-gray-200">
          <DataTable
            :value="positions"
            data-key="id"
            :paginator="true"
            :rows="10"
            :rowsPerPageOptions="[5,10,20]"
            size="small"
            :loading="loading"
            tableStyle="min-width: 40rem"
          >
            <Column field="order" header="Order" sortable style="width: 8rem;">
              <template #body="{ data }">
                {{ data.order }}
              </template>
            </Column>
            <Column field="title" header="Title" sortable></Column>
            <Column field="description" header="Description">
              <template #body="{ data }">
                <span>{{ data.description || '—' }}</span>
              </template>
            </Column>
            <Column field="max_candidate" header="Max Candidate" style="width: 10rem;">
              <template #body="{ data }">
                {{ data.max_candidate || '—' }}
              </template>
            </Column>
            <Column field="college_can_vote" header="College" style="width: 10rem;">
              <template #body="{ data }">
                <span v-if="data.college">{{ data.college.alias || data.college.college_name }}</span>
                <span v-else>All Colleges</span>
              </template>
            </Column>
            <Column header="Actions" style="width: 10rem;">
              <template #body="{ data }">
                <div class="flex gap-2">
                  <Button
                    icon="pi pi-pencil"
                    severity="info"
                    size="small"
                    text
                    rounded
                    @click="editPosition(data)"
                    v-tooltip.top="'Edit Position'"
                  />
                  <Button
                    icon="pi pi-trash"
                    severity="danger"
                    size="small"
                    text
                    rounded
                    @click="confirmDelete(data)"
                    v-tooltip.top="'Delete Position'"
                  />
                </div>
              </template>
            </Column>

            <template #empty>
              <div class="p-8 text-center">
                <div class="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <i class="pi pi-briefcase text-gray-400 text-2xl"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-1">No positions yet</h3>
                <p class="text-gray-500 mb-6">Create your first position to get started.</p>
                <Button
                  label="Add Position"
                  icon="pi pi-plus"
                  size="small"
                  @click="openNew"
                />
              </div>
            </template>
          </DataTable>
        </div>
      </div>

      <!-- Add Position Dialog -->
      <Dialog 
        v-model:visible="positionDialog" 
        :style="{width: '450px'}" 
        :header="isEditing ? 'Edit Position' : 'Add New Position'" 
        :modal="true" 
        class="p-fluid"
      >
        <div class="mb-3">
          <label for="title">Title <span class="text-red-500">*</span></label>
          <InputText 
            id="title" 
            v-model.trim="newPosition.title" 
            required="true"
            fluid
            autofocus 
            class="mt-1"
            placeholder="Enter position title"
            :class="{'p-invalid': submitted && !newPosition.title}" 
          />
          <small class="p-error" v-if="submitted && !newPosition.title">Title is required.</small>
        </div>

        <div class="mb-3">
          <label for="description">Description</label>
          <Textarea 
            id="description" 
            v-model="newPosition.description" 
            rows="3" 
            class="mt-1"
            placeholder="Short description of the position"
            fluid
          />
        </div>

        <div class="mb-3">
          <label for="order">Order <span class="text-red-500">*</span></label>
          <small class="block text-gray-500 mb-1">Order represents the hierarchy of positions (highest to lowest).</small>
          <InputNumber 
            id="order" 
            v-model="newPosition.order" 
            :min="1" 
            :class="{'p-invalid': submitted && !newPosition.order}"
            fluid
            class="mt-1"
          />
          <small class="p-error" v-if="submitted && !newPosition.order">Order is required.</small>
        </div>

        <div class="mb-3">
          <label for="max_candidate">Max Candidate <span class="text-red-500">*</span></label>
          <small class="block text-gray-500 mb-1">Set how many candidates a voter can select for this position.</small>
          <InputNumber
            id="max_candidate" 
            v-model="newPosition.max_candidate" 
            :min="1" 
            :class="{'p-invalid': submitted && !newPosition.max_candidate}"
            fluid
            class="mt-1"
          />
          <small class="p-error" v-if="submitted && !newPosition.max_candidate">Max candidate is required.</small>
        </div>

        <div class="mb-3">
          <label for="college_can_vote">College (Optional)</label>
          <small class="block text-gray-500 mb-1">Select a college if this position is specific to that college only.</small>
          <Dropdown
            id="college_can_vote"
            v-model="newPosition.college_can_vote"
            :options="[{ id: null, college_name: 'All Colleges' }, ...collegeStore.colleges]"
            optionLabel="college_name"
            optionValue="id"
            placeholder="Select College"
            class="w-full mt-1"
            :class="{'p-invalid': submitted && !newPosition.college_can_vote}"
          >
            <template #value="slotProps">
              <div v-if="slotProps.value">
                {{ getCollegeName(slotProps.value) || 'All Colleges' }}
              </div>
              <span v-else>
                {{ slotProps.placeholder }}
              </span>
            </template>
            <template #option="slotProps">
              <div>{{ slotProps.option.college_name || 'All Colleges' }}</div>
            </template>
          </Dropdown>
        </div>

        <template #footer>
          <Button 
            label="Cancel" 
            severity="secondary"
            size="small"
            @click="hideDialog"
          />
          <Button 
            label="Save" 
            size="small"
            @click="savePosition" 
            :loading="loading"
          />
        </template>
      </Dialog>

      <!-- Delete Confirmation Dialog -->
      <Dialog
        v-model:visible="deleteDialog"
        :style="{width: '450px'}"
        header="Confirm Delete"
        :modal="true"
      >
        <div class="flex items-start">
          <i class="pi pi-exclamation-triangle text-red-500 text-2xl mr-3"></i>
          <div>
            <p class="mb-2">Are you sure you want to delete this position?</p>
            <p class="font-semibold">{{ positionToDelete?.title }}</p>
            <p class="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
          </div>
        </div>
        <template #footer>
          <Button
            label="Cancel"
            severity="secondary"
            size="small"
            @click="deleteDialog = false"
          />
          <Button
            label="Delete"
            severity="danger"
            size="small"
            @click="handleDelete"
            :loading="loading"
          />
        </template>
      </Dialog>

    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed, watch } from 'vue';
  import { useColleges } from '../../../stores/colleges';
  import { usePositionStore } from '../../../stores/positions';
  import Button from 'primevue/button';
  import Dialog from 'primevue/dialog';
  import InputText from 'primevue/inputtext';
  import Textarea from 'primevue/textarea';
  import InputNumber from 'primevue/inputnumber';
  import DataTable from 'primevue/datatable';
  import Column from 'primevue/column';
  import AppBreadCrumbs from '~/components/AppBreadCrumbs.vue';
  import Loader from '~/components/Loader.vue';

  definePageMeta({
    layout: 'dashboard-layout',
    middleware: 'auth'
  })
  
  const positionStore = usePositionStore();
  const collegeStore = useColleges();
  const toast = useToast();
  const loading = ref(false);
  const error = ref(null);
  const positionDialog = ref(false);
  const deleteDialog = ref(false);
  const positionToDelete = ref(null);
  const submitted = ref(false);
  const isEditing = ref(false);
  const home = ref({
      label: 'Dashboard',
      icon: 'pi pi-home',
      route: '/dashboard'
  });

  const items = ref([
      { label: 'Positions', icon: 'pi pi-list'},
  ]);
  const newPosition = ref({
    id: null,
    title: '',
    description: '',
    order: 1,
    max_candidate: 1,
    college_can_vote: null
  });
  
  // Load positions when component mounts
  onMounted(async () => {
    loading.value = true;
    error.value = null;
    try {
      await positionStore.getPositions();
    } catch (e) {
      console.error('Failed to load positions:', e);
      error.value = 'Failed to load positions. Please try again.';
    } finally {
      loading.value = false;
    }
  });
  
  const openNew = async () => {
    newPosition.value = {
      id: null,
      title: '',
      description: '',
      order: positions.value.length > 0 ? Math.max(...positions.value.map(p => p.order || 0)) + 1 : 1,
      max_candidate: 1,
      college_can_vote: null
    };
    submitted.value = false;
    positionDialog.value = true;
    isEditing.value = false;
    updateInitialOrder();
  
    // Fetch colleges if not already loaded
    if (collegeStore.colleges.length === 0) {
      await collegeStore.getColleges();
    }
  };

  const editPosition = async (positionData) => {
    // Reset the form and set all position data including college_can_vote
    newPosition.value = {
      id: positionData.id,
      title: positionData.title,
      description: positionData.description || '',
      order: positionData.order,
      max_candidate: positionData.max_candidate || 1,
      college_can_vote: positionData.college_can_vote || null
    };
    
    // Clear any previous submission state
    submitted.value = false;
    positionDialog.value = true;
    
    // Set dialog title for editing
    isEditing.value = true;
  
    // Fetch colleges if not already loaded
    if (collegeStore.colleges.length === 0) {
      await collegeStore.getColleges();
    }
  };

  const hideDialog = () => {
    positionDialog.value = false;
    submitted.value = false;
    isEditing.value = false;
  };

  const savePosition = async () => {
    submitted.value = true;
    
    // Basic validation
    if (!newPosition.value.title || !newPosition.value.order) {
      loading.value = false;
      return;
    }
    
    loading.value = true;
    error.value = null;
    
    try {
      let result;
      const isEditing = !!newPosition.value.id;
      
      if (isEditing) {
        // Update existing position
        const { id, ...updates } = newPosition.value;
        result = await positionStore.updatePosition(id, updates);
      } else {
        // Create new position
        result = await positionStore.addPosition(
          newPosition.value.title,
          newPosition.value.description,
          newPosition.value.order,
          newPosition.value.max_candidate,
          newPosition.value.college_can_vote
        );
      }
  
      if (!result.error) {
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: `Position ${isEditing ? 'updated' : 'created'} successfully`,
          life: 3000
        });
        
        // Close dialog and reset form
        hideDialog();
        
        // Refresh the positions list
        await positionStore.getPositions();
      } else {
        console.error('Error saving position:', result.error);
        error.value = `Failed to ${isEditing ? 'update' : 'add'} position. Please try again.`;
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to ${isEditing ? 'update' : 'add'} position`,
          life: 5000
        });
      }
    } catch (e) {
      console.error('Unexpected error:', e);
      error.value = 'An unexpected error occurred. Please try again.';
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'An unexpected error occurred',
        life: 5000
      });
    } finally {
      loading.value = false;
    }
  };

  const confirmDelete = (position) => {
    positionToDelete.value = position;
    deleteDialog.value = true;
  };

  const handleDelete = async () => {
    if (!positionToDelete.value) return;
    
    loading.value = true;
    try {
      const { error: deleteError } = await positionStore.deletePosition(positionToDelete.value.id);
      
      if (!deleteError) {
        deleteDialog.value = false;
        positionToDelete.value = null;
      } else {
        console.error('Error deleting position:', deleteError);
        error.value = 'Failed to delete position. Please try again.';
      }
    } catch (e) {
      console.error('Unexpected error:', e);
      error.value = 'Unexpected error deleting position.';
    } finally {
      loading.value = false;
    }
  };
  
  // Access positions from the store with null check
  const positions = computed(() => positionStore.positions || []);
  
  // Set initial order to 1 or max order + 1 if positions exist
  const updateInitialOrder = () => {
    if (positions.value && positions.value.length > 0) {
      const maxOrder = Math.max(...positions.value.map(p => p.order || 0));
      newPosition.value.order = maxOrder + 1;
    } else {
      newPosition.value.order = 1;
    }
  };
  
  // Helper function to get college name by ID
  const getCollegeName = (collegeId) => {
    if (!collegeId) return 'All Colleges';
    const college = collegeStore.colleges.find(c => c.id === collegeId);
    return college ? college.college_name : 'Unknown College';
  };

  // Update order when positions change
  watch(positions, () => {
    updateInitialOrder();
  }, { immediate: true });
  </script>