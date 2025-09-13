<template>
  <div>
    <Button 
      :label="label"
      :icon="icon"
      :size="size"
      :disabled="disabled || loading"
      @click="checkEligibility"
      :pt="{
        root: {
          class: isVotingPeriod && !loading ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300 cursor-not-allowed',
          'text-white': isVotingPeriod && !loading
        }
      }"
      v-tooltip.top="tooltipText"
    >
      <template #icon v-if="loading">
        <i class="pi pi-spin pi-spinner"></i>
      </template>
    </Button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'

const props = defineProps({
  electionId: {
    type: [String, Number],
    required: true
  },
  isVotingPeriod: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: 'Vote Now'
  },
  icon: {
    type: String,
    default: 'pi pi-check-square'
  },
  size: {
    type: String,
    default: 'small'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['eligible', 'not-eligible'])

const toast = useToast()
const router = useRouter()
const loading = ref(false)

const tooltipText = computed(() => {
  if (loading.value) return 'Checking eligibility...'
  return props.isVotingPeriod 
    ? 'Cast your vote in this election' 
    : 'Voting is not currently open'
})

const checkEligibility = async () => {
  if (!props.isVotingPeriod) return
  
  loading.value = true
  
  try {
    // Simulate API call to check eligibility
    // Replace this with your actual API call
    const isEligible = await checkVoterEligibility(props.electionId)
    
    if (isEligible) {
      emit('eligible')
      router.push(`/elections/${props.electionId}/vote`)
    } else {
      emit('not-eligible')
      toast.add({
        severity: 'warn',
        summary: 'Not Eligible',
        detail: 'You are not eligible to vote in this election.',
        life: 5000
      })
    }
  } catch (error) {
    console.error('Error checking eligibility:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to check voting eligibility. Please try again.',
      life: 5000
    })
  } finally {
    loading.value = false
  }
}

// Replace this with your actual API call
const checkVoterEligibility = async (electionId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // For demo purposes, randomly return true/false
  // In a real app, you would make an API call to check eligibility
  return Math.random() > 0.3 // 70% chance of being eligible for demo
}
</script>
