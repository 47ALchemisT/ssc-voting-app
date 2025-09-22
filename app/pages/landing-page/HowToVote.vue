<template>
  <section class="py-16 md:py-24 bg-white">
    <div class="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-24 2xl:px-32">
      <!-- Section Header -->
      <div class="text-center mb-20">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          How to Vote
        </h2>
        <p class="max-w-2xl mx-auto text-lg text-gray-600">
          Follow these simple steps to cast your vote in the Supreme Student Council elections.
        </p>
      </div>

      <!-- Timeline Steps -->
      <div class="max-w-8xl mx-auto">
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
      <div class="mt-16 text-center p-8 bg-blue-50 rounded-xl border border-blue-200">
        <h3 class="text-2xl font-bold text-gray-900 mb-4">Ready to Vote?</h3>
        <p class="text-gray-600 mb-6 max-w-2xl mx-auto">
          Your participation shapes the future of our campus. Make your voice heard by casting your vote today.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink 
            to="/vote" 
            class="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 text-center"
          >
            Start Voting Now
          </NuxtLink>
          <NuxtLink 
            to="/candidates" 
            class="px-8 py-3.5 border-2 border-blue-600 hover:bg-blue-50 text-blue-600 font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 text-center"
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