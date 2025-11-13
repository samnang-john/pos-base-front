<template>
  <div
    class="p-5 border border-yellow-500/40 rounded-xl hover:scale-105 transition"
  >
    <div
      class="h-40 rounded-lg flex items-center justify-center relative overflow-hidden"
    >
      <img :src="image" :alt="name" class="h-full w-full object-cover" />
      <span
        v-if="isNew"
        class="absolute top-2 right-2 bg-blue-500 text-xs px-2 py-1 rounded-full"
      >
        NEW
      </span>
    </div>

    <h3 class="mt-4 font-semibold">{{ name }}</h3>
    <p class="text-sm text-gray-400">{{ description }}</p>
    <p class="text-yellow-400 font-bold mt-2">${{ price }}</p>

    <button
      class="mt-3 w-full bg-yellow-400 text-black font-semibold py-2 rounded-lg hover:bg-yellow-300 transition"
      @click="$emit('add-to-cart')"
    >
      Add to Cart
    </button>
  </div>
</template>

<script setup>
import { onMounted } from "vue";

const props = defineProps({
  name: String,
  description: String,
  price: [String, Number],
  image: String,
  isNew: {
    type: Boolean,
    default: false,
  },
})

onMounted(() => {
//   console.log("ProductCard received props:", props);
})
</script>

