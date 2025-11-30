<script setup>
const props = defineProps({
  product: Object,
});

const emit = defineEmits(["add-to-cart"]);
</script>

<template>
  <div
    class="p-5 border border-yellow-500/40 rounded-xl hover:scale-105 transition"
    @click="emit('add-to-cart', props.product)"
  >
    <div
      class="h-40 rounded-lg flex items-center justify-center relative overflow-hidden"
    >
      <img :src="product.image" class="w-full h-full object-cover" />
    </div>
    <h3 class="mt-3 font-bold text-yellow-400">
      {{ product.type_of_wood_Object?.name }}
    </h3>

    <p class="text-gray-400 text-sm">
      {{ product.type_of_wood_Object?.description }}
    </p>

    <p class="mt-2 text-yellow-300 text-lg">${{ product.cost_of_each }}</p>
  </div>
</template>
