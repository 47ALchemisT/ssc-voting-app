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
      :header="'Preview: ' + electionName + ' Results'"
      :closable="!exporting"
      :closeOnEscape="!exporting"
    >
      <div class="preview-container">
        <div class="preview-content">
          <div class="text-center p-4 border-b">
            <h2 class="text-2xl font-bold mb-2">{{ electionName }} - Election Results</h2>
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
                      <td class="p-2">{{ candidate.name || 'Unnamed Candidate' }}</td>
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
          label="Download PDF" 
          icon="pi pi-download" 
          @click="exportToPdf" 
          :disabled="exporting"
        />
      </template>
    </Dialog>
    
    <!-- Hidden PDF content (no longer used but kept for reference) -->
    <div ref="pdfContent" style="display: none;"></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

// Client-side only import
let html2pdf;
if (process.client) {
  import('html2pdf.js').then(module => {
    html2pdf = module.default;
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
  return ((votes || 0) / totalVotes * 100).toFixed(1);
};

const exportToPdf = async () => {
  if (!process.client) return;
  
  exporting.value = true;
  
  try {
    const { jsPDF } = await import('jspdf');
    
    // Create a new jsPDF instance
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Add title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`Supreme Student Council Election Results`, 15, 30);
    
    // Add date
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Generated on ${formattedDate.value}`, 15, 37);
    
    let yPosition = 45; // Starting Y position for the first table
    
    // Helper function to safely add text
    const addText = (text, x, y, options = {}) => {
      const safeText = text !== null && text !== undefined ? String(text) : '';
      doc.text(safeText, x, y, options);
    };

    // Add each position's results as a table
    if (Array.isArray(props.positions)) {
      for (const position of props.positions) {
        if (!position) continue;
        
        const positionName = position.title || position.name || 'Unnamed Position';
        const candidates = Array.isArray(position.candidates) ? position.candidates : [];
        const totalVotes = getTotalVotes(candidates);
        
        // Add position header
        doc.setFont(undefined, 'bold');
        doc.setFontSize(12);
        addText(positionName, 15, yPosition);
        yPosition += 4;
        
        // Table headers
        doc.setFillColor(240, 240, 240);
        doc.rect(15, yPosition, 180, 8, 'F');
        doc.setFont(undefined, 'bold');
        doc.setFontSize(10);
        addText('Candidate', 16, yPosition + 6);
        addText('Votes', 150, yPosition + 6, { align: 'right' });
        addText('Percentage', 190, yPosition + 6, { align: 'right' });
        
        yPosition += 8;
        
        // Table rows
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        
        // Sort candidates by vote count (descending)
        const sortedCandidates = [...candidates].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
        
        for (const [index, candidate] of sortedCandidates.entries()) {
          // Add a new page if needed
          if (yPosition > 270) { // 297mm is A4 height, leaving some margin
            doc.addPage();
            yPosition = 20;
          }
          
          if (!candidate) continue;
          
          const voteCount = candidate.vote_count || 0;
          const percentage = calculatePercentage(voteCount, totalVotes);
          
          // Add row with alternating background
          if (index % 2 === 0) {
            doc.setFillColor(250, 250, 250);
            doc.rect(15, yPosition, 180, 8, 'F');
          }
          
          // Add row content
          addText(candidate.name || 'Unnamed Candidate', 16, yPosition + 6);
          addText(String(voteCount), 150, yPosition + 6, { align: 'right' });
          addText(`${percentage}%`, 190, yPosition + 6, { align: 'right' });
          
          yPosition += 8;
        }
        
        // Add some space between tables
        yPosition += 10;
      }
    }
    
    // Generate filename with current date
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `${props.electionName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_results_${dateStr}.pdf`;
    
    // Add signature line at the bottom
    const signatureY = Math.min(yPosition + 30, 280); // Ensure it's not too close to the bottom
    if (signatureY < 290) { // Make sure we have enough space
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      
      // Add a line for signature
      doc.setDrawColor(150);
      doc.setLineWidth(0.5);
      doc.line(15, signatureY, 60, signatureY);
      
      // Add the name
      doc.text('Cres Jean Itom', 15, signatureY + 10);
      
      // Add position/title if needed
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.text('Authorized Signatory', 15, signatureY + 16);
      
    }
    
    // Save the PDF
    doc.save(fileName);
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
