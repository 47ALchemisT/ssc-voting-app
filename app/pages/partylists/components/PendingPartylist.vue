<template>
    <div>
        <Button 
            label="Manage Requests" 
            icon="pi pi-wrench"
            size="small"
            @click="openPendingPartylists" 
        />
        <Dialog 
            v-model:visible="visible" 
            modal 
            :draggable="false"
            class="rounded-lg border border-gray-200"
            :style="{ width: '50rem', maxWidth: '90vw' }"
        >
            <template #header>
                <div class="flex flex-col gap-1">
                    <h3 class="text-lg font-semibold">Partylist Management</h3>
                    <p class="text-sm text-gray-500">
                        Manage pending and deactivated partylists. Approve, reject, or reactivate as needed.
                    </p>
                </div>
            </template>
            
            <div v-if="loading" class="text-center p-4">
                <ProgressSpinner />
            </div>
            <div v-else-if="error" class="text-red-500 p-4">
                {{ error }}
            </div>
            <div v-else>
                <TabView>
                    <TabPanel header="Pending">
                        <div class="p-1 border border-gray-200 rounded-lg">
                            <DataTable 
                                :value="pendingPartylists" 
                                :paginator="true" 
                                :rows="5"
                                :rowsPerPageOptions="[5,10,25,50]"
                                class="p-datatable-sm"
                            >
                        <Column field="name" header="Name" sortable></Column>
                        <Column field="description" header="Description">
                            <template #body="{ data }">
                                {{ data.description || '-' }}
                            </template>
                        </Column>
                                <Column field="date_founded" header="Date Founded" sortable>
                                    <template #body="{ data }">
                                        {{ formatDate(data.date_founded) }}
                                    </template>
                                </Column>
                                <Column header="Actions" :exportable="false" style="min-width: 13rem">
                                    <template #body="{ data }">
                                        <div class="flex gap-2">
                                            <Button 
                                                icon="pi pi-eye" 
                                                label="View"
                                                size="small"
                                                @click="viewPartylist(data)"
                                                v-tooltip.top="'View Details'"
                                            />
                                            <Button 
                                                icon="pi pi-check" 
                                                size="small" 
                                                outlined
                                                @click="confirmApprove(data)"
                                                v-tooltip.top="'Approve'"
                                            />
                                            <Button 
                                                icon="pi pi-times" 
                                                size="small" 
                                                outlined
                                                @click="confirmReject(data)"
                                                v-tooltip.top="'Reject'"
                                                severity="danger"
                                            />
                                        </div>
                                    </template>
                                </Column>
                                <template #empty>
                                    <div class="text-center p-4 text-gray-500">
                                        No pending partylists found.
                                    </div>
                                </template>
                            </DataTable>
                        </div>
                    </TabPanel>
                    
                    <TabPanel header="Deactivated">
                        <div class="p-1 border border-gray-200 rounded-lg">
                            <DataTable 
                                :value="deactivatedPartylists" 
                                :paginator="true" 
                                :rows="5"
                                :rowsPerPageOptions="[5,10,25,50]"
                                class="p-datatable-sm"
                            >
                                <Column field="name" header="Name" sortable></Column>
                                <Column field="description" header="Description">
                                    <template #body="{ data }">
                                        {{ data.description || '-' }}
                                    </template>
                                </Column>
                                <Column field="date_founded" header="Date Founded" sortable>
                                    <template #body="{ data }">
                                        {{ formatDate(data.date_founded) }}
                                    </template>
                                </Column>
                                <Column header="Actions" :exportable="false" style="min-width: 13rem">
                                    <template #body="{ data }">
                                        <div class="flex gap-2">
                                            <Button 
                                                icon="pi pi-undo" 
                                                size="small" 
                                                label="Re-activate"
                                                @click="confirmReactivate(data)"
                                            />
                                        </div>
                                    </template>
                                </Column>
                                <template #empty>
                                    <div class="text-center p-4 text-gray-500">
                                        No deactivated partylists found.
                                    </div>
                                </template>
                            </DataTable>
                        </div>
                    </TabPanel>
                </TabView>
            </div>
            <template #footer>
                <Button 
                    label="Close" 
                    @click="visible = false" 
                    class="p-button-text" 
                />
            </template>
        </Dialog>

        <!-- Approve Confirmation Dialog -->
        <Dialog 
            v-model:visible="approveDialogVisible" 
            modal 
            :draggable="false"
            header="Approve Partylist"
            :style="{ width: '450px' }"
        >
            <div class="flex items-start gap-3">
                <i class="pi pi-check-circle text-green-500 text-2xl mt-1"></i>
                <div>
                    <p class="font-medium mb-2">Approve this partylist?</p>
                    <p class="text-sm text-gray-600">
                        Are you sure you want to approve <strong>{{ selectedPartylist?.name }}</strong>? 
                        This will make it active and visible to users.
                    </p>
                </div>
            </div>
            <template #footer>
                <Button 
                    label="Cancel" 
                    text
                    size="small"
                    @click="approveDialogVisible = false" 
                    :disabled="processing"
                />
                <Button 
                    label="Yes, Approve" 
                    size="small"
                    @click="approvePartylist" 
                    :loading="processing"
                />
            </template>
        </Dialog>

        <!-- Reject Confirmation Dialog -->
        <Dialog 
            v-model:visible="rejectDialogVisible" 
            modal 
            :draggable="false"
            header="Reject Partylist"
            :style="{ width: '450px' }"
        >
            <div class="flex items-start gap-3">
                <i class="pi pi-times-circle text-red-500 text-2xl mt-1"></i>
                <div>
                    <p class="font-medium mb-2">Reject this partylist?</p>
                    <p class="text-sm text-gray-600">
                        Are you sure you want to reject <strong>{{ selectedPartylist?.name }}</strong>? 
                        This action will decline the partylist registration.
                    </p>
                </div>
            </div>
            <template #footer>
                <Button 
                    label="Cancel" 
                    text
                    size="small"
                    @click="rejectDialogVisible = false" 
                    :disabled="processing"
                />
                <Button 
                    label="Yes, Reject" 
                    size="small"
                    @click="rejectPartylist" 
                    :loading="processing"
                    severity="danger"
                />
            </template>
        </Dialog>

        <!-- Reactivate Confirmation Dialog -->
        <Dialog 
            v-model:visible="reactivateDialogVisible" 
            modal 
            :draggable="false"
            header="Reactivate Partylist"
            :style="{ width: '450px' }"
        >
            <div class="flex items-start gap-3">
                <i class="pi pi-undo text-green-500 text-2xl mt-1"></i>
                <div>
                    <p class="font-medium mb-2">Reactivate this partylist?</p>
                    <p class="text-sm text-gray-600">
                        Are you sure you want to reactivate <strong>{{ selectedPartylist?.name }}</strong>? 
                        This will make it active and visible to users.
                    </p>
                </div>
            </div>
            <template #footer>
                <Button 
                    label="Cancel" 
                    text
                    size="small"
                    @click="reactivateDialogVisible = false" 
                    :disabled="processing"
                />
                <Button 
                    label="Yes, Reactivate" 
                    size="small"
                    @click="reactivatePartylist" 
                    :loading="processing"
                    severity="success"
                />
            </template>
        </Dialog>

        <!-- View Partylist Details Dialog -->
        <Dialog 
            v-model:visible="viewDialogVisible" 
            modal 
            :draggable="false"
            header="Partylist Details"
            :style="{ width: '600px', maxWidth: '90vw' }"
        >
            <div v-if="selectedPartylist" class="space-y-5">
                <!-- Submission Details Section -->
                <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        Submission Details
                    </h4>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="text-xs text-gray-500 block mb-1">Submitted On</label>
                            <p class="text-sm text-gray-900 font-medium">{{ formatDate(selectedPartylist.created_at) }}</p>
                        </div>
                        <div>
                            <label class="text-xs text-gray-500 block mb-1">Current Status</label>
                            <Tag :value="getStatusLabel(selectedPartylist.status)" :severity="getStatusSeverity(selectedPartylist.status)" class="text-xs" />
                        </div>
                    </div>
                </div>

                <!-- Partylist Information Section -->
                <div class="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 class="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                        Partylist Information
                    </h4>
                    
                    <div class="space-y-4">
                        <!-- Name -->
                        <div>
                            <label class="text-xs text-gray-500 block mb-1">Partylist Name</label>
                            <p class="text-base text-gray-900 font-semibold">{{ selectedPartylist.name }}</p>
                        </div>

                        <!-- Description -->
                        <div>
                            <label class="text-xs text-gray-500 block mb-1">Description</label>
                            <p class="text-sm text-gray-700 leading-relaxed">
                                {{ selectedPartylist.description || 'No description provided' }}
                            </p>
                        </div>

                        <!-- Date Founded -->
                        <div>
                            <label class="text-xs text-gray-500 block mb-1">Date Founded</label>
                            <div class="flex">
                                <div class="p-2 bg-gray-100 rounded-md flex items-center gap-2">
                                    <i class="pi pi-calendar text-gray-500 text-xs"></i>
                                    <p class="text-xs text-gray-900 ">{{ formatDate(selectedPartylist.date_founded) }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <template #footer>
                <div class="flex justify-between items-center w-full">
                    <div class="flex gap-2">
                        <Button 
                            v-if="selectedPartylist?.status === 0"
                            label="Approve" 
                            icon="pi pi-check"
                            @click="approveFromView" 
                            class="p-button-success"
                            size="small"
                        />
                        <Button 
                            v-if="selectedPartylist?.status === 0"
                            label="Reject" 
                            icon="pi pi-times"
                            @click="rejectFromView" 
                            class="p-button-danger"
                            size="small"
                        />
                        <Button 
                            v-if="selectedPartylist?.status === 3"
                            label="Reactivate" 
                            icon="pi pi-undo"
                            @click="reactivateFromView" 
                            class="p-button-success"
                            size="small"
                        />
                    </div>
                    <Button 
                        label="Close" 
                        size="small"
                        @click="viewDialogVisible = false" 
                        class="p-button-text"
                    />
                </div>
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePartylistsStore } from '../../../../stores/partylists'
import { useToast } from 'primevue/usetoast'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import { useSupabaseClient } from '#imports'

