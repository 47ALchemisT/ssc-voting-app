<template>
    <div class="container mx-auto p-4">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Positions Management</h1>
        <Button 
          label="Add Position" 
          icon="pi pi-plus" 
          @click="openNew" 
          class="p-button-primary"
        />
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
  
      <!-- Positions List -->
      <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <ul class="divide-y divide-gray-200">
          <li v-for="position in positions" :key="position.id" class="px-4 py-4 sm:px-6">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-medium text-gray-900">{{ position.title }}</h3>
                <p class="text-sm text-gray-500">{{ position.description }}</p>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  Order: {{ position.order }}
                </span>
              </div>
            </div>
          </li>
          <li v-if="positions.length === 0" class="px-4 py-4 sm:px-6 text-center text-gray-500">
            No positions found. Add one above to get started.
          </li>
        </ul>
      </div>
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

  definePageMeta({
    layout: 'dashboard-layout',
    middleware: 'auth'
  })
  
  const positionStore = usePositionStore();
  const loading = ref(false);
  const positionDialog = ref(false);
  const submitted = ref(false);
  const newPosition = ref({
    title: '',
    description: '',
    order: 1
  });
  
  // Load positions when component mounts
  onMounted(async () => {
    loading.value = true;
    await positionStore.getPositions();
    loading.value = false;
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
        newPosition.value.order
      );
  
      if (!error) {
        positionDialog.value = false;
        // Refresh the positions list
        await positionStore.getPositions();
      } else {
        console.error('Error adding position:', error);
      }
    } catch (e) {
      console.error('Unexpected error:', e);
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