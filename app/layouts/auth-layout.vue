<!-- layouts/auth.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="w-full max-w-md">
      <Card>
        <template #content>
          <div class="p-2">
            <slot/>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>
