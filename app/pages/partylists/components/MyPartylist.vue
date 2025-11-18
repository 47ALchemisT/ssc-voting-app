<template>
    <div class="flex gap-2">
        <Button 
            label="My Partylists" 
            size="small"
            icon="pi pi-flag"
            @click="openMyPartylist" 
        />

        <Dialog 
            v-model:visible="visible" 
            modal 
            :draggable="false"
            :style="{ width: '50rem', maxWidth: '90vw' }"
        >
            <template #header>
                <div class="flex flex-col gap-1">
                    <h3 class="text-lg font-semibold">My Partylists</h3>
                    <p class="text-sm text-gray-500">
                        View and manage your partylists. Track their status (Pending/Approved/Rejected) 
                        and create new ones if needed.
                    </p>
                </div>
            </template>
            
            <div class="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-md">
                <p class="text-sm text-blue-700">
                    This panel shows all your partylists organized by their status. 
                    Use the tabs above to filter between Pending, Approved, and Rejected partylists.
                </p>
                <template v-if="canCreateNew">
                    <Button 
                        label="Add Partylist" 
                        icon="pi pi-plus" 
                        size="small"
                        class="mt-6"
                        @click="openNew" 
                    />
                </template>
                <div v-else class="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded-md">
                    <p class="text-sm text-yellow-700">
                        <i class="pi pi-info-circle mr-2"></i>
                        <template v-if="activePartylistStatus === 0">
                            Your partylist is currently under review. Please wait for it to be approved before creating a new one.
                        </template>
                        <template v-else-if="activePartylistStatus === 1">
                            You already have an approved partylist. Only one active partylist is allowed per user.
                        </template>
                        <template v-else>
                            You already have an active partylist. Please wait for it to be reviewed before creating a new one.
                        </template>
                    </p>
                </div>
            </div>
            
            <!-- Approved Partylist Card -->
            <div class="mb-6">
                <h3 class="text-lg font-medium mb-4">Approved Partylist</h3>
                <div v-if="filteredPartylists(1).length > 0" class="mb-6">
                    <div v-for="partylist in filteredPartylists(1)" :key="partylist.id" class="border border-blue-500 rounded-lg overflow-hidden bg-white">
                        <div class="p-5">
                            <div class="flex justify-between items-start">
                                <div>
                                    <div class="flex items-center mb-2">
                                        <span class="text-xl font-semibold text-gray-800">{{ partylist.name }}</span>
                                        <span class="ml-3 px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                            Approved
                                        </span>
                                    </div>
                                    <p v-if="partylist.description" class="text-gray-600 mb-3">{{ partylist.description }}</p>
                                    <div class="space-y-1 text-sm text-gray-500">
          
                                        <div v-if="partylist.platform" class="flex items-start">
                                            <i class="pi pi-file-edit mr-2 mt-1"></i>
                                            <span>Platform: {{ partylist.platform }}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="flex space-x-2">
                                    <div class="flex text-xs items-center">
                                        <i class="pi pi-calendar mr-2"></i>
                                        <span>Founded: {{ formatDate(partylist.date_founded) }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else class="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                    <i class="pi pi-flag text-4xl text-gray-300 mb-3"></i>
                    <p class="text-gray-500 mb-4">No approved partylist found</p>
                    <Button 
                        label="Create Partylist" 
                        icon="pi pi-plus" 
                        size="small"
                        @click="openNew"
                        v-if="canCreateNew"
                    />
                </div>
            </div>

            <!-- Pending Partylists -->
            <div v-if="filteredPartylists(0).length > 0" class="mb-6">
                <h3 class="text-lg font-medium mb-4">Pending Review</h3>
                <PartylistTable 
                    :partylists="filteredPartylists(0)" 
                    :loading="loading" 
                    :error="error"
                    @refresh="getMyPartylist"
                />
            </div>

            <!-- Rejected Partylists -->
            <div v-if="filteredPartylists(2).length > 0" class="mt-8">
                <h3 class="text-lg font-medium mb-4 text-gray-800">Rejected Partylists ({{ filteredPartylists(2).length }})</h3>
                <PartylistTable 
                    :partylists="filteredPartylists(2)" 
                    :loading="loading" 
                    :error="error"
                    @refresh="getMyPartylist"
                />
            </div>
            <template #footer>

                <Button 
                    label="Close" 
                    @click="visible = false" 
                    class="p-button-text" 
                />
            </template>
        </Dialog>

        <!-- Add/Edit Dialog -->
        <Dialog 
            v-model:visible="partylistDialog" 
            :style="{width: '550px'}" 
            :header="dialogTitle" 
            :modal="true" 
            class="p-fluid space-y-3"
        >
            <div class="field mt-3">
                <label class="" for="name">Name <span class="text-red-500">*</span></label>
                <InputText 
                    id="name" 
                    v-model.trim="partylistForm.name" 
                    required="true" 
                    class="w-full mt-2"
                    :class="{'p-invalid': submitted && !partylistForm.name}"
                />
                <small v-if="submitted && !partylistForm.name" class="p-error">Name is required.</small>
            </div>

            <div class="field mt-3">
                <label for="description">Description (Optional)</label>
                <Textarea 
                    id="description" 
                    v-model="partylistForm.description" 
                    rows="3" 
                    class="w-full mt-2"
                />
            </div>

            <div class="field mt-3">
                <label for="platform">Platform <span class="text-red-500">*</span></label>
                <Textarea 
                    id="platform" 
                    v-model="partylistForm.platform" 
                    rows="3" 
                    class="w-full mt-2"
                    :class="{'p-invalid': submitted && !partylistForm.platform}"
                />
                <small v-if="submitted && !partylistForm.platform" class="p-error">Platform is required.</small>
            </div>

            <div class="field mt-3">
                <label for="date_founded">Date Founded <span class="text-red-500">*</span></label>
                <Calendar 
                    id="date_founded" 
                    v-model="partylistForm.date_founded" 
                    showIcon 
                    :showTime="false" 
                    dateFormat="yy-mm-dd" 
                    class="w-full mt-2"
                    :class="{'p-invalid': submitted && !partylistForm.date_founded}"
                />
                <small v-if="submitted && !partylistForm.date_founded" class="p-error">Date founded is required.</small>
            </div>

            <template #footer>
                <Button 
                    label="Cancel" 
                    icon="pi pi-times" 
                    @click="hideDialog" 
                    class="p-button-text" 
                />
                <Button 
                    :label="saving ? 'Saving...' : 'Save'" 
                    icon="pi pi-check" 
                    @click="savePartylist" 
                    :loading="saving" 
                    :disabled="saving"
                />
            </template>
        </Dialog>

        <!-- Delete Confirmation -->
        <Dialog 
            v-model:visible="deletePartylistDialog" 
            :style="{width: '450px'}" 
            header="Confirm" 
            :modal="true"
        >
            <div class="confirmation-content">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                <span v-if="partylist">Are you sure you want to delete <b>{{ partylist.name }}</b>?</span>
            </div>
            <template #footer>
                <Button 
                    label="No" 
                    icon="pi pi-times" 
                    class="p-button-text" 
                    @click="deletePartylistDialog = false" 
                />
                <Button 
                    label="Yes" 
                    icon="pi pi-check" 
                    class="p-button-danger" 
                    @click="deletePartylist" 
                    :loading="deleting"
                    :disabled="deleting"
                />
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePartylistsStore } from '../../../../stores/partylists'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import PartylistTable from './PartylistTable.vue';

