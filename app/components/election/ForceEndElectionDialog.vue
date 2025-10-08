<template>
    <Dialog
      :visible="visible"
      @update:visible="val => $emit('update:modelValue', val)"
      header="Force End Election"
      :closable="false"
      :modal="true"
      :style="{ width: '450px' }"
    >
      <div class="p-fluid">
        <div class="text-center mb-4">
          <i class="pi pi-exclamation-triangle text-5xl text-yellow-500 mb-3"></i>
          <h3 class="text-xl font-medium mb-2">Are you sure?</h3>
          <p class="text-gray-600">
            This action will immediately end the election and no further votes will be accepted.
            This cannot be undone.
          </p>
        </div>
      </div>
  
      <template #footer>
        <Button
          label="Cancel"
          class="p-button-text"
          :disabled="loading"
          @click="closeDialog"
        />
        <Button
          label="End Election"
          icon="pi pi-stop-circle"
          class="p-button-danger"
          :loading="loading"
          @click="forceEndElection"
        />
      </template>
    </Dialog>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import { useElectionStore } from '../../../stores/elections';
  import { useToast } from 'primevue/usetoast';
  
  const props = defineProps({
    election: {
      type: Object,
      required: true
    },
    modelValue: {
      type: Boolean,
      default: false
    }
  });
  
  const emit = defineEmits(['update:modelValue', 'force-end', 'cancel']);
  
  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  });
  
  const electionStore = useElectionStore();
  const toast = useToast();
  const loading = ref(false);
  
  const closeDialog = () => {
    visible.value = false;
    emit('cancel');
  };
  
  const forceEndElection = async () => {
    try {
      loading.value = true;
      const { error } = await electionStore.forceEndElection(props.election.id);
  
      if (error) throw error;
  
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Election has been ended successfully',
        life: 3000
      });
  
      emit('force-end');
      visible.value = false;
    } catch (error) {
      console.error('Error ending election:', error);
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to end election',
        life: 3000
      });
    } finally {
      loading.value = false;
    }
  };
  </script>