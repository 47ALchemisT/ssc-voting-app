<template>
  <Dialog
    v-model:visible="localVisible"
    modal
    header="Create Election"
    :style="{ width: '30rem' }"
    @hide="resetForm"
  >
    <div class="space-y-4">
      <div class="flex flex-col gap-2">
        <label for="title" class="font-semibold">Title *</label>
        <InputText 
          v-model="form.title" 
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
          v-model="form.description" 
          id="description" 
          rows="3" 
          placeholder="Enter description" 
          class="w-full" 
        />
      </div>

      <div class="flex flex-col gap-2">
        <label for="startDate" class="font-semibold">Start Date *</label>
        <Calendar 
          v-model="form.startDate" 
          id="startDate" 
          showIcon 
          class="w-full" 
          :class="{ 'p-invalid': errors.startDate }"
          dateFormat="mm/dd/yy"
          :minDate="new Date()"
        />
        <small v-if="errors.startDate" class="p-error">{{ errors.startDate }}</small>
      </div>

      <div class="flex flex-col gap-2">
        <label for="endDate" class="font-semibold">End Date *</label>
        <Calendar 
          v-model="form.endDate" 
          id="endDate" 
          showIcon 
          class="w-full" 
          :class="{ 'p-invalid': errors.endDate }"
          dateFormat="mm/dd/yy"
          :minDate="form.startDate || new Date()"
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
          @click="closeModal" 
          :disabled="submitting"
        />
        <Button 
          label="Create" 
          size="small"
          icon="pi pi-check" 
          @click="submitForm"
          :loading="submitting"
          :disabled="!isFormValid"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useElectionStore } from '../../../../stores/elections'

// Props & Emits
const props = defineProps({
  visible: Boolean
})
const emit = defineEmits(["update:visible", "create"])

const localVisible = computed({
  get: () => props.visible,
  set: (val) => emit("update:visible", val)
})

// Local form state
const form = ref({
  title: "",
  description: "",
  startDate: null,
  endDate: null
})

const submitting = ref(false)
const errors = ref({})

// Form validation
const validateForm = () => {
  const newErrors = {}
  
  if (!form.value.title.trim()) {
    newErrors.title = "Title is required"
  }
  
  if (!form.value.startDate) {
    newErrors.startDate = "Start date is required"
  }
  
  if (!form.value.endDate) {
    newErrors.endDate = "End date is required"
  } else if (form.value.startDate && form.value.endDate < form.value.startDate) {
    newErrors.endDate = "End date must be after start date"
  }
  
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

// Watch for date changes to clear validation errors
watch([() => form.value.startDate, () => form.value.endDate], () => {
  if (errors.value.startDate || errors.value.endDate) {
    validateForm()
  }
})

const isFormValid = computed(() => {
  return form.value.title.trim() && 
         form.value.startDate && 
         form.value.endDate &&
         Object.keys(errors.value).length === 0
})

const closeModal = () => {
  emit("update:visible", false)
}

const resetForm = () => {
  form.value = {
    title: "",
    description: "",
    startDate: null,
    endDate: null
  }
  errors.value = {}
  submitting.value = false
}

const submitForm = async () => {
  if (!validateForm()) return
  
  submitting.value = true
  
  try {
    // Emit the create event with form data - let the parent handle the API call
    emit('create', form.value)
    
    // Close the modal
    closeModal()
  } catch (err) {
    console.error('Error in form submission:', err)
  } finally {
    submitting.value = false
  }
}
</script>