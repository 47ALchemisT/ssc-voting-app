<template>
    <div class="p-4">
        <AppBreadCrumbs :home="home" :items="items" />
        <div class="flex justify-between items-center mb-6">
            <div>
            <h1 class="text-xl font-semibold text-gray-800">Partylists Management</h1>
            <p class="text-gray-500 text-sm">Create and manage partylists available for elections</p>
            </div>
            <Button 
            label="Add Partylist" 
            icon="pi pi-plus" 
            size="small"
            @click="openNew" 
            />
        </div>

        <!-- DataTable -->
        <div class="p-1 rounded-lg border border-gray-200">
            <DataTable 
                :value="partylists" 
                :loading="loading" 
                stripedRows
                responsiveLayout="scroll"
                class="p-datatable-sm"
            >
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
                <Column header="Actions" :exportable="false" style="min-width: 8rem">
                    <template #body="slotProps">
                        <Button 
                            icon="pi pi-pencil" 
                            class="p-button-text p-button-sm p-button-rounded p-button-primary mr-2" 
                            @click="editPartylist(slotProps.data)" 
                        />
                        <Button 
                            icon="pi pi-trash" 
                            class="p-button-text p-button-sm p-button-rounded p-button-danger" 
                            @click="confirmDeletePartylist(slotProps.data)" 
                        />
                    </template>
                </Column>
            </DataTable>    
        </div>

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
import { usePartylistsStore } from '../../../stores/partylists'
import { useConfirm } from 'primevue/useconfirm'

definePageMeta({
    layout: 'dashboard-layout',
    middleware: 'auth'
})

const partylistsStore = usePartylistsStore()
const confirm = useConfirm()

// Data
const partylists = computed(() => partylistsStore.partylists)
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
        } else {
            await partylistsStore.createPartylist(partylistData)
        }
        
        partylistDialog.value = false
        partylist.value = null
    } catch (error) {
        console.error('Error saving partylist:', error)
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

// Lifecycle hooks
onMounted(async () => {
    loading.value = true
    try {
        await partylistsStore.fetchPartylists()
    } catch (error) {
        console.error('Error loading partylists:', error)
    } finally {
        loading.value = false
    }
})
</script>