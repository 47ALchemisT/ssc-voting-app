<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-6 sm:px-0">
      <!-- Mobile: Sidebar content first -->
      <div class="block lg:hidden mb-8">
        <div class="space-y-6">
          <!-- Header Section -->
          <div>
            <h2 class="text-2xl xs:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Guidelines
            </h2>
            <div class="h-1.5 w-32 sm:w-56 bg-blue-600 rounded-full mb-6"></div>
            <div class="text-center mb-4 bg-white p-6 rounded-sm border border-gray-200">
              <div class="mb-6">
                <img class="w-24 h-24 rounded-full mx-auto" src="~/assets/images/Background.png" alt="MSU Naawan Logo">
              </div>
              <h1 class="text-xl font-bold text-gray-900">
                Mindanao State University at Naawan (MSUN)
              </h1>
              <p class="text-gray-700 mt-2">Supreme Student Council (SSC) Centralized Election</p>
              <p class="text-lg font-medium text-blue-600 mt-4">Guidelines</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="bg-white p-6 rounded-lg border border-gray-200">
            <div class="text-center text-gray-600">
              <p class="font-medium">Prepared by:</p>
              <p class="text-gray-800 font-semibold mt-2">Sylvia C. Labial</p>
              <p class="text-sm">COMELEC Chair</p>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <!-- Main content - spans full width on mobile, 3 cols on desktop -->
        <div class="lg:col-span-3">
          <div class="card border border-gray-200 rounded-lg">
            <Accordion :multiple="true" :activeIndex="[0]">
              <!-- I. Rationale -->
              <AccordionTab>
                <template #header>
                  <span class="font-semibold text-gray-800">I. Rationale</span>
                </template>
                <p class="text-gray-700 leading-relaxed">
                  The Supreme Student Council (SSC) serves as the highest governing student body of MSUN,
                  representing the studentry in matters concerning student rights, welfare, and development. To
                  uphold democratic processes and ensure fair, transparent, and unified student elections, the
                  University adopts a centralized election system that standardizes the conduct of elections
                  across the SSC, College Executive Councils (CECs), and recognized student societies.
                </p>
              </AccordionTab>

              <!-- II. Objectives -->
              <AccordionTab>
                <template #header>
                  <span class="font-semibold text-gray-800">II. Objectives</span>
                </template>
                <p class="text-gray-700 mb-4">
                  This policy aims to:
                </p>
                <ol class="list-decimal pl-6 space-y-2 text-gray-700">
                  <li>Establish clear and transparent guidelines for the conduct of centralized student elections.</li>
                  <li>Ensure fairness, integrity, and accountability in the selection of student leaders.</li>
                  <li>Uphold the independence of the Commission on Elections (COMELEC) as the primary body overseeing the electoral process.</li>
                  <li>Provide due process for grievances, complaints, and election-related concerns.</li>
                </ol>
              </AccordionTab>

              <!-- III. Coverage -->
              <AccordionTab>
                <template #header>
                  <span class="font-semibold text-gray-800">III. Coverage</span>
                </template>
                <p class="text-gray-700 mb-4">
                  The centralized election applies to all student organizations within MSUN, specifically:
                </p>
                <ul class="list-disc pl-6 space-y-2 mb-4 text-gray-700">
                  <li>Supreme Student Council (SSC)</li>
                  <li>College Executive Councils (CECs)</li>
                  <li>Recognized Societies and Student Organizations</li>
                </ul>
                <p class="text-gray-700">
                  The positions to be contested are determined by the Constitution and By-Laws (CBL) of
                  each respective organization.
                </p>
              </AccordionTab>

              <!-- IV. Commission on Elections (COMELEC) -->
              <AccordionTab>
                <template #header>
                  <span class="font-semibold text-gray-800">IV. Commission on Elections (COMELEC)</span>
                </template>
                <div class="space-y-6">
                  <div>
                    <h4 class="font-medium text-gray-800 mb-2">1. Composition</h4>
                    <ul class="list-disc pl-6 space-y-1 text-gray-700">
                      <li>Chairperson (OSD Director)</li>
                      <li>Vice Chairperson (in charge of online postings and Google survey ballot creation)</li>
                      <li>Secretary</li>
                      <li>Grievance Committee Members</li>
                      <li>Student representatives from each college who are not running for any position</li>
                    </ul>
                  </div>

                  <div>
                    <h4 class="font-medium text-gray-800 mb-2">2. Authority</h4>
                    <ul class="list-disc pl-6 space-y-1 text-gray-700">
                      <li>A Special Order issued by the Chancellor authorizes COMELEC to administer the centralized election.</li>
                      <li>COMELEC is independent from the SSC and functions solely as the election governing body.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 class="font-medium text-gray-800 mb-2">3. Responsibilities</h4>
                    <ul class="list-disc pl-6 space-y-1 text-gray-700">
                      <li>Facilitate both online and face-to-face (F2F) voting.</li>
                      <li>Manage application and candidacy processes.</li>
                      <li>Ensure transparency of election results.</li>
                      <li>Address complaints and grievances.</li>
                      <li>Proclaim official winners upon validation.</li>
                    </ul>
                  </div>
                </div>
              </AccordionTab>

              <!-- V. Candidacy Requirements and Application -->
              <AccordionTab>
                <template #header>
                  <span class="font-semibold text-gray-800">V. Candidacy Requirements and Application</span>
                </template>
                <div class="space-y-6">
                  <div>
                    <h4 class="font-medium text-gray-800 mb-2">1. Qualifications</h4>
                    <p class="text-gray-700">
                      Candidates must comply with the candidacy requirements as prescribed in the CBL of their respective organizations.
                    </p>
                  </div>
                  <div>
                    <h4 class="font-medium text-gray-800 mb-2">2. Application Process</h4>
                    <ul class="list-disc pl-6 space-y-1 text-gray-700">
                      <li>Submission of online application (via Google Form) and printed form to the Office of Student Development.</li>
                      <li>Application shall be verified and certified by COMELEC before official candidacy is recognized.</li>
                    </ul>
                  </div>
                </div>
              </AccordionTab>

              <!-- VI. Election Procedures -->
              <AccordionTab>
                <template #header>
                  <span class="font-semibold text-gray-800">VI. Election Procedures</span>
                </template>
                <div class="space-y-6">
                  <div>
                    <h4 class="font-medium text-gray-800 mb-2">1. Campaign Period</h4>
                    <ul class="list-disc pl-6 space-y-1 text-gray-700">
                      <li>Candidates shall be formally introduced through a Miting de Avance (face-to-face forum at TSAC).</li>
                      <li>Campaign rules and regulations shall be observed as prescribed by the COMELEC.</li>
                    </ul>
                  </div>
                  <div>
                    <h4 class="font-medium text-gray-800 mb-2">2. Voting Process</h4>
                    <p class="text-gray-700 mb-2">Elections shall be conducted through a combination of:</p>
                    <ul class="list-disc pl-6 space-y-1 text-gray-700">
                      <li>Online Voting (via Google survey forms)</li>
                      <li>Face-to-Face Voting in designated precincts (usually at the Function House)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 class="font-medium text-gray-800 mb-2">3. Transparency Measures</h4>
                    <ul class="list-disc pl-6 space-y-1 text-gray-700">
                      <li>All COMELEC members shall have access to the online voting forms to ensure election credibility.</li>
                      <li>Verification of election returns shall be collectively certified by the COMELEC.</li>
                    </ul>
                  </div>
                </div>
              </AccordionTab>

              <!-- VII. Announcement and Validation of Results -->
              <AccordionTab>
                <template #header>
                  <span class="font-semibold text-gray-800">VII. Announcement and Validation of Results</span>
                </template>
                <div class="space-y-6">
                  <div>
                    <h4 class="font-medium text-gray-800 mb-2">1. Unofficial Results</h4>
                    <p class="text-gray-700">
                      Posted for two (2) days to allow for the filing of complaints, protests, or clarifications from candidates.
                    </p>
                  </div>
                  <div>
                    <h4 class="font-medium text-gray-800 mb-2">2. Official Results</h4>
                    <p class="text-gray-700 mb-2">
                      Declared after validation and public acceptance by all candidates and students without suspicion of fraud.
                    </p>
                    <p class="text-gray-700 mb-2">
                      Considered final and official once:
                    </p>
                    <ul class="list-disc pl-6 space-y-1 text-gray-700">
                      <li>Signed by all COMELEC members</li>
                      <li>Approved by the Chancellor</li>
                    </ul>
                  </div>
                </div>
              </AccordionTab>

              <!-- VIII. Grievance and Protest Mechanism -->
              <AccordionTab>
                <template #header>
                  <span class="font-semibold text-gray-800">VIII. Grievance and Protest Mechanism</span>
                </template>
                <ul class="list-disc pl-6 space-y-2 text-gray-700">
                  <li>A Grievance Committee under COMELEC shall handle all formal complaints and protests.</li>
                  <li>Complaints must be filed within the prescribed two-day posting of unofficial results.</li>
                  <li>Decisions of the COMELEC are final and executory, subject to the approval of the Chancellor.</li>
                </ul>
              </AccordionTab>

              <!-- IX. Effectivity -->
              <AccordionTab>
                <template #header>
                  <span class="font-semibold text-gray-800">IX. Effectivity</span>
                </template>
                <p class="text-gray-700">
                  This policy shall take effect immediately upon approval by the University Chancellor and
                  shall remain in force until amended or repealed by proper authority.
                </p>
              </AccordionTab>
            </Accordion>
          </div>
        </div>

        <!-- Sidebar - hidden on mobile, shown on desktop -->
        <div class="hidden lg:block lg:col-span-2">
          <!-- Sticky container -->
          <div class="sticky top-24 space-y-6">
            <!-- Header Section -->
            <div>
              <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Guidelines
              </h2>
              <div class="h-1.5 w-56 bg-blue-600 rounded-full mb-6"></div>
              <div class="text-center mb-4 bg-white p-6 rounded-sm border border-gray-200">
                <div class="mb-6 flex gap-3 justify-center">
                  <img class="w-24 h-24 rounded-full" src="~/assets/images/Background.png" alt="MSU Naawan Logo">
                  <img class="w-24 h-24 rounded-full" src="~/assets/images/SSC-logo-final.jpg" alt="MSU Naawan Logo">

                </div>
                <h1 class="text-xl font-bold text-gray-900">
                  Mindanao State University at Naawan (MSUN)
                </h1>
                <p class="text-gray-700 mt-2">Supreme Student Council (SSC) Centralized Election</p>
                <p class="text-lg font-medium text-blue-600 mt-4">Guidelines</p>
              </div>
            </div>

            <!-- Footer -->
            <div class="bg-white p-6 rounded-lg border border-gray-200">
              <div class="text-center text-gray-600">
                <p class="font-medium">Prepared by:</p>
                <p class="text-gray-800 font-semibold mt-2">Sylvia C. Labial</p>
                <p class="text-sm">COMELEC Chair</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
</script>