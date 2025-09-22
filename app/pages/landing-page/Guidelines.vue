<template>
  <section class="py-16 md:py-24 bg-gray-50">
    <div class="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-24 2xl:px-32">
      <!-- Section Header -->
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Voting Guidelines
        </h2>
        <div class="w-20 h-1 bg-blue-600 mx-auto mb-6"></div>
        <p class="max-w-2xl mx-auto text-lg text-gray-600">
          Please review these important guidelines before casting your vote in the SSC elections.
        </p>
      </div>

      <!-- Guidelines Grid -->
      <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div v-for="(guideline, index) in guidelines" :key="index" 
             class="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <!-- Icon -->
          <div class="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
            <div class="text-3xl">{{ guideline.icon }}</div>
          </div>
          
          <!-- Content -->
          <h3 class="text-xl font-bold text-gray-900 mb-4">{{ guideline.title }}</h3>
          <p class="text-gray-600 leading-relaxed">{{ guideline.description }}</p>
        </div>
      </div>

      <!-- Important Notice -->
      <div class="mt-12 max-w-4xl mx-auto">
        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div class="ml-4">
              <h4 class="text-lg font-semibold text-yellow-800 mb-2">Important Notice</h4>
              <p class="text-yellow-700">
                Your vote is confidential and secure. Once submitted, votes cannot be changed or withdrawn. 
                Make sure to carefully review your selections before finalizing your choices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const guidelines = [
  {
    icon: '📋',
    title: 'Student Eligibility',
    description: 'Only registered students with valid MSU-Naawan credentials are eligible to participate in the Supreme Student Council elections. Ensure your student account is active and in good standing.'
  },
  {
    icon: '🔒',
    title: 'One Vote Per Position',
    description: 'Each voter is allowed to cast exactly one vote per position. The system will prevent multiple votes for the same position to ensure fair and democratic elections.'
  },
  {
    icon: '✅',
    title: 'Final Verification',
    description: 'Carefully review all your selections before submitting your ballot. Once your vote is submitted, it cannot be modified, changed, or withdrawn for any reason.'
  }
];
</script>