<template>
  <div class="notification-wrapper">
    <Button 
      type="button" 
      icon="pi pi-bell" 
      rounded 
      severity="secondary"
      @click="toggle"
      :badge="unreadCount > 0 ? unreadCount.toString() : ''"
      badge-severity="primary"
    />

    <Popover 
      ref="popover"
      :pt="{
        root: 'w-80 max-h-[70vh] overflow-auto',
        content: 'p-0'
      }"
    >
      <div class="notification-popover">
        <div class="notification-header p-4">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold m-0">Notifications</h3>
            <Button 
              v-if="unreadCount > 0"
              label="Mark all as read" 
              size="small" 
              text 
              @click="markAllAsRead"
              class="p-0 text-sm"
            />
          </div>
        </div>

        <div class="notification-list">
          <div v-if="loading" class="p-4 text-center">
            <ProgressSpinner style="width: 30px; height: 30px" strokeWidth="4" />
          </div>
          
          <template v-else>
            <div 
              v-for="notification in unreadNotifications.slice(0, 3)" 
              :key="notification.id"
              class="notification-item transition-all duration-200 space-y-2 p-3 rounded-lg opacity-100 cursor-pointer hover:bg-surface-100"
              @click="handleNotificationClick(notification)"
            >
              <div class="flex items-start gap-3">
                <div>
                  <div 
                    class="rounded-full flex bg-surface-200"
                  >
                    <i class="mt-1 pi pi-info-circle text-surface-600"></i>
                  </div>
                </div>
                <div class="">
                  <div class="flex justify-between items-start">
                    <h4 
                      class="text-sm font-medium mb-1"
                      :class="notification.is_read === 1 ? 'text-surface-500' : 'text-surface-900'"
                    >
                      {{ notification.title }}
                    </h4>
                  </div>
                  <p 
                    class="text-sm mb-0 line-clamp-2"
                    :class="notification.is_read === 1 ? 'text-surface-400' : 'text-surface-600'"
                  >
                    {{ notification.message }}
                  </p>
                  <p class="text-xs text-surface-500 mt-2">{{ formatTimeAgo(notification.created_at) }}</p>
                </div>
              </div>
            </div>
            
            <div v-if="unreadNotifications.length === 0" class="p-4 text-center text-surface-500">
              No new notifications
            </div>
            <div v-else-if="unreadNotifications.length > 3" class="p-2 text-center text-sm text-primary-600">
              Showing 3 of {{ unreadNotifications.length }} unread notifications
            </div>
          </template>
        </div>

        <div class="notification-footer p-3 text-center">
          <Button 
            label="View All Notifications" 
            fluid
            size="small" 
            @click="viewAllNotifications"
          />
        </div>
      </div>
    </Popover>

    <!-- All Notifications Dialog -->
    <Dialog 
      v-model:visible="showAllNotifications" 
      :style="{width: '500px'}" 
      header="All Notifications"
      :modal="true"
      class="p-fluid"
    >
      <TabView>
        <TabPanel header="Unread">
          <div class="flex justify-end mb-3">
            <Button 
              v-if="unreadNotifications.length > 0"
              label="Mark all as read" 
              size="small" 
              text 
              @click="markAllAsRead"
              class="text-sm p-0"
              :loading="loading"
            />
          </div>
          <div class="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            <div 
              v-for="notification in unreadNotifications" 
              :key="notification.id"
              class="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
              @click="handleNotificationClick(notification)"
            >
              <div class="flex items-start gap-3">
                <div class="flex-shrink-0">
                  <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <i :class="getNotificationTypeIcon(notification.type || 'default')" class="text-primary-600"></i>
                  </div>
                </div>
                <div class="flex-1">
                  <h4 class="text-sm font-medium text-surface-900 mb-1">
                    {{ notification.title }}
                  </h4>
                  <p class="text-sm text-surface-600 mb-1 line-clamp-2">
                    {{ notification.message }}
                  </p>
                  <p class="text-xs text-surface-400">{{ formatTimeAgo(notification.created_at) }}</p>
                </div>
              </div>
            </div>
            <div v-if="unreadNotifications.length === 0" class="text-center py-4 text-surface-500">
              No unread notifications
            </div>
          </div>
        </TabPanel>
        
        <TabPanel header="Read">
          <div class="flex justify-end mb-3">
            <Button 
              v-if="readNotifications.length > 0"
              label="Delete All Read" 
              size="small" 
              text 
              severity="danger"
              @click="confirmDeleteAllRead"
              class="text-sm p-0"
              :loading="loading"
            />
          </div>
          <div class="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            <div 
              v-for="notification in readNotifications" 
              :key="notification.id"
              class="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
              @click="handleNotificationClick(notification)"
            >
              <div class="flex items-start gap-3">
                <div class="flex-shrink-0 opacity-70">
                  <div class="w-10 h-10 rounded-full bg-surface-100 flex items-center justify-center">
                    <i :class="getNotificationTypeIcon(notification.type || 'default')" class="text-surface-500"></i>
                  </div>
                </div>
                <div class="flex-1">
                  <h4 class="text-sm font-medium text-surface-700 mb-1">
                    {{ notification.title }}
                  </h4>
                  <p class="text-sm text-surface-500 mb-1 line-clamp-2">
                    {{ notification.message }}
                  </p>
                  <p class="text-xs text-surface-400">{{ formatTimeAgo(notification.created_at) }}</p>
                </div>
              </div>
            </div>
            <div v-if="readNotifications.length === 0" class="text-center py-4 text-surface-500">
              No read notifications
            </div>
          </div>
        </TabPanel>
      </TabView>
      
      <template #footer>
        <Button 
          label="Close" 
          @click="showAllNotifications = false" 
          class="p-button-text"
        />
      </template>
    </Dialog>
    <!-- Notification Details Dialog -->
    <Dialog 
      v-model:visible="showDetails" 
      :style="{width: '450px'}" 
      :header="selectedNotification?.title || 'Notification Details'"
      :modal="true"
      class="p-fluid"
    >
      <div v-if="selectedNotification" class="space-y-4">
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0">
            <div class="w-10 h-10 rounded-full bg-surface-200 flex items-center justify-center">
              <i :class="getNotificationTypeIcon(selectedNotification.type || 'default')" class="text-lg"></i>
            </div>
          </div>
          <div class="flex-1">
            <div class="flex justify-between items-start">
              <span class="text-sm text-surface-500">
                {{ formatFullDate(selectedNotification.created_at) }}
              </span>
            </div>
            <p class="mt-2 text-surface-700 whitespace-pre-line">
              {{ selectedNotification.message }}
            </p>
          </div>
        </div>
      </div>
      <template #footer>
        <Button 
          label="Close" 
          @click="showDetails = false" 
          class="p-button-text"
        />
        <Button 
          v-if="selectedNotification?.link"
          label="View Details" 
          @click="navigateTo(selectedNotification.link)"
          class="p-button-primary"
          autofocus
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useNotificationStore } from '../../stores/notification';
import Dialog from 'primevue/dialog';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';

