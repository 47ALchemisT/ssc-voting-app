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
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
        <p class="mt-2 text-gray-600">Loading positions...</p>
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
        <!-- Empty State -->
        <div v-if="positions.length === 0" class="bg-white rounded-lg border border-gray-200 p-8 text-center">
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

            <template #empty>
              <div class="py-10 text-center text-gray-500">No positions found.</div>
            </template>
          </DataTable>
        </div>
      </div>

      <!-- Add Position Dialog -->
      <Dialog 
        v-model:visible="positionDialog" 
        :style="{width: '450px'}" 
        header="Position Details" 
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

    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed, watch } from 'vue';
  import { usePositionStore } from '../../../stores/positions';
  import Button from 'primevue/button';
  import Dialog from 'primevue/dialog';
  import InputText from 'primevue/inputtext';
  import Textarea from 'primevue/textarea';
  import InputNumber from 'primevue/inputnumber';
  import DataTable from 'primevue/datatable';
  import Column from 'primevue/column';
  import AppBreadCrumbs from '~/components/AppBreadCrumbs.vue';

  definePageMeta({
    layout: 'dashboard-layout',
    middleware: 'auth'
  })
  
  const positionStore = usePositionStore();
  const loading = ref(false);
  const error = ref(null);
  const positionDialog = ref(false);
  const submitted = ref(false);
  const home = ref({
      label: 'Dashboard',
      icon: 'pi pi-home',
      route: '/dashboard'
  });

  const items = ref([
      { label: 'Positions', icon: 'pi pi-list'},
  ]);
  const newPosition = ref({
    title: '',
    description: '',
    order: 1,
    max_candidate: 1,
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
  
  const openNew = () => {
    newPosition.value = {
      title: '',
      description: '',
      order: positions.value.length > 0 ? Math.max(...positions.value.map(p => p.order || 0)) + 1 : 1
    };
    submitted.value = false;
    positionDialog.value = true;
  };

  const hideDialog = () => {
    positionDialog.value = false;
    submitted.value = false;
  };

  const savePosition = async () => {
    submitted.value = true;
    
    if (!newPosition.value.title || !newPosition.value.order) return;
    
    loading.value = true;
    try {
      const { error } = await positionStore.addPosition(
        newPosition.value.title,
        newPosition.value.description,
        newPosition.value.order,
        newPosition.value.max_candidate
      );
  
      if (!error) {
        positionDialog.value = false;
        // Refresh the positions list
        await positionStore.getPositions();
      } else {
        console.error('Error adding position:', error);
        error.value = 'Failed to add position. Please try again.';
      }
    } catch (e) {
      console.error('Unexpected error:', e);
      error.value = 'Unexpected error adding position.';
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
  
  // Update order when positions change
  watch(positions, () => {
    updateInitialOrder();
  }, { immediate: true });
  </script>