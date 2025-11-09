<template>
  <Dialog
    v-model:visible="localVisible"
    modal
    :draggable="false"
    header="Update Election"
    :style="{ width: '30rem' }"
    @hide="resetForm"
  >
    <div class="space-y-4">
      <div class="flex flex-col gap-2">
        <label for="title" class="font-semibold">Title</label>
        <InputText 
          v-model="formData.title" 
          id="title" 
          placeholder="Enter election title" 
          class="w-full" 
          :class="{ 'p-invalid': errors.title }"
        />
        <small v-if="errors.title" class="p-error">{{ errors.title }}</small>
      </div>

      <div class="flex flex-col gap-2">
        <label for="description" class="font-semibold">Description</label>
        <Textarea 
          v-model="formData.description" 
          id="description" 
          rows="3" 
          placeholder="Enter description" 
          class="w-full" 
        />
      </div>

      <div class="flex flex-col gap-2">
        <label for="startDate" class="font-semibold">Start Date</label>
        <Calendar 
          v-model="formData.startDate" 
          id="startDate" 
          showIcon 
          class="w-full" 
          :class="{ 'p-invalid': errors.startDate }"
          dateFormat="mm/dd/yy"
          :timeOnly="false"
          showTime
          hourFormat="12"
          :showSeconds="false"
          :stepMinute="15"
          placeholder="Select date and time"
          showButtonBar
        />
        <small v-if="errors.startDate" class="p-error">{{ errors.startDate }}</small>
      </div>

      <div class="flex flex-col gap-2">
        <label for="endDate" class="font-semibold">End Date</label>
        <Calendar 
          v-model="formData.endDate" 
          id="endDate" 
          showIcon 
          class="w-full" 
          :class="{ 'p-invalid': errors.endDate }"
          dateFormat="mm/dd/yy"
          :timeOnly="false"
          showTime
          hourFormat="12"
          :showSeconds="false"
          :stepMinute="15"
          :minDate="formData.startDate || new Date()"
          placeholder="Select date and time"
          showButtonBar
        />
        <small v-if="errors.endDate" class="p-error">{{ errors.endDate }}</small>
      </div>
    </div>

    <!-- Footer Actions -->
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button 
          label="Cancel" 
          size="small"
          severity="secondary" 
          @click="closeDialog" 
          :disabled="loading"
        />
        <Button 
          label="Update" 
          size="small"
          icon="pi pi-check" 
          @click="updateElection"
          :loading="loading"
          :disabled="!isFormValid"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useElectionStore } from '../../../../stores/elections';

const props = defineProps({
  visible: Boolean,
  election: {
    type: Object,
    default: () => ({
      title: '',
      description: '',
      start_date: null,
      end_date: null
    })
  }
});

const emit = defineEmits(['update:visible', 'updated']);

const localVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
});

const electionStore = useElectionStore();
const toast = useToast();
const loading = ref(false);
const errors = ref({});

const formData = ref({
  title: '',
  description: '',
  startDate: null,
  endDate: null
});

// Form validation
const validateForm = () => {
  const newErrors = {};
  
  if (!formData.value.title.trim()) {
    newErrors.title = 'Title is required';
  }
  
  if (!formData.value.startDate) {
    newErrors.startDate = 'Start date is required';
  }
  
  if (!formData.value.endDate) {
    newErrors.endDate = 'End date is required';
  } else if (formData.value.startDate && formData.value.endDate < formData.value.startDate) {
    newErrors.endDate = 'End date must be after start date';
  }
  
  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
};

const isFormValid = computed(() => {
  return formData.value.title.trim() && 
         formData.value.startDate && 
         formData.value.endDate &&
         formData.value.endDate >= formData.value.startDate;
});

// Initialize form data with current election data
const initFormData = () => {
  if (props.election) {
    formData.value = {
      title: props.election.title || '',
      description: props.election.description || '',
      startDate: props.election.start_date ? new Date(props.election.start_date) : null,
      endDate: props.election.end_date ? new Date(props.election.end_date) : null
    };
  }
};

// Watch for election prop changes to update form data
watch(() => props.election, () => {
  initFormData();
}, { immediate: true, deep: true });

const closeDialog = () => {
  localVisible.value = false;
  resetForm();};

const resetForm = () => {
  errors.value = {};
  formData.value = {
    title: '',
    description: '',
    startDate: null,
    endDate: null
  };
};

const updateElection = async () => {
  if (!validateForm()) return;
  
  loading.value = true;
  
  try {
    // Convert dates to UTC ISO strings
    const updateData = {
      title: formData.value.title,
      description: formData.value.description,
      startDate: formData.value.startDate ? new Date(formData.value.startDate).toISOString() : null,
      endDate: formData.value.endDate ? new Date(formData.value.endDate).toISOString() : null
    };
    
    const { data, error } = await electionStore.updateCurrentElection(updateData);
    
    if (error) throw error;
    
    emit('updated', data);
    closeDialog();
  } catch (error) {
    console.error('Error updating election:', error);
  } finally {
    loading.value = false;
  }
};

defineExpose({
  resetForm
});
</script>
