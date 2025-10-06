<template>
  <section class="py-16 md:py-24">
    <div class="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-24 2xl:px-32">
      <!-- Section Header -->
      <div class="mb-6 mx-auto">
        <h2 class="text-2xl xs:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
          Voting Policy
        </h2>
        <div class="h-1.5 w-44  sm:w-72 bg-blue-600 rounded-full mb-6"></div>

        <p class="text-lg text-gray-600">
          Please review these important policy before casting your vote in the SSC elections. <br/>
          Your vote is confidential and secure. Once submitted, votes cannot be changed or withdrawn. 
          Make sure to carefully review your selections before finalizing your choices.
        </p>
      </div>

      <!-- Guidelines Grid -->
      <div class="grid md:grid-cols-3 mt-12 gap-8">
        <div v-for="(guideline, index) in guidelines" :key="index" 
             class="p-8 rounded-lg bg-gray-50 border border-gray-200">
            <!-- Icon -->
            <div class="mb-6">
              <div 
                v-if="guideline.icon === 'checklist'" 
                class="text-blue-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="3em" height="3em" viewBox="0 0 16 16">
                  <path fill="currentColor" d="M3.5 1A2.5 2.5 0 0 0 1 3.5v7A2.5 2.5 0 0 0 3.5 13h4.55c.075-.37.231-.71.45-1h-5A1.5 1.5 0 0 1 2 10.5v-7A1.5 1.5 0 0 1 3.5 2h7A1.5 1.5 0 0 1 12 3.5v2.541a3 3 0 0 1 1 0V3.5A2.5 2.5 0 0 0 10.5 1zm6.354 4.854a.5.5 0 0 0-.708-.708L6 8.293L4.854 7.146a.5.5 0 1 0-.708.708l1.5 1.5a.5.5 0 0 0 .708 0zM14.5 9a2 2 0 1 1-4 0a2 2 0 0 1 4 0m1.5 4.5c0 1.245-1 2.5-3.5 2.5S9 14.75 9 13.5a1.5 1.5 0 0 1 1.5-1.5h4a1.5 1.5 0 0 1 1.5 1.5" />
                </svg>
              </div>
              <div 
                v-else-if="guideline.icon === 'user-edit'" 
                class="text-blue-600"
              >
              <svg xmlns="http://www.w3.org/2000/svg" width="3em" height="3em" viewBox="0 0 24 24">
                <path fill="currentColor" d="M5 19V5v4.475V9zm2-6h5.525q.05-.55.25-1.05t.5-.95H7zm0 4h3.925q.425-.5.975-.812t1.15-.513q-.1-.15-.175-.325T12.75 15H7zm0-8h10V7H7zM5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v6.45q-.35-.65-.85-1.15T19 9.475V5H5v14h5.05q-.025.15-.038.3t-.012.3V21zm12-5q-1.05 0-1.775-.725T14.5 13.5t.725-1.775T17 11t1.775.725t.725 1.775t-.725 1.775T17 16m-5 5v-1.4q0-.6.313-1.112t.887-.738q.9-.375 1.863-.562T17 17t1.938.188t1.862.562q.575.225.888.738T22 19.6V21z" />
              </svg>
              </div>
              <div 
                v-else-if="guideline.icon === 'verified'" 
                class="text-blue-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="3em" height="3em" viewBox="0 0 24 24">
                  <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.3">
                    <path d="M3 5l2 2l4 -4" />
                    <path d="M3 12l2 2l4 -4" />
                    <path d="M3 19l2 2l4 -4" />
                    <g stroke-dasharray="24" stroke-dashoffset="24" stroke-width="1">
                      <path d="M11.5 5c0 -0.83 0.67 -1.5 1.5 -1.5h6c0.83 0 1.5 0.67 1.5 1.5c0 0.83 -0.67 1.5 -1.5 1.5h-6c-0.83 0 -1.5 -0.67 -1.5 -1.5Z" stroke-dashoffset="0" />
                      <path d="M11.5 12c0 -0.83 0.67 -1.5 1.5 -1.5h6c0.83 0 1.5 0.67 1.5 1.5c0 0.83 -0.67 1.5 -1.5 1.5h-6c-0.83 0 -1.5 -0.67 -1.5 -1.5Z" stroke-dashoffset="0" />
                      <path d="M11.5 19c0 -0.83 0.67 -1.5 1.5 -1.5h6c0.83 0 1.5 0.67 1.5 1.5c0 0.83 -0.67 1.5 -1.5 1.5h-6c-0.83 0 -1.5 -0.67 -1.5 -1.5Z" stroke-dashoffset="0" />
                    </g>
                  </g>
                </svg>
              </div>
            </div>
          
            <!-- Content -->
            <h3 class="text-xl font-bold text-gray-900 mb-4">{{ guideline.title }}</h3>
            <p class="text-gray-600 leading-relaxed">{{ guideline.description }}</p>
        </div>
      </div>


    </div>
  </section>
</template>

<script setup>
const guidelines = [
  {
    icon: 'checklist',
    title: 'Student Eligibility',
    description: 'Only registered students with valid MSU-Naawan credentials are eligible to participate in the Supreme Student Council elections. Ensure your student account is active and in good standing.'
  },
  {
    icon: 'user-edit',
    title: 'One Vote Per Position',
    description: 'Each voter is allowed to cast exactly one vote per position. The system will prevent multiple votes for the same position to ensure fair and democratic elections.'
  },
  {
    icon: 'verified',
    title: 'Final Verification',
    description: 'Carefully review all your selections before submitting your ballot. Once your vote is submitted, it cannot be modified, changed, or withdrawn for any reason.'
  }
];
</script>