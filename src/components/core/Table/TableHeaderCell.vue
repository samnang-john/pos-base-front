<template>
  <th
    @click="emit('click')"
    class="border-b p-3 text-left cursor-pointer transition-all duration-200"
    :class="[
      field === sortField ? 'bg-blue-100 text-blue-800 font-semibold' : 'bg-gray-50 hover:bg-gray-100',
      !field ? 'cursor-default' : ''
    ]"
  >
    <div class="flex items-center justify-between">
      <slot />
      <span v-if="sortField === field" class="ml-2 text-gray-600">
        <!-- Ascending Icon -->
        <svg
          v-if="sortDirection === 'asc'"
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M5 15l7-7 7 7"
          />
        </svg>
        <!-- Descending Icon -->
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </span>
    </div>
  </th>
</template>

<script setup>
const { field, sortField, sortDirection } = defineProps({
  field: String,
  sortField: String,
  sortDirection: String
})

const emit = defineEmits(['click'])
</script>

<style scoped>
/* Add scoped styles if necessary */
</style>
