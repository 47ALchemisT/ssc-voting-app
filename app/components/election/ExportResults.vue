<template>
  <div>
    <Button
      icon="pi pi-file-pdf"
      label="Export Results"
      :disabled="disabled"
      :loading="exporting"
      @click="showPreview = true"
      class="p-button-outlined p-button-sm"
    />
    
    <!-- Preview Dialog -->
    <Dialog 
      v-model:visible="showPreview" 
      :modal="true" 
      :style="{ width: '80vw', maxWidth: '1000px' }" 
      :header="'Export Preview'"
      :closable="!exporting"
      :closeOnEscape="!exporting"
    >
      <div class="preview-container">
        <div class="preview-content">
          <div class="text-center p-4 border-b">
            <h2 class="text-2xl font-bold mb-2">Election Result</h2>
            <div class="text-sm text-gray-500">
              Generated on {{ formattedDate }}
            </div>
          </div>
          
          <div class="preview-scrollable">
            <div v-for="position in positions" :key="position.id" class="mb-6">
              <div class="p-3 bg-gray-50 border-b border-gray-200">
                <h3 class="text-lg font-semibold">{{ position.title || position.name || 'Unnamed Position' }}</h3>
              </div>
              <div class="overflow-x-auto">
                <table class="min-w-full">
                  <thead>
                    <tr class="bg-gray-100">
                      <th class="text-left p-2">Candidate</th>
                      <th class="text-right p-2">Votes</th>
                      <th class="text-right p-2">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="candidate in position.candidates" :key="candidate.id" class="border-b">
                      <td class="p-2">
                        <div class="font-medium">{{ candidate.name || 'Unnamed Candidate' }}</div>
                        <div v-if="candidate.partylist" class="text-xs text-gray-500">
                          {{ candidate.partylist }}
                        </div>
                      </td>
                      <td class="text-right p-2">{{ candidate.vote_count || 0 }}</td>
                      <td class="text-right p-2">
                        {{ calculatePercentage(candidate.vote_count, getTotalVotes(position.candidates)) }}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <Button 
          label="Cancel" 
          icon="pi pi-times" 
          @click="showPreview = false" 
          class="p-button-text" 
          :disabled="exporting" 
        />
        <Button 
          :label="exporting ? 'Generating...' : 'Download PDF'" 
          :icon="exporting ? 'pi pi-spinner pi-spin' : 'pi pi-download'" 
          @click="exportToPdf" 
          :disabled="exporting"
          :loading="exporting"
          class="p-button-primary"
        />
      </template>
    </Dialog>
    
    <!-- Hidden PDF content (no longer used but kept for reference) -->
    <div ref="pdfContent" style="display: none;"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import 'html2canvas'; // Ensure html2canvas is available
import MSULogo from '../../assets/images/Background.png';
import SSCLogo from '../../assets/images/SSC_Logo.jpg';


// Import html2pdf dynamically
let html2pdf;

// Load html2pdf.js dynamically
if (process.client) {
  import('html2pdf.js').then(module => {
    html2pdf = module.default || module;
  }).catch(error => {
    console.error('Failed to load html2pdf.js:', error);
    throw error; // Re-throw to handle in the calling function
  });
}

