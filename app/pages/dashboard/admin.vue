<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p class="text-gray-600">Welcome back, {{ user?.email }}</p>
      </div>
      <button
        @click="handleSignOut"
        class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
      >
        Sign Out
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <DashboardCard 
        title="Total Users" 
        :value="stats.totalUsers" 
        icon="👥"
        color="bg-blue-500"
      />
      <DashboardCard 
        title="Active Elections" 
        :value="stats.activeElections" 
        icon="🗳️"
        color="bg-green-500"
      />
      <DashboardCard 
        title="Pending Approvals" 
        :value="stats.pendingApprovals" 
        icon="⏳"
        color="bg-yellow-500"
      />
      <DashboardCard 
        title="Total Votes" 
        :value="stats.totalVotes" 
        icon="✅"
        color="bg-purple-500"
      />
    </div>

    <!-- Quick Actions -->
    <div class="bg-white rounded-xl shadow-sm p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">Quick Actions</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button 
          v-for="action in quickActions" 
          :key="action.title"
          @click="action.handler"
          class="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
        >
          <div class="text-2xl mb-2">{{ action.icon }}</div>
          <span class="text-sm font-medium">{{ action.title }}</span>
        </button>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white rounded-xl shadow-sm p-6">
      <h2 class="text-xl font-semibold mb-4">Recent Activity</h2>
      <div class="space-y-4">
        <div v-for="(activity, index) in recentActivities" :key="index" class="flex items-start pb-4 border-b border-gray-100">
          <div class="bg-blue-100 p-2 rounded-lg mr-4">
            <span class="text-blue-600">{{ activity.icon }}</span>
          </div>
          <div class="flex-1">
            <p class="font-medium text-gray-900">{{ activity.title }}</p>
            <p class="text-sm text-gray-500">{{ activity.description }}</p>
            <span class="text-xs text-gray-400">{{ activity.time }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useAuthStore } from '../stores/auth'
import { useSupabaseUser } from '#imports'

const { signOut } = useAuth()
const authStore = useAuthStore()
const user = useSupabaseUser()

const stats = ref({
  totalUsers: 0,
  activeElections: 0,
  pendingApprovals: 0,
  totalVotes: 0
})

const recentActivities = ref([
  {
    icon: '👤',
    title: 'New User Registration',
    description: 'John Doe registered as a new user',
    time: '10 minutes ago'
  },
  {
    icon: '📝',
    title: 'Election Created',
    description: 'New SSC Election 2024 has been created',
    time: '2 hours ago'
  },
  {
    icon: '✅',
    title: 'Vote Cast',
    description: 'A new vote has been cast in the SSC Election',
    time: '5 hours ago'
  }
])

const quickActions = [
  {
    title: 'Create Election',
    icon: '➕',
    handler: () => navigateTo('/admin/elections/create')
  },
  {
    title: 'Manage Users',
    icon: '👥',
    handler: () => navigateTo('/admin/users')
  },
  {
    title: 'View Reports',
    icon: '📊',
    handler: () => navigateTo('/admin/reports')
  },
  {
    title: 'System Settings',
    icon: '⚙️',
    handler: () => navigateTo('/admin/settings')
  }
]

const handleSignOut = async () => {
  await signOut()
  navigateTo('/auth/login')
}

// Fetch initial data
onMounted(async () => {
  // In a real app, you would fetch these from your API
  stats.value = {
    totalUsers: 245,
    activeElections: 3,
    pendingApprovals: 12,
    totalVotes: 1245
  }
})

definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'dashboard-layout'
})
</script>

<style scoped>
/* Add any custom styles here */
</style>