const popover = ref();
const showAllNotifications = ref(false);
const activeTab = ref(0);
const notificationStore = useNotificationStore();
const loading = ref(false);
const showDetails = ref(false);
const selectedNotification = ref(null);

// Mock data - replace with actual data from your store
const notifications = computed(() => notificationStore.notifications || []);

// Separate notifications into read and unread
const unreadNotifications = computed(() => 
  notifications.value.filter(n => !n.is_read)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
);

const readNotifications = computed(() => 
  notifications.value.filter(n => n.is_read)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
);

const unreadCount = computed(() => unreadNotifications.value.length);

// Get the 3 most recent notifications
const latestNotifications = computed(() => {
  return [...notifications.value]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3);
});

const viewAllNotifications = () => {
  showAllNotifications.value = true;
  // Reset to unread tab when opening
  activeTab.value = 0;
  // Close the popover if open
  popover.value?.hide();
};

const getNotificationIcon = (type) => {
  const types = {
    message: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    reminder: 'bg-purple-500',
    default: 'bg-primary-500'
  };
  return types[type] || types.default;
};

const getNotificationTypeIcon = (type) => {
  const icons = {
    message: 'pi pi-envelope',
    success: 'pi pi-check-circle',
    warning: 'pi pi-exclamation-triangle',
    error: 'pi pi-times-circle',
    reminder: 'pi pi-bell',
    default: 'pi pi-info-circle'
  };
  return icons[type] || icons.default;
};

const formatTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
    }
  }
  
  return 'Just now';
};

const toggle = (event) => {
  popover.value.toggle(event);
  if (notifications.value.length === 0) {
    fetchNotifications();
  }
};

const fetchNotifications = async () => {
  try {
    loading.value = true;
    await notificationStore.fetchMyNotifications();
  } catch (error) {
    console.error('Error fetching notifications:', error);
  } finally {
    loading.value = false;
  }
};

const { markAsRead, markAllAsRead: storeMarkAllAsRead, deleteAllRead } = notificationStore;

const markAllAsRead = async () => {
  try {
    loading.value = true;
    await storeMarkAllAsRead();
    // The store will update the notifications, triggering a re-render
  } catch (error) {
    console.error('Error marking all as read:', error);
  } finally {
    loading.value = false;
  }
};

const confirmDeleteAllRead = async () => {
  if (confirm('Are you sure you want to delete all read notifications? This action cannot be undone.')) {
    try {
      loading.value = true;
      await deleteAllRead();
      // The store will update the notifications, triggering a re-render
    } catch (error) {
      console.error('Error deleting read notifications:', error);
    } finally {
      loading.value = false;
    }
  }
};

const handleNotificationClick = async (notification) => {
  try {
    // Mark as read if not already read
    if (!notification.is_read) {
      await notificationStore.markAsRead([notification.id]);
      // Update the local notification state
      const index = notifications.value.findIndex(n => n.id === notification.id);
      if (index !== -1) {
        notifications.value[index].is_read = 1;
      }
    }
    
    // Show the details dialog
    selectedNotification.value = notification;
    showDetails.value = true;
    
  } catch (error) {
    console.error('Error handling notification click:', error);
  } finally {
    // Close the popover after handling the click
    popover.value?.hide();
  }
};

const formatFullDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};


onMounted(() => {
  fetchNotifications();
});
</script>