const emit = defineEmits(['partylist-approved'])
const partylistsStore = usePartylistsStore()
const supabase = useSupabaseClient()
const pendingPartylists = ref([])
const deactivatedPartylists = ref([])
const selectedPartylist = ref(null)
const visible = ref(false)
const loading = ref(false)
const error = ref(null)
const processing = ref(false)
const approveDialogVisible = ref(false)
const rejectDialogVisible = ref(false)
const reactivateDialogVisible = ref(false)
const viewDialogVisible = ref(false)
const toast = useToast()

const openPendingPartylists = async () => {
    visible.value = true
    await fetchPendingPartylists()
}

const fetchDeactivatedPartylists = async () => {
    try {
        const { data, error: err } = await supabase
            .from('partylists')
            .select('*')
            .eq('status', 3) // Status 3 for deactivated
            .order('created_at', { ascending: false })
        
        if (err) throw err
        return { data: data || [], error: null }
    } catch (err) {
        console.error('Error fetching deactivated partylists:', err)
        return { data: [], error: err.message }
    }
}

const fetchPendingPartylists = async () => {
    try {
        loading.value = true
        error.value = null
        
        // Use store's fetchPendingPartylists for pending (status 0)
        const pendingRes = await partylistsStore.fetchPendingPartylists()
        if (pendingRes.error) throw pendingRes.error
        
        // Fetch deactivated partylists (status 3)
        const deactivatedRes = await fetchDeactivatedPartylists()
        if (deactivatedRes.error) throw deactivatedRes.error
        
        pendingPartylists.value = pendingRes.data || []
        deactivatedPartylists.value = deactivatedRes.data || []
    } catch (err) {
        console.error('Error fetching partylists:', err)
        error.value = 'Failed to load partylists. Please try again.'
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load partylists',
            life: 3000
        })
    } finally {
        loading.value = false
    }
}

