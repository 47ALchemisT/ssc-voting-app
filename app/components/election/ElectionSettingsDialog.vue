
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
                <div 
                    class="flex bg-gray-100 py-3 px-4 rounded-md justify-between gap-10 group hover:bg-blue-100 cursor-pointer transition-colors transition-duration-300"
                    @click="openForceEndDialog"
                >
                    <div>
                        <h1 class="text-md text-gray-800 font-medium group-hover:text-blue-600 transition-colors transition-duration-300">Force End Election</h1>
                        <p class="text-sm text-gray-600 group-hover:text-blue-600 transition-colors transition-duration-300">This will forcefully end the election even if the end date has not passed.</p>
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

        <ForceEndElectionDialog
            v-if="election"
            v-model="showForceEndDialog"
            :election="election"
            @force-end="handleForceEnd"
            @cancel="handleCancel"
        />
    </div>
</template>

<script setup>
import { ref } from "vue";
import ExtendElectionDialog from './ExtendElectionDialog.vue';
import ForceEndElectionDialog from './ForceEndElectionDialog.vue';

const props = defineProps({
    election: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['extended']);

const visible = ref(false);
const showExtendDialog = ref(false);
const showForceEndDialog = ref(false);

const openExtendDialog = () => {
    visible.value = false; // Close the settings dialog
    showExtendDialog.value = true; // Open the extend dialog
};

const handleExtended = () => {
    showExtendDialog.value = false; // Close the extend dialog
    emit('extended');
};

const openForceEndDialog = () => {
    visible.value = false; // Close the settings dialog
    showForceEndDialog.value = true; // Open the force end dialog
};

const handleForceEnd = () => {
    showForceEndDialog.value = false; // Close the force end dialog
    emit('extended'); // Emit the extended event to refresh the parent component
};

const handleCancel = () => {
    showExtendDialog.value = false; // Close extend dialog if open
    showForceEndDialog.value = false; // Close force end dialog if open
    visible.value = true; // Reopen settings dialog
};
</script>
