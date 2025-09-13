<template>
  <div class="border border-gray-200 rounded-lg overflow-hidden">
    <!-- Header -->
    <div v-if="$slots.header" class="border-b border-gray-200 p-4">
      <slot name="header"></slot>
    </div>
    
    <!-- Body -->
    <div :class="['p-4', { 'pt-0': !$slots.header }]">
      <slot></slot>
    </div>
  </div>
</template>
