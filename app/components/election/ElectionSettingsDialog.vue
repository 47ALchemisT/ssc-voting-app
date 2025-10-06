
<template>
    <div>
        <Button 
            icon="pi pi-cog" 
            size="small" 
            @click="visible = true" 
            class="p-button-outlined"
        />
        <Dialog v-model:visible="visible" modal header="Settings" :style="{ width: '30rem' }">
            <div class="grid grid-cols-1 gap-3">
                <div 
                    class="flex bg-gray-100 py-3 px-4 rounded-md justify-between gap-10 group hover:bg-blue-100 cursor-pointer transition-colors transition-duration-300"
                    @click="openExtendDialog"
                >
                    <div>
                        <h1 class="text-md text-gray-800 font-medium group-hover:text-blue-600 transition-colors transition-duration-300">Extend Election Duration</h1>
                        <p class="text-sm text-gray-600 group-hover:text-blue-600 transition-colors transition-duration-300">Extend the duration of the election by a specified number of days.</p>
                    </div>
                    <div class="group-hover:text-blue-600 transition-colors transition-duration-300">
                        <i class="pi pi-arrow-right"></i>
                    </div>
                </div>
            </div>
        </Dialog>

        <ExtendElectionDialog
            v-if="election"
            v-model="showExtendDialog"
            :election="election"
            @extended="handleExtended"
            @cancel="handleCancel"
        />
    </div>
</template>

<script setup>
import { ref } from "vue";
import ExtendElectionDialog from './ExtendElectionDialog.vue';

const props = defineProps({
    election: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['extended']);

const visible = ref(false);
const showExtendDialog = ref(false);

const openExtendDialog = () => {
    visible.value = false; // Close the settings dialog
    showExtendDialog.value = true; // Open the extend dialog
};

const handleExtended = () => {
    showExtendDialog.value = false; // Close the extend dialog
    emit('extended');
};

const handleCancel = () => {
    showExtendDialog.value = false; // Ensure extend dialog is closed
    visible.value = true; // Reopen settings dialog
};
</script>