const emit = defineEmits(['partylist-created', 'partylist-approved'])
const partylistsStore = usePartylistsStore()
const toast = useToast()
const confirm = useConfirm()

// Dialog states
const visible = ref(false)
const partylistDialog = ref(false)
const deletePartylistDialog = ref(false)

// Form states
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const submitted = ref(false)
const error = ref(null)

// Data
const partylists = ref([])
const partylist = ref(null)
const isEdit = ref(false)
const canCreateNew = ref(true)

const partylistForm = ref({
    name: '',
    description: '',
    platform: '',
    date_founded: null
})

const checkCanCreate = async () => {
    try {
        const { canCreate, error } = await partylistsStore.canCreatePartylist()
        if (error) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to check partylist creation status',
                life: 3000
            })
        }
        canCreateNew.value = canCreate
    } catch (error) {
        console.error('Error checking partylist creation status:', error)
    }
}

const openMyPartylist = async () => {
    visible.value = true
    await Promise.all([getMyPartylist(), checkCanCreate()])
}



const getStatusText = (status) => {
    switch(status) {
        case 0: return 'Pending';
        case 1: return 'Approved';
        case 2: return 'Rejected';
        default: return 'Unknown';
    }
}

const getStatusSeverity = (status) => {
    switch(status) {
        case 0: return 'warning';
        case 1: return 'success';
        case 2: return 'danger';
        default: return 'info';
    }
}

