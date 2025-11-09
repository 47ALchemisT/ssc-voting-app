<template>
  <Dialog 
    :visible="visible" 
    @update:visible="(val) => $emit('update:visible', val)"
    :style="{ width: '450px' }" 
    header="Confirm Deletion" 
    :modal="true"
    :closable="!loading"
    :closeOnEscape="!loading"
  >
    <div class="confirmation-content">
      <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
      <span v-if="election">
        Are you sure you want to delete <b>{{ election.title }}</b>? This action cannot be undone.
      </span>
    </div>
    
    <template #footer>
      <Button 
        label="No" 
        icon="pi pi-times" 
        text 
        @click="closeDialog"
        :disabled="loading"
      />
      <Button 
        label="Yes" 
        icon="pi pi-check" 
        severity="danger"
        :loading="loading"
        @click="confirmDelete" 
      />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useElectionStore } from '../../../../stores/elections';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  election: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:visible', 'deleted']);

const toast = useToast();
const loading = ref(false);

const closeDialog = () => {
  emit('update:visible', false);
};

const electionStore = useElectionStore();

const confirmDelete = async () => {
  if (!props.election) return;
  
  try {
    loading.value = true;
    
    const { data, error } = await electionStore.deleteCurrentElection();
    
    if (error) throw error;
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Election deleted successfully',
      life: 3000
    });
    
    emit('deleted', data);
    closeDialog();
  } catch (error) {
    console.error('Error deleting election:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to delete election',
      life: 5000
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.confirmation-content {
  display: flex;
  align-items: center;
  padding: 1rem 0;
}
</style>
