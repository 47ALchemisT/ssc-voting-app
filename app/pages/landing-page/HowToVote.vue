<template>
  <section class="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
    <div class="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
      <!-- Section Header -->
      <div class="text-center mb-12 sm:mb-16 md:mb-20">
        <h2 class="text-2xl xs:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          How to Vote
        </h2>
        <div class="h-1.5 w-40 sm:w-56 md:w-72 bg-blue-600 mx-auto rounded-full mb-4 sm:mb-6"></div>
        <p class="max-w-2xl mx-auto text-base sm:text-lg text-gray-600 px-2 sm:px-0">
          Follow these simple steps to cast your vote in the Supreme Student Council elections.
        </p>
      </div>

      <!-- Mobile Steps (Cards) -->
      <div class="lg:hidden space-y-6 max-w-2xl mx-auto">
        <div v-for="(step, index) in steps" :key="index" class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full text-white" :style="{ backgroundColor: step.color }">
              <i :class="step.icon" class="text-lg"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span class="text-blue-600">{{ step.step }}:</span>
                <span>{{ step.title }}</span>
              </h3>
              <p class="mt-2 text-gray-700 text-sm sm:text-base">{{ step.description }}</p>
              <div v-if="step.tip" class="mt-3 p-3 bg-blue-50 rounded-lg">
                <p class="text-blue-700 text-xs sm:text-sm flex items-start gap-2">
                  <i class="pi pi-info-circle mt-0.5 flex-shrink-0"></i>
                  <span>{{ step.tip }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop Timeline -->
      <div class="hidden lg:block max-w-8xl mx-auto">
        <Timeline :value="steps" align="alternate" class="customized-timeline">
          <template #marker="slotProps">
            <span class="flex w-12 h-12 items-center justify-center text-white rounded-full z-10 shadow-md" 
                  :style="{ backgroundColor: slotProps.item.color }">
              <i :class="slotProps.item.icon" class="text-xl"></i>
            </span>
          </template>
          <template #content="slotProps">
            <Card class="mb-8 shadow-none border border-gray-200 hover:bg-gray-50 transition-all duration-300">
              <template #title>
                <div class="flex items-center gap-3">
                  <span class="text-blue-600">{{ slotProps.item.step }} : </span>
                  <span class="text-gray-900">{{ slotProps.item.title }}</span>
                </div>
              </template>
              <template #content>
                <p class="text-gray-700 mb-4">{{ slotProps.item.description }}</p>
                <div v-if="slotProps.item.tip" class="p-4 bg-blue-50 rounded-lg">
                  <p class="text-blue-700 text-sm flex items-start gap-2">
                    <i class="pi pi-info-circle mt-0.5"></i>
                    <span>{{ slotProps.item.tip }}</span>
                  </p>
                </div>
              </template>
            </Card>
          </template>
        </Timeline>
      </div>

      <!-- CTA Section -->
      <div class="mt-12 sm:mt-16 text-center p-6 sm:p-8 bg-blue-50 rounded-xl border border-blue-200">
        <h3 class="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Ready to Vote?</h3>
        <p class="text-gray-600 mb-4 sm:mb-6 max-w-2xl mx-auto text-sm sm:text-base">
          Your participation shapes the future of our campus. Make your voice heard by casting your vote today.
        </p>
        <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <NuxtLink 
            to="/vote" 
            class="px-6 sm:px-8 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 text-sm sm:text-base text-center"
          >
            Start Voting Now
          </NuxtLink>
          <NuxtLink 
            to="/candidates" 
            class="px-6 sm:px-8 py-2.5 sm:py-3 border-2 border-blue-600 hover:bg-blue-50 text-blue-600 font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 text-sm sm:text-base text-center"
          >
            View Candidates
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const steps = ref([
  {
    step: 'Step 1',
    title: 'Access the Voting System',
    description: 'Log in to the digital voting platform using your MSU-Naawan student credentials. Your university email will authenticate your eligibility to vote.',
    tip: 'Make sure you\'re using a stable internet connection and a supported browser for the best experience.',
    icon: 'pi pi-sign-in',
    color: '#3B82F6'
  },
  {
    step: 'Step 2',
    title: 'Browse the Candidates',
    description: 'Review all candidates running for different positions in the Supreme Student Council. Take time to read their platforms and qualifications to make informed decisions.',
    tip: 'Click on individual candidates to view their detailed profiles, photos, and campaign platforms.',
    icon: 'pi pi-users',
    color: '#3B82F6'
  },
  {
    step: 'Step 3',
    title: 'Make Your Selections',
    description: 'Choose your preferred candidate for each available position. You can select one candidate per position, and you\'re not required to vote for every position if you prefer to abstain.',
    tip: 'Your selections will be highlighted as you make them. You can change your choices before final submission.',
    icon: 'pi pi-check-square',
    color: '#3B82F6'
  },
  {
    step: 'Step 4',
    title: 'Review Your Ballot',
    description: 'Carefully review all your selections before submitting. Double-check that you\'ve chosen the candidates you intended for each position.',
    tip: 'Take your time during this step - once submitted, your vote cannot be changed or withdrawn.',
    icon: 'pi pi-eye',
    color: '#3B82F6'
  },
  {
    step: 'Step 5',
    title: 'Submit and Confirm',
    description: 'Submit your completed ballot to the system. You will receive an immediate confirmation that your vote has been successfully recorded and counted.',
    tip: 'Save or screenshot your confirmation for your records. This proves your successful participation in the election.',
    icon: 'pi pi-check-circle',
    color: '#3B82F6'
  }
]);
</script>