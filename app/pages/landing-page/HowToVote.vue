<template>
  <section class="py-16 md:py-24 bg-white">
    <div class="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-24 2xl:px-32">
      <!-- Section Header -->
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          How to Vote
        </h2>
        <div class="w-20 h-1 bg-blue-600 mx-auto mb-6"></div>
        <p class="max-w-2xl mx-auto text-lg text-gray-600">
          Follow these simple steps to cast your vote in the Supreme Student Council elections.
        </p>
      </div>

      <!-- Steps -->
      <div class="max-w-4xl mx-auto">
        <div class="space-y-8">
          <div v-for="(step, index) in steps" :key="index" 
               class="flex items-start gap-6 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300">
            <!-- Step Number -->
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                {{ index + 1 }}
              </div>
            </div>
            
            <!-- Step Content -->
            <div class="flex-1">
              <h3 class="text-xl font-bold text-gray-900 mb-3">{{ step.title }}</h3>
              <p class="text-gray-600 leading-relaxed text-lg">{{ step.description }}</p>
              
              <!-- Additional tips for certain steps -->
              <div v-if="step.tip" class="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                <p class="text-sm text-blue-700">
                  <span class="font-medium">💡 Tip:</span> {{ step.tip }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- CTA Section -->
        <div class="mt-16 text-center p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
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
    </div>
  </section>
</template>

<script setup>
const steps = [
  {
    title: 'Access the Voting System',
    description: 'Log in to the digital voting platform using your MSU-Naawan student credentials. Your student ID and password will authenticate your eligibility to vote.',
    tip: 'Make sure you\'re using a stable internet connection and a supported browser for the best experience.'
  },
  {
    title: 'Browse the Candidates',
    description: 'Review all candidates running for different positions in the Supreme Student Council. Take time to read their platforms and qualifications to make informed decisions.',
    tip: 'Click on individual candidates to view their detailed profiles, photos, and campaign platforms.'
  },
  {
    title: 'Make Your Selections',
    description: 'Choose your preferred candidate for each available position. You can select one candidate per position, and you\'re not required to vote for every position if you prefer to abstain.',
    tip: 'Your selections will be highlighted as you make them. You can change your choices before final submission.'
  },
  {
    title: 'Review Your Ballot',
    description: 'Carefully review all your selections before submitting. Double-check that you\'ve chosen the candidates you intended for each position.',
    tip: 'Take your time during this step - once submitted, your vote cannot be changed or withdrawn.'
  },
  {
    title: 'Submit and Confirm',
    description: 'Submit your completed ballot to the system. You will receive an immediate confirmation that your vote has been successfully recorded and counted.',
    tip: 'Save or screenshot your confirmation for your records. This proves your successful participation in the election.'
  }
];
</script>