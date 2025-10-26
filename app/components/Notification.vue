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
              v-for="notification in notifications" 
              :key="notification.id"
              class="notification-item transition-all duration-200 space-y-2 p-3 rounded-lg"
              :class="[
                notification.is_read === 1 
                  ? 'opacity-60 cursor-default' 
                  : 'opacity-100 cursor-pointer hover:bg-surface-100',
              ]"
              @click="notification.is_read === 1 ? null : handleNotificationClick(notification)"
            >
              <div class="flex items-start gap-3">
                <div>
                  <div 
                    class="w-9 h-9 rounded-full flex items-center justify-center bg-surface-200"
                  >
                    <i class="pi pi-info-circle text-surface-600"></i>
                  </div>
                </div>
                <div class="flex-1">
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
                </div>
              </div>
            </div>
            
            <div v-if="notifications.length === 0" class="p-4 text-center text-surface-500">
              No notifications yet
            </div>
          </template>
        </div>

        <div class="notification-footer p-3 text-center">
          <Button 
            label="View All Notifications" 
            text 
            size="small" 
            class="text-primary-600 hover:bg-primary-50"
          />
        </div>
      </div>
    </Popover>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useNotificationStore } from '../../stores/notification';

const popover = ref();
const notificationStore = useNotificationStore();
const loading = ref(false);

// Mock data - replace with actual data from your store
const notifications = computed(() => notificationStore.notifications || []);

const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.is_read).length;
});

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

const markAllAsRead = async () => {
  try {
    const unreadIds = notifications.value
      .filter(n => !n.is_read)
      .map(n => n.id);
    
    if (unreadIds.length > 0) {
      await notificationStore.markAsRead(unreadIds);
    }
  } catch (error) {
    console.error('Error marking all as read:', error);
  }
};

const handleNotificationClick = async (notification) => {
  try {
    // Mark as read if not already read
    if (!notification.is_read) {
      await notificationStore.markAsRead([notification.id]);
    }
    
    // Handle navigation if link is provided
    if (notification.link) {
      navigateTo(notification.link);
    }
  } catch (error) {
    console.error('Error handling notification click:', error);
  } finally {
    // Close the popover after handling the click
    popover.value.hide();
  }
};


onMounted(() => {
  fetchNotifications();
});
</script>