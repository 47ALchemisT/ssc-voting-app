<template>
  <div>
    <div v-if="loading" class="text-center p-4">
      <ProgressSpinner />
    </div>
    <div v-else-if="error" class="text-red-500 p-4">
      {{ error }}
    </div>
    <div v-else>
      <div class="p-1 border border-gray-200 rounded-lg">
        <DataTable 
          :value="partylists" 
          :paginator="true" 
          :rows="5"
          :rowsPerPageOptions="[5,10,25,50]"
          class="p-datatable-sm"
        >
          <Column field="name" header="Name" sortable></Column>
          <Column field="description" header="Description">
            <template #body="{ data }">
              {{ data.description || '-' }}
            </template>
          </Column>
          <Column field="date_founded" header="Date Founded" sortable>
            <template #body="{ data }">
              {{ formatDate(data.date_founded) }}
            </template>
          </Column>
          <Column field="status" header="Status" sortable>
            <template #body="{ data }">
              <Tag 
                :value="getStatusText(data.status)" 
                :severity="getStatusSeverity(data.status)"
              />
            </template>
          </Column>
          <template #empty>
            <div class="text-center p-4 text-gray-500">
              No partylists found in this category.
            </div>
          </template>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  partylists: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  }
});

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
  });
};

const getStatusText = (status) => {
  switch(status) {
    case 0: return 'Pending';
    case 1: return 'Approved';
    case 2: return 'Rejected';
    default: return 'Unknown';
  }
};

const getStatusSeverity = (status) => {
  switch(status) {
    case 0: return 'warning';
    case 1: return 'success';
    case 2: return 'danger';
    default: return 'info';
  }
};
</script>