const viewPartylist = (partylist) => {
    selectedPartylist.value = partylist
    viewDialogVisible.value = true
}

const confirmApprove = (partylist) => {
    selectedPartylist.value = partylist
    approveDialogVisible.value = true
}

const confirmReject = (partylist) => {
    selectedPartylist.value = partylist
    rejectDialogVisible.value = true
}

const confirmReactivate = (partylist) => {
    selectedPartylist.value = partylist
    reactivateDialogVisible.value = true
}

const approveFromView = () => {
    viewDialogVisible.value = false
    approveDialogVisible.value = true
}

const rejectFromView = () => {
    viewDialogVisible.value = false
    rejectDialogVisible.value = true
}

const reactivateFromView = () => {
    viewDialogVisible.value = false
    reactivateDialogVisible.value = true
}

const getStatusLabel = (status) => {
    switch (status) {
        case 0: return 'Pending'
        case 1: return 'Approved'
        case 2: return 'Rejected'
        case 3: return 'Deactivated'
        default: return 'Unknown'
    }
}

const getStatusSeverity = (status) => {
    switch (status) {
        case 0: return 'warning'
        case 1: return 'success'
        case 2: return 'danger'
        case 3: return 'secondary'
        default: return 'info'
    }
}

const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
    })
}

const approvePartylist = async () => {
    if (!selectedPartylist.value) return
    
    try {
        processing.value = true
        error.value = null
        const { error: updateError } = await partylistsStore.updateParylistStatus(selectedPartylist.value.id, 1)
        if (updateError) throw updateError
        
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: `${selectedPartylist.value.name} has been approved`,
            life: 3000
        })
        
        // Emit the approved partylist data
        emit('partylist-approved', selectedPartylist.value)
        
        approveDialogVisible.value = false
        selectedPartylist.value = null
        await fetchPendingPartylists()
    } catch (err) {
        console.error('Error approving partylist:', err)
        error.value = 'Failed to approve partylist. Please try again.'
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to approve partylist',
            life: 3000
        })
    } finally {
        processing.value = false
    }
}

