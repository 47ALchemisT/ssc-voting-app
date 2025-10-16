<template>
  <div class="h-full flex flex-col bg-gray-50 border-r border-gray-200 transition-all duration-300 ease-in-out relative" :class="collapsed ? 'w-20' : 'w-64'">
    <!-- Logo/Brand -->
    <div class="p-3 lg:p-4 flex-shrink-0">
      <div class="flex items-center justify-between">
        <transition name="fade" mode="out-in">
          <span v-if="!collapsed" class="text-lg lg:text-xl font-semibold text-gray-900 whitespace-nowrap">
            Voting APP
          </span>
          <span v-else class="text-lg lg:text-xl font-semibold text-gray-900 text-center w-8">
            V
          </span>
        </transition>
      </div>
    </div>

    <!-- Dynamic Menu -->
    <div class="flex-1 min-h-0">
      <nav class="p-3 lg:p-4 space-y-6 lg:space-y-8 h-full">
        <template v-for="(section, index) in visibleSections" :key="index">
          <div>
            <transition name="fade">
              <h3 v-if="section.label && !collapsed" class="text-gray-500 font-bold text-xs uppercase tracking-wide mb-3">
                {{ section.label }}
              </h3>
            </transition>
            <ul class="space-y-1">
              <li v-for="(item, i) in section.items" :key="i">
                <div 
                  class="group relative" 
                  :ref="el => setItemRef(el, `${index}-${i}`)" 
                  @mouseenter="showTooltip(`${index}-${i}`, $event)" 
                  @mouseleave="hideTooltip(`${index}-${i}`)"
                >
                  <NuxtLink
                    :to="item.to || '/dashboard'"
                    @click="handleItemClick(item)"
                    :class="[
                      'w-full flex items-center px-2 lg:px-3 text-sm py-2 rounded-lg text-left transition-colors duration-150 no-underline',
                      activeKey === item.key
                        ? 'bg-blue-700 text-white font-medium'
                        : 'text-gray-700 hover:bg-gray-200'
                    ]"
                  >
                    <span :class="['pi', item.icon, 'flex-shrink-0 text-lg', collapsed ? 'mx-auto' : 'mr-2 lg:mr-3']"></span>
                    <transition name="fade">
                      <span v-if="!collapsed" class="flex-1">{{ item.label }}</span>
                    </transition>
                    <transition name="fade">
                      <span
                        v-if="item.badge && !collapsed"
                        class="ml-auto bg-blue-600 text-white text-xs px-2 py-1 rounded-full"
                      >
                        {{ item.badge }}
                      </span>
                    </transition>
                  </NuxtLink>
                  <teleport to="body">
                    <div
                      v-if="collapsed && activeTooltip === `${index}-${i}`"
                      :style="tooltipStyle"
                      class="px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-100 whitespace-nowrap pointer-events-none shadow-lg z-[9999]"
                    >
                      {{ item.label }}
                    </div>
                  </teleport>
                </div>
              </li>
            </ul>
          </div>
        </template>
      </nav>
    </div>

    <!-- User Info & Logout -->
    <div class="border-t border-gray-100 p-2 lg:p-4 mt-auto space-y-2 flex-shrink-0">
      <!-- User Info -->
      <div class="w-full p-2 lg:p-3 bg-white border border-gray-200 rounded-lg">
        <div class="flex items-start gap-2 lg:gap-3">
          <div class="flex-shrink-0">
            <div :class="['rounded-full flex items-center justify-center overflow-hidden bg-blue-700', collapsed ? 'w-6 h-6' : 'w-10 h-10']">
              <img
                v-if="authStore.profile?.avatar_url"
                :src="authStore.profile.avatar_url"
                alt="User avatar"
                class="w-full h-full object-cover"
              />
              <span v-else :class="['text-white font-semibold', collapsed ? 'text-xs' : 'text-sm']">
                {{ authStore.profile?.first_name?.charAt(0)?.toUpperCase() || 'U' }}
              </span>
            </div>
          </div>
          <transition name="fade">
            <div v-if="!collapsed" class="min-w-0 flex-1">
              <div class="flex items-center min-w-0">
                <span class="font-semibold text-gray-900 capitalize truncate">
                  {{ authStore.profile?.first_name || authStore.user?.email?.split('@')[0] || 'User' }}
                  {{ authStore.profile?.last_name ? ' ' + authStore.profile.last_name.charAt(0) + '.' : '' }}
                </span>
                <span
                  class="flex-shrink-0 text-xs rounded-full font-medium px-2 py-1 ml-2 whitespace-nowrap"
                  :class="{
                    'bg-blue-100 text-blue-700': !authStore.isAdmin && !authStore.isCandidate,
                    'bg-red-100 text-red-700': authStore.isAdmin,
                    'bg-green-100 text-green-700': authStore.isCandidate
                  }"
                >
                  {{ authStore.isAdmin ? 'Admin' : authStore.isCandidate ? 'Candidate' : 'User' }}
                </span>
              </div>
              <div class="text-xs text-gray-500 truncate">
                {{ authStore.user?.email || '' }}
              </div>
            </div>
          </transition>
        </div>
      </div>

      <!-- Logout Button -->
      <button
        @click="logout"
        :title="collapsed ? 'Logout' : ''"
        class="w-full flex items-center cursor-pointer bg-white px-2 lg:px-3 py-1 lg:py-2 text-sm rounded-lg text-left transition-colors duration-150 no-underline text-gray-700 hover:bg-gray-100 border border-gray-200"
      >
        <span :class="['pi pi-sign-out', collapsed ? 'mx-auto' : 'mr-2 lg:mr-3']"></span>
        <transition name="fade">
          <span v-if="!collapsed" class="flex-1">Logout</span>
        </transition>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle', 'logout'])

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const logout = () => {
  authStore.signOut()
}

