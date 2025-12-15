<template>
    <div>
        <AppBreadCrumbs :home="home" :items="items" />
        <div class="flex flex-col sm:flex-row justify-between gap-3 sm:items-center mb-4 sm:mb-6">
            <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-800">
                    {{ authStore.isAdmin ? 'Partylists Management' : 'Partylists' }}
                </h1>
                <p class="text-gray-500 text-sm">
                    {{ authStore.isAdmin ? 'Approve and manage all partylists' : 'View partylists or create new partylist' }}
                </p>
            </div>
            <div class="flex gap-2">
                <MyPartylist  v-if="!authStore.isAdmin"/>
                <PendingPartylist v-if="authStore.isAdmin" @partylist-approved="fetchApprovedPartylists" />
            </div>

        </div>

        <!-- DataTable -->
        <div class="rounded-lg border border-gray-200 overflow-x-auto">
            <DataTable 
                :value="partylists" 
                :loading="loading" 
                stripedRows
                :scrollable="true"
                scrollHeight="flex"
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
                <Column field="name" header="Name" sortable :style="{ minWidth: '150px' }">
                    <template #body="{ data }">
                        <div class="font-medium">{{ data.name }}</div>
                        <div class="text-xs text-gray-500 sm:hidden">
                            {{ data.description ? data.description.substring(0, 30) + (data.description.length > 30 ? '...' : '') : '-' }}
                        </div>
                    </template>
                </Column>
                <Column field="description" header="Description" class="hidden sm:table-cell">
                    <template #body="{ data }">
                        <div class="text-sm text-gray-600 line-clamp-2">{{ data.description || '-' }}</div>
                    </template>
                </Column>
                <Column field="platform" header="Platform" class="hidden sm:table-cell">
                    <template #body="{ data }">
                        <div class="text-sm text-gray-600 line-clamp-2">{{ data.platform || '-' }}</div>
                    </template>
                </Column>
                <Column field="date_founded" header="Date" class="hidden xs:table-cell" sortable :style="{ minWidth: '100px' }">
                    <template #body="{ data }">
                        <div class="text-sm">{{ formatDate(data.date_founded) }}</div>
                    </template>
                </Column>
                <Column 
                    v-if="authStore.isAdmin"
                    header="Actions" 
                    :exportable="false" 
                    :style="{ minWidth: '100px' }"
                    class="sticky right-0 bg-white"
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

        <!-- Add/Edit Dialog -->
        <Dialog 
            v-model:visible="partylistDialog" 
            :style="{width: '95vw', maxWidth: '550px'}" 
            :breakpoints="{ '960px': '75vw', '641px': '90vw', '360px': '95vw' }"
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
            v-model:visible="deletePartylistDialog" 
            :style="{width: '95vw', maxWidth: '450px'}" 
            :breakpoints="{ '960px': '75vw', '641px': '90vw', '360px': '95vw' }"
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
const loading = ref(false)
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
        await fetchApprovedPartylists()
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Partylist deactivated successfully',
            life: 3000
        })
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

// Lifecycle hooks
onMounted(async () => {
    loading.value = true
    try {
        await fetchApprovedPartylists()

    } catch (error) {
        console.error('Error loading partylists:', error)
    } finally {
        loading.value = false
    }
})
</script>