const props = defineProps({
  positions: {
    type: Array,
  },
  electionName: {
    type: String,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  totalVoters: {
    type: Number,
    default: 0
  }
});

const showPreview = ref(false);
const exporting = ref(false);
const pdfContent = ref(null);

// Ensure html2pdf is properly initialized
onMounted(() => {
  if (process.client && !html2pdf) {
    import('html2pdf.js').then(module => {
      html2pdf = module.default || module;
    }).catch(error => {
      console.error('Failed to load html2pdf.js:', error);
    });
  }
});

// Format the current date
const formattedDate = computed(() => {
  return new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

const getTotalVotes = (candidates) => {
  if (!candidates || !Array.isArray(candidates)) return 0;
  return candidates.reduce((total, c) => total + (c.vote_count || 0), 0);
};

const calculatePercentage = (votes, totalVotes) => {
  if (!totalVotes || isNaN(votes)) return '0.0';
  const percentage = ((votes || 0) / totalVotes) * 100;
  return percentage.toFixed(1);
};

const exportToPdf = async () => {
  if (!process.client || !html2pdf) {
    console.error('html2pdf not available');
    return;
  }
  
  exporting.value = true;
  
  try {
    // Create a temporary div for the PDF content
    const tempDiv = document.createElement('div');
    
    // Convert imported images to data URLs
    const getBase64Image = (img) => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      return canvas.toDataURL('image/png');
    };
    
    // Create image elements from the imported images
    const msuLogo = new Image();
    msuLogo.src = MSULogo;
    const sscLogo = new Image();
    sscLogo.src = SSCLogo;
    
    // Generate HTML for the PDF with logos and centered text
    let htmlContent = [
      '<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">',
      '  <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 30px;">',
      '    <div style="width: 80px; height: 80px; display: flex; align-items: center;">',
      '      <img src="' + msuLogo.src + '" style="max-width: 100%; max-height: 65px; object-fit: contain;" alt="MSU Logo">',
      '    </div>',
      '    <div style="text-align: center;">',
      '      <div style="font-size: 18px; font-weight: 600; color: #3c3c3c;">Mindanao State University at Naawan</div>',
      '      <div style="font-size: 18px; font-weight: 600; color: #3c3c3c; margin-bottom: 5px;">Supreme Student Council</div>',
      '      <div style="font-size: 20px; font-weight: 700; margin: 10px 0; color: #3c3c3c;">Election Result</div>',
      '      <div style="color: #888; font-size: 12px;">Generated on ' + formattedDate.value + '</div>',
      '    </div>',
      '    <div style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: flex-end;">',
      '      <img src="' + sscLogo.src + '" style="max-width: 100%; max-height: 80px; object-fit: contain;" alt="SSC Logo">',
      '    </div>',
      '  </div>',
    ].join('');

// Add each position's results as a table
    if (Array.isArray(props.positions)) {
      props.positions.forEach((position) => {
        if (!position) return;
        
        const positionName = position.title || position.name || 'Unnamed Position';
        const candidates = Array.isArray(position.candidates) ? position.candidates : [];
        const totalVotes = getTotalVotes(candidates);
        const sortedCandidates = [...candidates].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
        
        htmlContent += 
          '<div style="margin-bottom: 30px; page-break-inside: avoid;">' +
            '<h2 style="font-size: 16px; color: #3c3c3c; font-weight: 600; margin: 0 0 10px 0; padding: 8px 0;">' +
              positionName +
            '</h2>' +
            '<table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; border: 1px solid #3c3c3c;">' +
              '<thead>' +
                '<tr style="background-color: #f1f5f9;">' +
                  '<th style="text-align: left; padding: 5px; font-weight: 600; border: 1px solid #3c3c3c; width: 60%;">Candidate</th>' +
                  '<th style="text-align: left; padding: 5px; font-weight: 600; border: 1px solid #3c3c3c; width: 20%;">Partylist</th>' +
                  '<th style="text-align: right; padding: 5px; font-weight: 600; border: 1px solid #3c3c3c; width: 10%;">Votes</th>' +
                  '<th style="text-align: right; padding: 5px; font-weight: 600; border: 1px solid #3c3c3c; width: 10%;">%</th>' +
                '</tr>' +
              '</thead>' +
              '<tbody>' +
                sortedCandidates.map(candidate => {
                  const name = candidate.name || 'Unnamed Candidate';
                  const partylist = candidate.partylist || 'Independent';
                  const votes = candidate.vote_count || 0;
                  const percentage = calculatePercentage(votes, totalVotes);
                  
                  return (
                    '<tr style="border-bottom: 1px solid #3c3c3c;">' +
                    `  <td style="padding: 5px; border-right: 1px solid #3c3c3c;">${name}</td>` +
                    `  <td style="padding: 5px; border-right: 1px solid #3c3c3c; color: #666; font-size: 12px;">${partylist}</td>` +
                    `  <td style="text-align: right; padding: 5px; border-right: 1px solid #3c3c3c;">${votes}</td>` +
                    `  <td style="text-align: right; padding: 5px;">${percentage}%</td>` +
                    '</tr>'
                  );
                }).join('') +
              '</tbody>' +
            '</table>' +
          '</div>';
      });
    }

    // Add signature section
    htmlContent += [
      '  <div style="margin-top: 50px; padding-top: 20px;">',
      '    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px;">',
      '      <div style="margin-bottom: 20px;">',
      '        <div style="width: 200px; border-top: 1px solid #000; margin-bottom: 5px;"></div>',
      '        <div style="font-weight: 600;">Sylvia C. Labial</div>',
      '        <div style="font-style: italic; color: #666; font-size: 14px;">Chairperson</div>',
      '      </div>',
      '      <div style="margin-bottom: 20px;">',
      '        <div style="width: 200px; border-top: 1px solid #000; margin-bottom: 5px;"></div>',
      '        <div style="font-weight: 600;">Voltaire M. Bernal</div>',
      '        <div style="font-style: italic; color: #666; font-size: 14px;">Vice-Chairperson</div>',
      '      </div>',
      '      <div style="margin-bottom: 20px;">',
      '        <div style="width: 200px; border-top: 1px solid #000; margin-bottom: 5px;"></div>',
      '        <div style="font-weight: 600;">Juvy S. Arjona</div>',
      '        <div style="font-style: italic; color: #666; font-size: 14px;">Head, Grievance Committee</div>',
      '      </div>',
      '      <div style="margin-bottom: 20px;">',
      '        <div style="width: 200px; border-top: 1px solid #000; margin-bottom: 5px;"></div>',
      '        <div style="font-weight: 600;">Hershy B. Cadampog</div>',
      '        <div style="font-style: italic; color: #666; font-size: 14px;">COMELEC Secretary</div>',
      '      </div>',
      '      <div style="margin-bottom: 20px;">',
      '        <div style="width: 200px; border-top: 1px solid #000; margin-bottom: 5px;"></div>',
      '        <div style="font-weight: 600;">Francis Artchess Babao</div>',
      '        <div style="font-style: italic; color: #666; font-size: 14px;">Member, Grievance Committee</div>',
      '      </div>',
      '      <div style="margin-bottom: 20px;">',
      '        <div style="width: 200px; border-top: 1px solid #000; margin-bottom: 5px;"></div>',
      '        <div style="font-weight: 600;">Rosevel B. Colegado</div>',
      '        <div style="font-style: italic; color: #666; font-size: 14px;">Member, Grievance Committee</div>',
      '      </div>',
      '      <div style="margin-bottom: 20px;">',
      '        <div style="width: 200px; border-top: 1px solid #000; margin-bottom: 5px;"></div>',
      '        <div style="font-weight: 600;">Yzl Debbie Ebina</div>',
      '        <div style="font-style: italic; color: #666; font-size: 14px;">Member, Grievance Committee</div>',
      '      </div>',
      '      <div style="margin-bottom: 20px;">',
      '        <div style="width: 200px; border-top: 1px solid #000; margin-bottom: 5px;"></div>',
      '        <div style="font-weight: 600;">Isha Jared Abellanosa</div>',
      '        <div style="font-style: italic; color: #666; font-size: 14px;">CBIT Representative</div>',
      '      </div>',
      '      <div style="margin-bottom: 20px;">',
      '        <div style="width: 200px; border-top: 1px solid #000; margin-bottom: 5px;"></div>',
      '        <div style="font-weight: 600;">Andi Glenn C. Sabellano</div>',
      '        <div style="font-style: italic; color: #666; font-size: 14px;">CBIT Representative</div>',
      '      </div>',
      '      <div style="margin-bottom: 20px;">',
      '        <div style="width: 200px; border-top: 1px solid #000; margin-bottom: 5px;"></div>',
      '        <div style="font-weight: 600;">Keith Karylle B. Acub</div>',
      '        <div style="font-style: italic; color: #666; font-size: 14px;">CELS Representative</div>',
      '      </div>',
      '      <div style="margin-bottom: 20px;">',
      '        <div style="width: 200px; border-top: 1px solid #000; margin-bottom: 5px;"></div>',
      '        <div style="font-weight: 600;">Vince Cielo Bongalos</div>',
      '        <div style="font-style: italic; color: #666; font-size: 14px;">CELS Representative</div>',
      '      </div>',
      '      <div style="margin-bottom: 20px;">',
      '        <div style="width: 200px; border-top: 1px solid #000; margin-bottom: 5px;"></div>',
      '        <div style="font-weight: 600;">Yhusabelle Angel Gono</div>',
      '        <div style="font-style: italic; color: #666; font-size: 14px;">CESS Representative</div>',
      '      </div>',
      '      <div style="margin-bottom: 20px;">',
      '        <div style="width: 200px; border-top: 1px solid #000; margin-bottom: 5px;"></div>',
      '        <div style="font-weight: 600;">Klent B. Capangpangan</div>',
      '        <div style="font-style: italic; color: #666; font-size: 14px;">CESS Representative</div>',
      '      </div>',
      '      <div style="margin-bottom: 20px;">',
      '        <div style="width: 200px; border-top: 1px solid #000; margin-bottom: 5px;"></div>',
      '        <div style="font-weight: 600;">Shine Khacil Villar</div>',
      '        <div style="font-style: italic; color: #666; font-size: 14px;">CFMS Representative</div>',
      '      </div>',
      '      <div style="margin-bottom: 20px;">',
      '        <div style="width: 200px; border-top: 1px solid #000; margin-bottom: 5px;"></div>',
      '        <div style="font-weight: 600;">Renie Magallanes</div>',
      '        <div style="font-style: italic; color: #666; font-size: 14px;">CFMS Representative</div>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('');

    // Set the HTML content
    tempDiv.innerHTML = htmlContent;
    
    // Generate PDF
    const options = {
      margin: [15, 15],
      filename: `${props.electionName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_results_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        allowTaint: true,
        scrollY: 0
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      }
    };
    
    // Generate and download the PDF
    await html2pdf().set(options).from(tempDiv).save();
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF: ' + (error.message || 'Unknown error'));
  } finally {
    exporting.value = false;
    showPreview.value = false;
  }
};
</script>

<style scoped>
.d-none {
  display: none;
}

.preview-container {
  font-family: Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
}

.preview-content {
  background: white;
  border-radius: 4px;
  overflow: hidden;
}

.preview-content table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.preview-content th,
.preview-content td {
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  text-align: left;
}

.preview-content th {
  background-color: #f8fafc;
  font-weight: 600;
  color: #334155;
}

.preview-content tr:not(:last-child) {
  border-bottom: 1px solid #e2e8f0;
}

.preview-content tr:hover {
  background-color: #f8fafc;
}

.text-right {
  text-align: right;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.p-3 {
  padding: 0.75rem;
}

.bg-gray-50 {
  background-color: #f8fafc;
}

.border-b {
  border-bottom: 1px solid #e2e8f0;
}

.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.font-semibold {
  font-weight: 600;
}

.text-center {
  text-align: center;
}

.p-4 {
  padding: 1rem;
}

.border-b {
  border-bottom: 1px solid #e2e8f0;
}

.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}

.font-bold {
  font-weight: 700;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-gray-500 {
  color: #64748b;
}

.pdf-content {
  background: white;
  color: #333;
  padding: 20px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  font-family: Arial, sans-serif;
  line-height: 1.5;
}

.pdf-content h1, 
.pdf-content h2, 
.pdf-content h3 {
  color: #1a365d;
  margin-bottom: 0.5em;
}

.pdf-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
}

.pdf-content th,
.pdf-content td {
  border: 1px solid #e2e8f0;
  padding: 8px 12px;
  text-align: left;
}

.pdf-content th {
  background-color: #f7fafc;
  font-weight: 600;
}

:deep(.p-datatable) {
  width: 100%;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: #f8f9fa;
  font-weight: 600;
}

.text-right {
  text-align: right;
}

.preview-container {
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}

.preview-content {
  background: white;
  border-radius: 4px;
  overflow: hidden;
}

.preview-scrollable {
  max-height: 60vh;
  overflow-y: auto;
  padding: 1rem;
}

/* Ensure tables are properly spaced in the preview */
.preview-scrollable table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.5rem;
}

.preview-scrollable th,
.preview-scrollable td {
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
}

.preview-scrollable th {
  background-color: #f9fafb;
  font-weight: 600;
  text-align: left;
}

/* Make the preview look more like the PDF */
@media print {
  .preview-content {
    box-shadow: none;
    border: none;
  }
  
  .preview-scrollable {
    max-height: none;
    overflow: visible;
  }
}
</style>