const filteredPartylists = (status) => {
    if (!partylists.value) return [];
    return partylists.value.filter(partylist => partylist.status === status);
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
    });
};

// Computed
const dialogTitle = computed(() => {
    return isEdit.value ? 'Edit Partylist' : 'New Partylist'
})

const activePartylistStatus = computed(() => {
    const active = partylists.value.find(p => [0, 1].includes(p.status))
    return active ? active.status : null
})

// Methods
const openNew = () => {
    partylist.value = null
    isEdit.value = false
    partylistForm.value = {
        name: '',
        description: '',
        platform: '',
        date_founded: null
    }
    submitted.value = false
    partylistDialog.value = true
}

const editPartylist = (data) => {
    partylist.value = { ...data }
    isEdit.value = true
    partylistForm.value = {
        name: data.name,
        description: data.description || '',
        platform: data.platform || '',
        date_founded: data.date_founded ? new Date(data.date_founded) : null
    }
    partylistDialog.value = true
}

const hideDialog = () => {
    partylistDialog.value = false
    submitted.value = false
}

const savePartylist = async () => {
    submitted.value = true
    
    if (!partylistForm.value.name || !partylistForm.value.platform || !partylistForm.value.date_founded) {
        return
    }

    try {
        saving.value = true
        partylistsStore.clearError()
        
        const partylistData = {
            ...partylistForm.value,
            date_founded: partylistForm.value.date_founded.toISOString().split('T')[0]
        }

        let result
        if (isEdit.value) {
            result = await partylistsStore.updatePartylist(partylist.value.id, partylistData)
        } else {
            result = await partylistsStore.createPartylist(partylistData)
        }

        if (result.error) throw result.error

        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: `Partylist ${isEdit.value ? 'updated' : 'created'} successfully`,
            life: 3000
        })

        // Refresh the partylists
        await getMyPartylist()
        partylistDialog.value = false
        emit('partylist-created')
    } catch (error) {
        console.error('Error saving partylist:', error)
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: `Failed to ${isEdit.value ? 'update' : 'create'} partylist: ${error.message}`,
            life: 3000
        })
    } finally {
        saving.value = false
    }
}

const confirmDeletePartylist = (partylistData) => {
    partylist.value = partylistData
    deletePartylistDialog.value = true
}

const deletePartylist = async () => {
    try {
        deleting.value = true
        const result = await partylistsStore.deletePartylist(partylist.value.id)
        
        if (result.error) throw result.error

        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Partylist deleted successfully',
            life: 3000
        })

        // Refresh the partylists
        await getMyPartylist()
        deletePartylistDialog.value = false
        emit('partylist-created')
    } catch (error) {
        console.error('Error deleting partylist:', error)
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: `Failed to delete partylist: ${error.message}`,
            life: 3000
        })
    } finally {
        deleting.value = false
    }
}

const getMyPartylist = async () => {
    try {
        loading.value = true;
        error.value = null;
        const { data, error: fetchError } = await partylistsStore.fetchMyPartylist();
        if (fetchError) throw fetchError;
        partylists.value = data || [];
    } catch (err) {
        console.error('Error fetching partylists:', err);
        error.value = 'Failed to load partylists. Please try again.';
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load partylists',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
}
</script>