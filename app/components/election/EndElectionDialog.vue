<template>
  <div class="inline-flex">
    <Button
      :label="label"
      :icon="icon"
      :size="size"
      :severity="severity"
      :disabled="disabled"
      @click="visible = true"
    />

    <Dialog
      v-model:visible="visible"
      modal
      header="End Election"
      :style="{ width: '28rem' }"
    >
      <div class="space-y-4">
        <p class="text-gray-700">
          You're about to end the election
          <span class="font-semibold">{{ election?.title || '' }}</span>.
        </p>
        
        <div v-if="!hasEndDatePassed" class="p-3 bg-yellow-50 rounded">
          <div class="flex">
            <div class="flex-shrink-0">
              <i class="pi pi-exclamation-triangle text-yellow-600"></i>
            </div>
            <div class="ml-3">
              <p class="text-sm text-yellow-700">
                This election's end date has not yet passed. Please wait until the end date to end the election.
              </p>
            </div>
          </div>
        </div>
        
        <p class="text-sm text-gray-500">
          This will close the voting period and finalize the results. Voters will no longer be able to cast votes. Are you sure you want to continue?
        </p>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button type="button" label="Cancel" severity="secondary" @click="visible = false" />
          <Button 
            type="button" 
            :label="confirmLabel" 
            icon="pi pi-check" 
            :loading="loading" 
            :disabled="isEndingDisabled"
            :severity="hasEndDatePassed ? 'danger' : 'warning'"
            @click="onConfirm" 
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  election: { type: Object, default: null },
  label: { type: String, default: 'End Election' },
  confirmLabel: { type: String, default: 'End Election' },
  icon: { type: String, default: 'pi pi-chart-bar' },
  size: { type: String, default: 'small' },
  severity: { type: String, default: 'danger' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false }
})

const emit = defineEmits(['confirm'])

const visible = ref(false)

const hasEndDatePassed = computed(() => {
  if (!props.election?.end_date) return true
  const endDate = new Date(props.election.end_date)
  const now = new Date()
  return now > endDate
})

const isEndingDisabled = computed(() => {
  // Only allow ending if the end date has passed or if the user is an admin
  return props.loading || (!hasEndDatePassed.value && !props.isAdmin)
})

const onConfirm = async () => {
  emit('confirm')
  visible.value = false
}
</script>
