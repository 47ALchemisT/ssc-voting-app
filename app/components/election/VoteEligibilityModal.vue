<template>
  <div>
    <Button 
      :label="label"
      :icon="icon"
      :size="size"
      :disabled="disabled"
      @click="showModal = true"
      :pt="{
        root: {
          class: isVotingPeriod ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300 cursor-not-allowed',
          'text-white': isVotingPeriod
        }
      }"
      v-tooltip.top="isVotingPeriod ? 'Check your voting eligibility' : 'Voting is not currently open'"
    />

    <Dialog 
      v-model:visible="showModal" 
      modal 
      :draggable="false"
      header="Checking Eligibility" 
      :style="{ width: '450px' }"
      :closable="!loading"
    >
      <div class="flex flex-col items-center py-4">
        <div v-if="loading" class="flex flex-col items-center justify-center text-center">
          <Searching class="text-blue-500"/>
          <p class="text-gray-700 text-sm mt-3">{{ currentMessage }}</p>
        </div>
        
        <template v-else>
          <div v-if="error" class="text-center">
            <i class="pi pi-times-circle text-4xl text-red-500 mb-4"></i>
            <p class="text-gray-700 mb-4">{{ error }}</p>
            <Button 
              label="Try Again" 
              icon="pi pi-refresh" 
              @click="checkEligibility"
              class="p-button-text"
            />
          </div>
          
          <div v-else-if="alreadyVoted" class="text-center">
            <i class="pi pi-check-circle text-4xl text-green-500 mb-4"></i>
            <p class="text-gray-800 font-medium mb-2">You already voted in this election.</p>
            <p class="text-sm text-gray-500 px-5">
              Your vote has been recorded. You can review your submission on the confirmation page.
            </p>
            <div class="flex justify-center gap-3 pt-4">
              <Button 
                label="Close" 
                severity="secondary"
                @click="showModal = false" 
              />
              <Button 
                label="View my vote" 
                icon="pi pi-check-circle" 
                iconPos="left"
                @click="navigateToConfirmation"
              />
            </div>
          </div>

          <div v-else-if="!isEligible" class="text-center">
            <NotFound class="mx-auto mb-4 w-16 h-16 text-yellow-400"/>
            <p class="text-gray-700 font-medium  mb-2">Oops!...You are not eligible to vote in this election.</p>
            <p class="text-sm text-gray-500 px-5">
              This could be because your account is not in the voters list for this election, 
              or there might be a server error. If you believe this is incorrect, 
              please contact the election administrator for assistance.
            </p>
          </div>
          
          <div v-else class="text-center">
            <Authorized class="mx-auto mb-4 text-blue-500"/>
            <p class="text-gray-800 font-medium mb-2">You're Eligible to Vote!</p>
            <p class="text-gray-600 text-sm px-5 mb-6">
              Your account has been verified and you're all set to participate in this election.
              Click the button below to proceed to the voting page.
            </p>
            <div class="flex justify-center gap-3 pt-2">
              <Button 
                label="Vote Later" 
                fluid
                severity="secondary"
                @click="showModal = false" 
              />
              <Button 
                label="Proceed to Vote" 
                icon="pi pi-arrow-right" 
                fluid
                iconPos="right"
                @click="navigateToVote"
              />
            </div>
          </div>
        </template>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useVoteStore } from '../../../stores/votes'
import { useAuthStore } from '../../../stores/auth'
import Searching from '../../assets/Icons/Searching.vue'
import NotFound from '../../assets/Icons/NotFound.vue'
import Authorized from '../../assets/Icons/Authorized.vue'

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

const router = useRouter()
const showModal = ref(false)
const loading = ref(false)
const error = ref(null)
const isEligible = ref(false)
const loadingMessages = [
  'Verifying your account...',
  'Checking voter database...',
  'Validating credentials...',
  'Finalizing verification...'
]
const currentMessage = ref(loadingMessages[0])
const voteStore = useVoteStore()
const authStore = useAuthStore()
const alreadyVoted = ref(false)

const checkEligibility = async () => {
  if (!props.isVotingPeriod) return
  
  loading.value = true
  error.value = null
  isEligible.value = false
  alreadyVoted.value = false
  showModal.value = true
  currentMessage.value = loadingMessages[0]
  
  // Update message every 0.9 seconds (3.6s total for 4 messages)
  const messageInterval = setInterval(() => {
    const currentIndex = loadingMessages.indexOf(currentMessage.value)
    const nextIndex = (currentIndex + 1) % loadingMessages.length
    currentMessage.value = loadingMessages[nextIndex]
  }, 900)
  
  try {
    // Add a 2.7-second delay before checking eligibility
    await new Promise(resolve => setTimeout(resolve, 3000))

    // First check: has the user already voted in this election?
    const userId = authStore.profile?.id
    try {
      const hasVoted = await voteStore.hasUserVoted(userId, props.electionId)
      if (hasVoted) {
        clearInterval(messageInterval)
        loading.value = false
        alreadyVoted.value = true
        isEligible.value = false
        emit('not-eligible')
        return
      }
    } catch (e) {
      // If check fails, treat as not eligible with error
      console.error('Error checking if user has already voted:', e)
      clearInterval(messageInterval)
      loading.value = false
      error.value = 'Unable to verify your voting status. Please try again.'
      isEligible.value = false
      emit('not-eligible')
      return
    }

    // Second check: is user in the voters list / eligible
    const { isEligible: eligible, error: eligibilityError } = await voteStore.isUserEligibleToVote(props.electionId)
    clearInterval(messageInterval)
    loading.value = false
    if (eligibilityError) {
      error.value = eligibilityError
      isEligible.value = false
      emit('not-eligible')
    } else {
      isEligible.value = eligible
      if (eligible) {
        // Passed both checks
        emit('eligible')
      } else {
        emit('not-eligible')
      }
    }
  } catch (err) {
    clearInterval(messageInterval)
    console.error('Error checking eligibility:', err)
    error.value = 'An error occurred while checking your eligibility. Please try again.'
    loading.value = false
    emit('not-eligible')
  }
}

const navigateToVote = () => {
  showModal.value = false
  router.push(`/elections/${props.electionId}/vote`)
}

const navigateToConfirmation = () => {
  showModal.value = false
  router.push(`/elections/${props.electionId}/confirmation`)
}

// Check eligibility when modal is opened
watch(showModal, (newVal) => {
  if (newVal && !isEligible.value) {
    checkEligibility()
  }
})
</script>
