<template>
    <div class="p-4">
        <AppBreadCrumbs :home="home" :items="items" />
        <div class="flex justify-between items-center mb-6">
            <div>
                <h1 class="text-xl font-semibold text-gray-800">Partylists Management</h1>
                <p class="text-gray-500 text-sm">Create and manage partylists available for elections</p>
            </div>
            <div class="flex gap-2">
                <MyPartylist  v-if="!authStore.isAdmin"/>
                <PendingPartylist v-if="authStore.isAdmin" @partylist-approved="fetchApprovedPartylists" />
            </div>

        </div>

        <!-- DataTable for Admin -->
        <div v-if="authStore.isAdmin" class="p-1 rounded-lg border border-gray-200">
            <DataTable 
                :value="partylists" 
                :loading="loading" 
                stripedRows
                responsiveLayout="scroll"
                class="p-datatable-sm"
            >
                <template #empty>
                <div class="p-8 text-center">
                    <div class="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <i class="pi pi-user text-gray-400 text-2xl"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-1">No applications yet</h3>
                    <p class="text-gray-500 mb-6">You haven't submitted any candidacy applications yet.</p>
                </div>
                </template>
                <Column field="name" header="Name" sortable></Column>
                <Column field="description" header="Description">
                    <template #body="{ data }">
                        {{ data.description || '-' }}
                    </template>
                </Column>
                <Column field="platform" header="Platform">
                    <template #body="{ data }">
                        {{ data.platform || '-' }}
                    </template>
                </Column>
                <Column field="date_founded" header="Date Founded" sortable>
                    <template #body="{ data }">
                        {{ formatDate(data.date_founded) }}
                    </template>
                </Column>
                <Column 
                    header="Actions" 
                    :exportable="false" 
                    style="min-width: 8rem"
                >
                    <template #body="slotProps">
                        <div class="flex gap-2">
                            <Button 
                                icon="pi pi-pencil" 
                                size="small"
                                outlined
                                v-tooltip.top="'Edit'"
                                @click="editPartylist(slotProps.data)" 
                            />
                            <Button 
                                icon="pi pi-times" 
                                size="small"
                                outlined
                                v-tooltip.top="'Deactivate'"
                                @click="confirmDeletePartylist(slotProps.data)" 
                            />
                        </div>
                    </template>
                </Column>
            </DataTable>    
        </div>

        <!-- User's Approved Partylists -->
        <div v-else>
            <div class="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-md">
                <h3 class="text-lg font-semibold text-blue-900 mb-2">My Approved Partylists</h3>
                <p class="text-sm text-blue-700">
                    Here you can view your partylists that have been approved and are available for elections.
                </p>
            </div>
            
            <!-- Card View -->
            <div v-if="userLoading" class="text-center p-8">
                <ProgressSpinner />
            </div>
            <div v-else-if="userPartylists.length === 0" class="text-center p-8 text-gray-500">
                <div class="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <i class="pi pi-flag text-gray-400 text-2xl"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-1">No approved partylists yet</h3>
                <p class="text-gray-500">Your partylists will appear here once they are approved.</p>
            </div>
            <div v-else class="mx-auto">
                <div 
                    v-for="partylist in userPartylists" 
                    :key="partylist.id"
                    class="bg-white rounded-2xl p-8 border border-gray-200 transition-all duration-300 mb-6 last:mb-0"
                >
                    <!-- Header Section -->
                    <div class="flex items-start justify-between mb-6">
                        <div class="flex items-start gap-4">
                            <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                                <i class="pi pi-flag text-white text-xl"></i>
                            </div>
                            <div>
                                <h3 class="text-2xl font-bold text-gray-900 mb-2">{{ partylist.name }}</h3>
                                <Tag 
                                    :value="'Approved'" 
                                    severity="success" 
                                    class="text-xs font-medium"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <!-- Content Section -->
                    <div class="space-y-5">
                        <!-- Description -->
                        <div v-if="partylist.description" class="pb-5 border-b border-gray-100">
                            <p class="text-gray-700 leading-relaxed">{{ partylist.description }}</p>
                        </div>
                        
                        <!-- Platform -->
                        <div v-if="partylist.platform" class="pb-5 border-b border-gray-100">
                            <div class="flex items-center gap-2 mb-3">
                                <div class="w-1 h-5 bg-blue-500 rounded-full"></div>
                                <h5 class="text-sm font-semibold text-gray-900 uppercase tracking-wide">Platform</h5>
                            </div>
                            <p class="text-gray-700 leading-relaxed pl-3">{{ partylist.platform }}</p>
                        </div>
                        
                        <!-- Metadata -->
                        <div class="flex flex-wrap gap-6 pt-2">
                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center">
                                    <i class="pi pi-calendar text-gray-600 text-sm"></i>
                                </div>
                                <div>
                                    <p class="text-xs text-gray-500 font-medium">Founded</p>
                                    <p class="text-sm text-gray-900 font-semibold">{{ formatDate(partylist.date_founded) }}</p>
                                </div>
                            </div>
                            
                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center">
                                    <i class="pi pi-clock text-gray-600 text-sm"></i>
                                </div>
                                <div>
                                    <p class="text-xs text-gray-500 font-medium">Registered</p>
                                    <p class="text-sm text-gray-900 font-semibold">{{ formatDate(partylist.created_at) }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add/Edit Dialog -->
        <Dialog 
            v-if="authStore.isAdmin"
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
                    fluid
                    autofocus
                    class="mt-2"
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
                />
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
                />
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
            v-if="authStore.isAdmin"
            v-model:visible="deletePartylistDialog" 
            :style="{width: '450px'}" 
            header="Confirm" 
            :modal="true"
        >
            <div class="confirmation-content">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                <span v-if="partylist">Are you sure you want to deactivate <b>{{ partylist.name }}</b>?</span>
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
import { usePartylistsStore } from '../../../stores/partylists'
import { useAuthStore } from '../../../stores/auth'

// Breadcrumb data
const home = ref({
    icon: 'pi pi-home',
    route: '/dashboard'
});

const items = ref([
    { label: 'Partylists', route: '/partylists' }
]);
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import PendingPartylist from './components/PendingPartylist'
import MyPartylist from './components/MyPartylist'
import PartylistTable from './components/PartylistTable'

definePageMeta({
    layout: 'dashboard-layout',
    middleware: 'auth'
})

const partylistsStore = usePartylistsStore()
const authStore = useAuthStore()
const confirm = useConfirm()
const toast = useToast()

// Data
const partylists = ref(null)
const userPartylists = ref([])
const loading = ref(false)
const userLoading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const submitted = ref(false)
const partylistDialog = ref(false)
const deletePartylistDialog = ref(false)
const partylist = ref(null)
const isEdit = ref(false)

const partylistForm = ref({
    name: '',
    description: '',
    platform: '',
    date_founded: null
})

// Computed
const dialogTitle = computed(() => {
    return isEdit.value ? 'Edit Partylist' : 'New Partylist'
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
    
    if (!partylistForm.value.name) {
        return
    }

    try {
        saving.value = true
        partylistsStore.clearError()
        
        const partylistData = {
            ...partylistForm.value,
            date_founded: partylistForm.value.date_founded ? 
                new Date(partylistForm.value.date_founded).toISOString() : 
                null
        }

        if (isEdit.value && partylist.value) {
            await partylistsStore.updatePartylist(partylist.value.id, partylistData)
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Partylist updated successfully',
                life: 3000
            })
        } else {
            await partylistsStore.createPartylist(partylistData)
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Partylist created successfully',
                life: 3000
            })
        }
        
        // Refresh the partylists
        await fetchApprovedPartylists()
        
        partylistDialog.value = false
        partylist.value = null
    } catch (error) {
        console.error('Error saving partylist:', error)
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to save partylist. Please try again.',
            life: 3000
        })
    } finally {
        saving.value = false
    }
}

