<template>
  <Dialog 
    :visible="visible" 
    @update:visible="(val) => $emit('update:visible', val)"
    :style="{width: '50vw'}" 
    header="Pending Applications"
    :modal="true"
    :closable="false"
  >
    <div v-if="loading" class="flex justify-content-center p-4">
      <ProgressSpinner />
    </div>

    <div v-else-if="error" class="p-error p-4">
      {{ error }}
    </div>

    <div v-else>
      <div v-if="pendingApplications.length === 0" class="text-center p-4">
        <p>No pending applications.</p>
      </div>

      <div v-else>
        <div 
          v-for="application in pendingApplications" 
          :key="application.id" 
          class="mb-4 p-3 rounded-md border bg-gray-50/50 border-gray-200"
        >
          <div class="flex justify-between">
            <div class="flex align-items-center">
              <div>
                <div class="font-bold">
                  {{ application.user.first_name }} {{ application.user.last_name }}
                </div>
                <div class="text-sm text-500">
                  Position: {{ application.position?.title || 'N/A' }}
                </div>
                <div v-if="application.platform" class="text-sm mt-2">
                  {{ application.platform }}
                </div>
              </div>
            </div>
            <div >
              <Button
                  icon="pi pi-eye"
                  label="Details"
                  outlined
                  fluid
                  size="small"
                  @click="viewApplication(application.id)"
                />
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <Button 
        label="Close" 
        @click="close" 
        severity="secondary"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue';
import { useCandidacyApplicationStore } from '../../stores/candidacy_application';

const props = defineProps({
  electionId: {
    type: String,
    required: true
  },
  visible: {
    type: Boolean,
    required: true
  }
});

const router = useRouter()
const candidacyStore = useCandidacyApplicationStore()

const emit = defineEmits(['update:visible', 'updated'])

const viewApplication = (applicationId) => {
  router.push(`/candidacy/${applicationId}`)
};

const pendingApplications = ref([]);
const loading = ref(false);
const error = ref(null);
const updatingId = ref(null);

const close = () => {
  emit('update:visible', false);
};

const fetchPendingApplications = async () => {
  try {
    loading.value = true;
    error.value = null;
    const store = useCandidacyApplicationStore();
const { data } = await store.getApplicationsByElection(
  props.electionId,
  store.STATUS.PENDING
);
    pendingApplications.value = data || [];
  } catch (err) {
    console.error('Error fetching pending applications:', err);
    error.value = 'Failed to load pending applications. Please try again.';
  } finally {
    loading.value = false;
  }
};

// Watch for modal visibility changes
watch(() => props.visible, (newVal) => {
  if (newVal) {
    fetchPendingApplications();
  }
});
</script>
