<template>
  <div class="college-list">
    <div class="flex justify-between items-center mb-6">
        <div>
            <h1 class="text-xl font-medium">Colleges</h1>
            <p class="text-sm text-gray-500">Manage your colleges here</p>
        </div>
        <AddCollege 
          ref="addCollegeDialog"
          @college-added="refreshColleges" 
          @college-updated="refreshColleges"
        />
    </div>

    <div v-if="collegesStore.loading && collegesStore.colleges.length === 0" class="text-center py-12">
      <i class="pi pi-spin pi-spinner text-2xl text-blue-500"></i>
      <p class="mt-2 text-gray-600">Loading colleges...</p>
    </div>

    <div v-else-if="collegesStore.error" class="p-4 bg-red-50 text-red-700 rounded-lg mb-6">
      <i class="pi pi-exclamation-triangle mr-2"></i>
      {{ collegesStore.error }}
    </div>

    <div v-else-if="collegesStore.colleges.length === 0" class="text-center py-12 bg-gray-50 rounded-lg">
      <i class="pi pi-inbox text-4xl text-gray-400 mb-2"></i>
      <p class="text-gray-600">No colleges found</p>
      <p class="text-sm text-gray-500 mt-1">Click the "Add College" button to create one</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="college in collegesStore.colleges" 
        :key="college.id"
        class="bg-white rounded-lg border border-gray-200 overflow-hidden hover:bg-gray-50 transition-shadow duration-200"
      >
        <div class="p-5">
          <div class="flex items-start">
            <div class="flex-shrink-0 mr-4">
              <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                <img 
                  v-if="college.college_logo" 
                  :src="college.college_logo" 
                  :alt="`${college.college_name} logo`"
                  class="w-full h-full object-cover"
                />
                <i v-else class="pi pi-institution text-2xl text-gray-400"></i>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-medium text-gray-900 truncate">{{ college.college_name }}</h3>
              <p class="text-sm text-gray-500">{{ college.alias }}</p>
            </div>
            <div class="ml-4 flex-shrink-0">
              <Button 
                icon="pi pi-ellipsis-v" 
                variant="text"
                rounded
                severity="secondary"
                @click="openMenu(college, $event)"
                aria-haspopup="true"
                aria-controls="college_menu"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Context Menu -->
    <Menu 
      ref="menu" 
      :model="menuItems" 
      :popup="true" 
      id="college_menu"
      :pt="{
        root: 'w-40',
        menuitem: { class: 'p-0' },
        action: { class: 'p-3' }
      }"
    />
    <!--Delete confirmation-->
    <Dialog v-model:visible="deleteDialogVisible" modal :draggable="false">
      <template #header>
        <h3 class="text-lg font-medium">Delete College</h3>
      </template>
      <template #default>
        <p>Are you sure you want to delete this college?</p>
      </template>
      <template #footer>
        <Button label="No, keep it" variant="text" @click="closeDialog" />
        <Button label="Yes, confirm and delete" @click="deleteCollege"/>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useColleges } from '../../../../stores/colleges';
import { useToast } from 'primevue/usetoast';
import AddCollege from './create';

const toast = useToast();
const collegesStore = useColleges();
const menu = ref();
const selectedCollege = ref(null);
const deleteDialogVisible = ref(false);
const addCollegeDialog = ref(null);

// Menu items for each college
const menuItems = ref([
  {
    label: 'Edit',
    icon: 'pi pi-pencil',
    command: () => editCollege(selectedCollege.value)
  },
  {
    label: 'Delete',
    icon: 'pi pi-trash',
    class: 'text-red-500',
    command: () => confirmDelete(selectedCollege.value)
  }
]);

// Open context menu
const openMenu = (college, event) => {
  selectedCollege.value = college;
  menu.value.show(event);
};

// Refresh colleges list
const refreshColleges = async () => {
  try {
    await collegesStore.getColleges();
  } catch (error) {
    console.error('Error refreshing colleges:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to refresh colleges',
      life: 3000
    });
  }
};

// Edit college
const editCollege = (college) => {
  selectedCollege.value = college;
  addCollegeDialog.value.openDialog(college);
};

// Confirm delete (open dialog)
const confirmDelete = (college) => {
  selectedCollege.value = college;
  deleteDialogVisible.value = true;
};

// Close delete dialog
const closeDialog = () => {
  deleteDialogVisible.value = false;
  selectedCollege.value = null;
};

// Perform delete
const deleteCollege = async () => {
  if (!selectedCollege.value) return;

  const { error } = await collegesStore.deleteCollege(selectedCollege.value.id);

  if (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error,
      life: 3000
    });
  } else {
    toast.add({
      severity: 'success',
      summary: 'Deleted',
      detail: `${selectedCollege.value.college_name} has been deleted`,
      life: 3000
    });
  }

  closeDialog();
};

// Initial data fetch
onMounted(async () => {
  if (collegesStore.colleges.length === 0) {
    await refreshColleges();
  }
});
</script>