const confirmDeletePartylist = (data) => {
    partylist.value = data
    deletePartylistDialog.value = true
}

const deletePartylist = async () => {
    if (!partylist.value) return

    try {
        deleting.value = true
        await partylistsStore.deletePartylist(partylist.value.id)
        deletePartylistDialog.value = false
        partylist.value = null
    } catch (error) {
        console.error('Error deleting partylist:', error)
    } finally {
        deleting.value = false
    }
}

const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString()
}

const fetchApprovedPartylists = async () => {
    loading.value = true
    try {
        const res = await partylistsStore.fetchPartylists()
        if (res.error) {
            console.error('Error loading approved partylists:', res.error)
        } else {
            partylists.value = res.data
        }
    } catch (error) {
        console.error('Error loading approved partylists:', error)
    } finally {
        loading.value = false
    }
}

const fetchUserApprovedPartylists = async () => {
    userLoading.value = true
    try {
        const res = await partylistsStore.fetchMyPartylist()
        if (res.error) {
            console.error('Error loading user partylists:', res.error)
        } else {
            // Filter only approved partylists (status = 1)
            userPartylists.value = res.data.filter(p => p.status === 1)
        }
    } catch (error) {
        console.error('Error loading user partylists:', error)
    } finally {
        userLoading.value = false
    }
}

// Lifecycle hooks
onMounted(async () => {
    try {
        if (authStore.isAdmin) {
            loading.value = true
            await fetchApprovedPartylists()
        } else {
            await fetchUserApprovedPartylists()
        }
    } catch (error) {
        console.error('Error loading partylists:', error)
    } finally {
        loading.value = false
    }
})
</script>