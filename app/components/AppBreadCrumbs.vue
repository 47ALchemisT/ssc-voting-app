<template>
    <div>
      <Breadcrumb :home="home" :model="items" class="!p-0 mb-3">
        <template #item="{ item, props }">
          <router-link
            v-if="item.route"
            v-slot="{ href, navigate }"
            :to="item.route"
            custom
          >
            <a :href="href" v-bind="props.action" @click="navigate">
              <span :class="[item.icon, 'text-color text-sm']" />
              <span class="text-primary font-semibold text-sm">{{ item.label }}</span>
            </a>
          </router-link>
          <a
            v-else
            :href="item.url"
            :target="item.target"
            v-bind="props.action"
          >
            <span class="text-surface-700 dark:text-surface-0 text-sm">
              {{ item.label }}
            </span>
          </a>
        </template>
      </Breadcrumb>
    </div>
  </template>
  
  <script setup>
  import Breadcrumb from "primevue/breadcrumb";
  
  // Props for dynamic data
  defineProps({
    home: {
      type: Object,
      required: true
    },
    items: {
      type: Array,
      required: true
    }
  });
  </script>
  