const handleItemClick = (item) => {
  if (window.innerWidth < 1024) {
    emit('toggle')
  }
}

// Simplified tooltip logic - use regular refs instead of Maps
const itemRefs = new Map()
const activeTooltip = ref(null)
const tooltipStyle = ref({})

const setItemRef = (el, key) => {
  if (el) {
    itemRefs.set(key, el)
  } else {
    itemRefs.delete(key)
  }
}

const showTooltip = (key, event) => {
  if (!props.collapsed) return
  
  const element = itemRefs.get(key)
  if (!element) return
  
  const rect = element.getBoundingClientRect()
  tooltipStyle.value = {
    position: 'fixed',
    left: `${rect.right + 8}px`,
    top: `${rect.top + rect.height / 2}px`,
    transform: 'translateY(-50%)'
  }
  activeTooltip.value = key
}

const hideTooltip = (key) => {
  if (activeTooltip.value === key) {
    activeTooltip.value = null
  }
}

// Create a unique key for each menu item
const items = ref([
  {
    label: 'General',
    items: [
      { label: 'Dashboard', icon: 'pi-home', to: '/dashboard', key: 'dashboard' },
      { label: 'Elections', icon: 'pi-box', to: '/elections', key: 'elections' },
      { label: 'Candidacy', icon: 'pi-file-edit', to: '/candidacy', key: 'candidacy' },
      { label: 'Positions', icon: 'pi-briefcase', to: '/positions', key: 'positions', adminOnly: true },
      { label: 'Colleges', icon: 'pi-building', to: '/colleges', key: 'colleges', adminOnly: true },
    ]
  },
  {
    label: 'Account',
    items: [
      { label: 'Profile', icon: 'pi-user', to: '/profile', key: 'profile' },
      { label: 'Accounts', icon: 'pi-users', to: '/accounts', key: 'accounts', adminOnly: true },
      { label: 'Logout', icon: 'pi-power', key: 'logout' }
    ]
  }
])

// Compute active key from route
const activeKey = computed(() => {
  const currentPath = route.path
  const flatItems = items.value.flatMap(section => section.items).filter(it => !!it.to)
  
  // 1) exact match
  const exact = flatItems.find(it => it.to === currentPath)
  if (exact) return exact.key
  
  // 2) longest prefix match
  const prefixMatches = flatItems
    .filter(it => currentPath === it.to || currentPath.startsWith(it.to + '/'))
    .sort((a, b) => b.to.length - a.to.length)
  if (prefixMatches.length > 0) return prefixMatches[0].key
  
  // 3) default
  return 'dashboard'
})

// Visible sections depending on role
const visibleSections = computed(() => {
  return items.value
    .map(section => ({
      ...section,
      items: section.items
        .filter(item => item.label !== 'Logout')
        .filter(item => !item.adminOnly || authStore.isAdmin)
        .filter(item => item.key !== 'candidacy' || !authStore.isAdmin)
    }))
    .filter(section => section.items.length > 0)
})

// Fetch profile when component is mounted
onMounted(async () => {
  if (authStore.user) {
    await authStore.fetchProfile()
  }
})

// Watch for user changes and fetch profile
watch(() => authStore.user, async (newUser) => {
  if (newUser) {
    await authStore.fetchProfile()
  } else {
    authStore.profile = null
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>