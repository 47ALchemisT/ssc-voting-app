<template>
  <Dialog
    :visible="visible"
    @update:visible="(value) => emit('update:visible', value)"
    :style="{ width: '600px' }"
    header="Import Voters List"
    :modal="true"
    :draggable="false"
    :closable="!importing"
    :closeOnEscape="!importing"
  >
    <div class="space-y-4">
      <div class="p-4 border border-dashed border-gray-300 rounded-lg text-center">
        <div v-if="!file" class="space-y-2">
          <p class="text-gray-600">Drag and drop your Excel file here or</p>
          <div class="flex justify-center py-3">
            <FileUpload
              mode="basic"
              severity="secondary"
              class="p-button-outline"
              accept=".xlsx,.xls,.csv"
              :maxFileSize="1000000"
              :auto="true"
              chooseLabel="Browse Files"
              :disabled="importing"
              @select="onFileSelect"
            />
          </div>
          <p class="text-xs text-gray-500 mt-2">
            Supported formats: .xlsx, .xls, .csv (Max 1MB)
          </p>
        </div>
        <div v-else class="space-y-2">
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div class="flex items-center space-x-2">
              <i class="pi pi-file-excel text-green-500"></i>
              <span class="font-medium">{{ file.name }}</span>
              <span class="text-sm text-gray-500">({{ formatFileSize(file.size) }})</span>
            </div>
            <Button
              icon="pi pi-times"
              text
              rounded
              severity="danger"
              @click="file = null"
              :disabled="importing"
            />
          </div>
          
          <div v-if="previewData.length > 0" class="mt-4">
            <h4 class="text-sm text-left font-medium mb-2">Preview (first 5 rows) - Total: {{ totalRows }} rows</h4>
          <p class="text-xs text-gray-500 mb-2">
            Required fields: Email. All other fields are optional.
          </p>
            <div class="overflow-auto max-h-60 border border-gray-200 rounded">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th 
                      v-for="(header, index) in headers" 
                      :key="index"
                      class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {{ header }}
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(row, rowIndex) in previewData" :key="rowIndex">
                    <td 
                      v-for="(cell, cellIndex) in row" 
                      :key="cellIndex"
                      class="px-4 py-2 text-sm text-gray-900"
                      :class="{ 'text-gray-400 italic': !cell }"
                    >
                      {{ cell || '-' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="mt-2 text-sm text-right text-gray-500">
              Total rows to import: {{ totalRows }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="error" class="p-3 bg-red-50 text-red-700 rounded">
        <i class="pi pi-exclamation-triangle mr-2"></i>
        {{ error }}
      </div>

      <div v-if="importSuccess" class="p-3 bg-green-50 text-green-700 rounded">
        <i class="pi pi-check-circle mr-2"></i>
        {{ successMessage || `Successfully imported ${importedCount} voters!` }}
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button 
          label="Cancel" 
          severity="secondary"
          size="small"
          @click="closeDialog"
          :disabled="importing"
        />
        <Button 
          label="Import Voters" 
          icon="pi pi-upload" 
          :loading="importing"
          size="small"
          :disabled="!file || importing"
          @click="importVoters"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed } from 'vue';
import * as XLSX from 'xlsx';
import { useVotersListStore } from '../../../stores/votersList';

const props = defineProps({
  electionId: {
    type: [Number, String],
    required: true
  },
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:visible', 'imported']);

const votersListStore = useVotersListStore();
const file = ref(null);
const previewData = ref([]);
const headers = ref([]);
const totalRows = ref(0);
const successMessage = ref('');
const error = ref('');
const importedCount = ref(0);
const importSuccess = ref(false);
const importing = ref(false);

const closeDialog = () => {
  file.value = null;
  previewData.value = [];
  headers.value = [];
  error.value = '';
  importSuccess.value = false;
  emit('update:visible', false);
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const onFileSelect = async (event) => {
  try {
    error.value = '';
    importSuccess.value = false;
    
    const selectedFile = event.files[0];
    if (!selectedFile) return;

    // Basic file type validation
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
                       'application/vnd.ms-excel',
                       'text/csv'];
    
    if (!validTypes.includes(selectedFile.type) && 
        !selectedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
      throw new Error('Please upload a valid Excel or CSV file');
    }

    file.value = selectedFile;
    await parseFile(selectedFile);
  } catch (err) {
    console.error('Error processing file:', err);
    error.value = err.message || 'Failed to process file';
    file.value = null;
  }
};

const parseFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        
        // Define expected columns with their display names and validation
        // Include common variations of column names for better matching
        const expectedColumns = [
          { key: 'email', aliases: ['email', 'e-mail', 'email address', 'e-mail address'], required: true },
          { key: 'fullname', aliases: ['fullname', 'full name', 'name', 'student name'], required: false },
          { key: 'college', aliases: ['college', 'program', 'course', 'college/program'], required: false },
          { key: 'school_id', aliases: ['school_id', 'school id', 'student id', 'student number', 'id number'], required: false }
        ];
        
        // Create a map of all possible header names to their standard keys
        const headerToKeyMap = {};
        expectedColumns.forEach(col => {
          col.aliases.forEach(alias => {
            headerToKeyMap[alias.toLowerCase()] = col.key;
          });
        });
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length < 2) {
          throw new Error('The file is empty or has no data rows');
        }
        
        // Get headers from first row and normalize them (trim and make lowercase)
        const headers = jsonData[0].map(h => h ? h.toString().trim() : '');
        
        // Map headers to our expected format using the headerToKeyMap
        const headerMap = {};
        headers.forEach((header, index) => {
          if (!header) return;
          
          const headerLower = header.toLowerCase();
          const mappedKey = headerToKeyMap[headerLower];
          
          if (mappedKey) {
            headerMap[mappedKey] = index; // Store the column index for this header
          }
        });
        
        // Check if required columns exist
        expectedColumns.forEach(col => {
          if (col.required && !Object.keys(headerMap).includes(col.key)) {
            throw new Error(`Required column "${col.aliases[0]}" not found in the file`);
          }
        });
        
        // Log the header mapping for debugging
        console.log('Header mapping:', headerMap);
        
        // Process data rows
        const dataRows = [];
        const emailSet = new Set(); // To track duplicate emails in the file
        
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (row.length === 0) continue; // Skip empty rows
          
          // Helper function to get cell value safely
          const getCellValue = (key) => {
            const index = headerMap[key];
            if (index === undefined || index >= row.length) return '';
            const value = row[index];
            return (value !== undefined && value !== null) ? value.toString().trim() : '';
          };
          
          // Only process rows with email
          const email = getCellValue('email');
          if (email) {
            // Check for duplicate emails in the file
            if (emailSet.has(email.toLowerCase())) {
              throw new Error(`Duplicate email found: ${email}. Please ensure all emails are unique.`);
            }
            emailSet.add(email.toLowerCase());
            
            // Map the data to our expected format
            const mappedData = {
              email: email,
              fullname: headerMap.fullname !== undefined ? getCellValue('fullname') : '',
              college: headerMap.college !== undefined ? getCellValue('college') : '',
              school_id: headerMap.school_id !== undefined ? getCellValue('school_id') : ''
            };
            
            // Log the first few rows for debugging
            if (dataRows.length < 3) {
              console.log('Processed row:', mappedData);
            }
            
            dataRows.push(mappedData);
          }
        }
        
        // Set headers for preview
        headers.value = [];
        if (headerMap.email) headers.value.push('Email');
        if (headerMap.fullname) headers.value.push('Full Name');
        if (headerMap.college) headers.value.push('College');
        if (headerMap.school_id) headers.value.push('School ID');
        
        // Prepare preview data
        const previewDataRows = dataRows.slice(0, 5).map(row => {
          const previewRow = [row.email];
          if (headerMap.fullname) previewRow.push(row.fullname || '');
          if (headerMap.college) previewRow.push(row.college || '');
          if (headerMap.school_id) previewRow.push(row.school_id || '');
          return previewRow;
        });
        
        totalRows.value = dataRows.length;
        previewData.value = previewDataRows;
        
        resolve(dataRows);
      } catch (err) {
        reject(err);
      }
    };
    
    reader.onerror = (error) => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