const rejectPartylist = async () => {
    if (!selectedPartylist.value) return
    
    try {
        processing.value = true
        error.value = null
        const { error: updateError } = await partylistsStore.updateParylistStatus(selectedPartylist.value.id, 2)
        if (updateError) throw updateError
        
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: `${selectedPartylist.value.name} has been rejected`,
            life: 3000
        })
        
        rejectDialogVisible.value = false
        selectedPartylist.value = null
        await fetchPendingPartylists()
    } catch (err) {
        console.error('Error rejecting partylist:', err)
        error.value = 'Failed to reject partylist. Please try again.'
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to reject partylist',
            life: 3000
        })
    } finally {
        processing.value = false
    }
}

const reactivatePartylist = async () => {
    if (!selectedPartylist.value) return
    
    try {
        processing.value = true
        error.value = null
        
        // Reactivate by setting status to 1 (Approved/Active)
        const { error: updateError } = await partylistsStore.updateParylistStatus(selectedPartylist.value.id, 1)
        if (updateError) throw updateError
        
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: `${selectedPartylist.value.name} has been reactivated`,
            life: 3000
        })
        
        // Emit the reactivated partylist data
        emit('partylist-approved', selectedPartylist.value)
        
        reactivateDialogVisible.value = false
        selectedPartylist.value = null
        await fetchPendingPartylists()
    } catch (err) {
        console.error('Error reactivating partylist:', err)
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to reactivate partylist',
            life: 3000
        })
    } finally {
        processing.value = false
    }
}
</script>