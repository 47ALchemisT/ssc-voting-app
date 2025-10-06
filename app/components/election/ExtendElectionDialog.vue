<template>
  <Dialog
    :visible="visible"
    @update:visible="val => $emit('update:visible', val)"
    header="Extend Election Duration"
    :closable="false"
    :modal="true"
    :style="{ width: '450px' }"
  >
    <div class="p-fluid">
      <div class="field">
        <label for="daysToAdd">Number of days to add</label>
        <InputNumber
          id="daysToAdd"
          :modelValue="daysToAdd"
          @update:modelValue="(val) => daysToAdd = val"
          :min="1"
          :max="30"
          showButtons
          :step="1"
          class="w-full my-2"
          inputClass="w-full"
          @input="updateDays"
        />
      </div>
      <div class="field">
        <label class="text-sm text-gray-600">New End Date: {{ newEndDateFormatted }}</label>
      </div>
    </div>

    <template #footer>
      <Button
        label="Close"
        class="p-button-text"
        :disabled="loading"
        @click="closeDialog"
      />
      <Button
        label="Extend Election"
        icon="pi pi-calendar-plus"
        :loading="loading"
        @click="extendElection"
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

const emit = defineEmits(['update:modelValue', 'extended', 'cancel']);

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const electionStore = useElectionStore();
const toast = useToast();

const loading = ref(false);
const daysToAdd = ref(3);

const currentEndDate = computed(() => new Date(props.election.end_date));

const newEndDate = computed(() => {
  const date = new Date(currentEndDate.value);
  date.setDate(date.getDate() + daysToAdd.value);
  return date;
});

const newEndDateFormatted = computed(() => {
  return newEndDate.value.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

const closeDialog = () => {
  visible.value = false;
  emit('cancel');
};

const extendElection = async () => {
  try {
    loading.value = true;
    const { error } = await electionStore.extendElectionEndDate(
      props.election.id,
      newEndDate.value.toISOString()
    );

    if (error) throw error;

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Election duration has been extended',
      life: 3000
    });

    emit('extended');
    visible.value = false;
  } catch (error) {
    console.error('Error extending election:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to extend election duration',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};
</script>
