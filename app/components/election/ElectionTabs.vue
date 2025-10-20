<template>
  <div class="election-candidates p-1 border border-gray-200 rounded-lg">
    <div v-if="flattenedCandidates.length === 0" class="text-center p-6 text-gray-500">
      No candidates have registered for this election yet.
    </div>
    <DataTable v-else
              :value="flattenedCandidates" 
              rowGroupMode="rowspan" 
              groupRowsBy="position.title"
              sortMode="single" 
              sortField="position.order"
              :sortOrder="1"
              :paginator="flattenedCandidates.length > 5" 
              :rows="15" 
              :rowsPerPageOptions="[15, 20, 25]" 
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
            <Avatar :image="data.photo || 'https://via.placeholder.com/40'" 
                   shape="circle" 
                   size="large" 
                   class="bg-gray-100" />
            <div>
              <div class="font-medium">{{ data.name }}</div>
            </div>
          </div>
        </template>
      </Column>

      <Column field="party" header="Party" style="min-width: 250px">
        <template #body="{ data }">
          <div class="line-clamp-2">
            {{ data.partylist?.name || 'Independent' }}
          </div>
        </template>
      </Column>
      
      <Column field="platform" header="Platform" style="min-width: 180px">
        <template #body="{ data }">
          <div class="line-clamp-2">
            {{ data.platform || 'No platform information available' }}
          </div>
        </template>
      </Column>
      
      <Column header="Actions" style="width: 120px">
        <template #body="{ data }">
          <Button icon="pi pi-user" 
                  class="p-button-sm p-button-text"
                  @click="$emit('view-candidate', data.id)"
                  v-tooltip.top="'View Profile'" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed, ref } from 'vue';

const props = defineProps({
  groupedCandidates: {
    type: Array,
    required: true,
    default: () => []
  },
  flattenedCandidates: {
    type: Array,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

console.log('flattenedCandidates', props.flattenedCandidates);
console.log('groupedCandidates', props.groupedCandidates);

const emit = defineEmits(['view-candidate']);

// Status severity mapping
const getStatusSeverity = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'success';
    case 'inactive':
      return 'danger';
    case 'pending':
      return 'warning';
    default:
      return 'info';
  }
};
</script>