const importVoters = async () => {
  if (!file.value) return;
  
  try {
    importing.value = true;
    error.value = '';
    importSuccess.value = false;
    
    // Get the full data from the file
    const data = await parseFile(file.value);
    
    // Use the already parsed data which includes all fields
    const parsedData = data.filter(voter => voter.email);
    
    if (parsedData.length === 0) {
      throw new Error('No valid email addresses found in the file');
    }
    
    // Log the first row for debugging
    console.log('First row of data being sent to store:', parsedData[0]);
    
    if (parsedData.length === 0) {
      throw new Error('No valid email addresses found in the file');
    }
    
    // Call the store to import voters
    const { data: result, error: importError, imported, skipped } = await votersListStore.importVoters(props.electionId, parsedData);
      
    if (importError) {
      error.value = importError;
      return;
    }

    // Success
    importSuccess.value = true;
    importedCount.value = imported || 0;
    
    // Show appropriate message based on import results
    if (skipped > 0) {
      if (imported > 0) {
        successMessage.value = `Successfully imported ${imported} new voters. ${skipped} duplicate emails were skipped.`;
      } else {
        successMessage.value = `All ${skipped} voters already exist in the system. No new voters were imported.`;
      }
    } else {
      successMessage.value = `Successfully imported ${imported} voters!`;
    }
    
    emit('imported', result || []);
    file.value = null;
    previewData.value = [];
    
  } catch (err) {
    console.error('Error importing voters:', err);
    error.value = err.message || 'Failed to import voters';
  } finally {
    importing.value = false;
  }
};

// Watch for visibility changes from parent
watch(() => props.visible, (newVal) => {
  if (newVal) {
    // Reset state when dialog is opened
    file.value = null;
    previewData.value = [];
    headers.value = [];
    error.value = '';
    importSuccess.value = false;
  }
});
</script>

<style scoped>
:deep(.p-dialog .p-dialog-header) {
  border-bottom: 1px solid #e5e7eb;
  padding: 1.25rem 1.5rem;
}

:deep(.p-dialog .p-dialog-content) {
  padding: 1.5rem;
}

:deep(.p-dialog .p-dialog-footer) {
  border-top: 1px solid #e5e7eb;
  padding: 1rem 1.5rem;
}

:deep(.p-fileupload-choose) {
  background-color: #3b82f6 !important;
  border-color: #3b82f6 !important;
}

:deep(.p-fileupload-choose:hover) {
  background-color: #2563eb !important;
  border-color: #2563eb !important;
}

:deep(.p-fileupload-choose.p-focus) {
  box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.5) !important;
}
</style>
