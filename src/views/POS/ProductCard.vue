<script setup>
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["add-to-cart"]);

function handleAddToCart() {
  emit("add-to-cart", props.product);
}
</script>

<template>
  <div
    class="group relative bg-[#13131F] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-[#FFD700]/10 flex flex-col h-full"
    @click="handleAddToCart">
    <!-- Image Container -->
    <div class="h-45 sm:h-50 relative bg-[#1C1C28] overflow-hidden">
      <!-- Gradient overlay for better text contrast if needed, though image is top -->
      <img :src="product.image || '/fallback-image.jpg'"
        :alt="`${product.type_of_wood_Object?.name || 'Wood'} cutting board`"
        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
    </div>

    <!-- Content -->
    <div class="p-5 flex flex-col flex-1">
      <!-- Title code (e.g. SK, TS) -->
      <h3 class="font-black text-[#FFD700] text-2xl mb-3 leading-none" :title="product.type_of_wood_Object?.name">
        {{ product.type_of_wood_Object?.name || "WD" }}
      </h3>

      <!-- Specs list -->
      <div class="space-y-1 mb-4">
        <p class="text-gray-400 text-sm">
          {{ $t('size') }}:
          <span class="text-white font-medium">
            {{ product.length_of_wood_Object?.name || "-" }}
          </span>
        </p>
        <p class="text-gray-400 text-sm">
          {{ $t('thickness') }}:
          <span class="text-white font-medium">
            {{ product.end_grain_of_wood_Object?.name || "-" }}
          </span>
        </p>
      </div>

      <!-- Spacer to push footer to bottom -->
      <div class="mt-auto pt-4 flex items-end justify-between">
        <!-- Price -->
        <p class="text-[#FFD700] text-2xl font-black">
          ${{ Number(product.price_of_each || 0).toFixed(2) }}
        </p>

        <!-- Add Button -->
        <button
          class="w-10 h-10 bg-[#1C1C28] group-hover:bg-[#FFD700] rounded-lg flex items-center justify-center transition-colors duration-300"
          @click.stop="handleAddToCart">
          <svg xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-[#FFD700] group-hover:text-black transition-colors" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* No extra styles needed with Tailwind */
</style>
