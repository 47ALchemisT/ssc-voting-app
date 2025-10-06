<template>
  <div>
    <Button 
      v-if="!editMode"
      label="Add College" 
      @click="openDialog()" 
      icon="pi pi-plus"
      class="mb-4"
    />
    
    <Dialog 
      v-model:visible="visible" 
      modal 
      :draggable="false"
      :header="editMode ? 'Edit College' : 'Add New College'" 
      :style="{ width: '450px' }"
      :closable="!loading" 
      :closeOnEscape="!loading"
      @hide="resetForm"
    >
      <form @submit.prevent="submitForm" class="p-fluid">
        <div class="mb-3">
          <label for="college_name">College Name *</label>
          <InputText 
            id="college_name"
            v-model="collegeForm.college_name" 
            type="text" 
            placeholder="Enter college name"
            :disabled="loading"
            required
            class="w-full mt-2"
          />
        </div>
        
        <div class="mb-3">
          <label for="alias">Alias *</label>
          <InputText 
            id="alias"
            v-model="collegeForm.alias" 
            type="text" 
            placeholder="Enter college alias"
            :disabled="loading"
            required
            class="w-full mt-2"
          />
        </div>
        
        <div class="mb-3">
          <label for="college_logo">College Logo</label>
          <FileUpload 
            id="college_logo"
            mode="basic"
            :auto="true"
            :chooseLabel="logoFile ? logoFile.name : 'Choose Logo'"
            accept="image/*"
            :maxFileSize="2000000"
            :disabled="loading"
            @select="onFileSelect"
            class="w-full mt-2"
          />
          <small class="text-gray-500">Recommended size: 200x200px. Max size: 2MB</small>
          
          <div v-if="logoPreview" class="mt-2">
            <img :src="logoPreview" class="max-h-20" alt="Logo preview" />
          </div>
        </div>
        
        <div class="flex justify-end gap-2 mt-4">
          <Button 
            type="button" 
            label="Cancel" 
            class="p-button-text"
            :disabled="loading"
            @click="closeDialog"
          />
          <Button 
            type="submit" 
            label="Save College"
            :loading="loading"
            :disabled="!isFormValid"
          />
        </div>
      </form>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useColleges } from '../../../../stores/colleges';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const collegesStore = useColleges();
const props = defineProps({
  college: {
    type: Object,
    default: null
  },
  editMode: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['college-updated', 'college-added']);

const visible = ref(false);
const loading = ref(false);
const logoFile = ref(null);
const logoPreview = ref(null);
const currentCollegeId = ref(null);

const collegeForm = ref({
  college_name: '',
  alias: '',
  logoFile: null
});

const isFormValid = computed(() => {
  return collegeForm.value.college_name?.trim() !== '' && 
         collegeForm.value.alias?.trim() !== '';
});

const onFileSelect = (event) => {
  const file = event.files[0];
  if (!file) return;
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    toast.add({
      severity: 'error',
      summary: 'Invalid File',
      detail: 'Please select an image file',
      life: 3000
    });
    return;
  }
  
  // Validate file size (2MB max)
  if (file.size > 2000000) {
    toast.add({
      severity: 'error',
      summary: 'File Too Large',
      detail: 'Maximum file size is 2MB',
      life: 3000
    });
    return;
  }
  
  logoFile.value = file;
  collegeForm.value.logoFile = file;
  
  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    logoPreview.value = e.target.result;
  };
  reader.readAsDataURL(file);
};

const resetForm = () => {
  collegeForm.value = {
    college_name: '',
    alias: '',
    logoFile: null
  };
  logoFile.value = null;
  logoPreview.value = null;
  currentCollegeId.value = null;
};

const openDialog = (college = null) => {
  if (college) {
    // Edit mode
    currentCollegeId.value = college.id;
    collegeForm.value = {
      college_name: college.college_name,
      alias: college.alias,
      logoFile: null
    };
    if (college.college_logo) {
      logoPreview.value = college.college_logo;
    }
  } else {
    // Create mode
    resetForm();
  }
  visible.value = true;
};

const closeDialog = () => {
  visible.value = false;
  resetForm();
};

const submitForm = async () => {
  if (!isFormValid.value) {
    return;
  }
  
  loading.value = true;
  
  try {
    const payload = {
      college_name: collegeForm.value.college_name,
      alias: collegeForm.value.alias,
      logoFile: collegeForm.value.logoFile || null
    };
    
    if (currentCollegeId.value) {
      // Update existing college
      const { error } = await collegesStore.updateCollege(currentCollegeId.value, payload);
      
      if (error) throw error;
      
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'College updated successfully',
        life: 3000
      });
      emit('college-updated');
    } else {
      // Create new college
      const { error } = await collegesStore.storeColleges(payload);
      
      if (error) throw error;
      
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'College created successfully',
        life: 3000
      });
      emit('college-added');
    }
    
    visible.value = false;
    resetForm();
  } catch (error) {
    console.error('Error saving college:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to save college',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};

// Expose methods to parent components
defineExpose({
  openDialog
});
</script>

<style scoped>
.field {
  margin-bottom: 1.5rem;
}
</style>
