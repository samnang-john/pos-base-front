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
    class="group relative bg-[#986b41] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-[#FFD700]/20 flex flex-col h-full border border-white/10"
    @click="handleAddToCart">

    <!-- Image Container (Reduced Height) -->
    <div class="h-32 sm:h-36 md:h-40 relative bg-white overflow-hidden">
      <img :src="product.image || '/fallback-image.jpg'"
        :alt="`${product.type_of_wood_Object?.name || 'Wood'} cutting board`"
        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />

      <div class="absolute inset-0 shadow-inner pointer-events-none"></div>
    </div>

    <!-- Content (Reduced Padding) -->
    <div class="p-3 flex flex-col flex-1 relative">

      <!-- Title (Smaller margin) -->
      <h3 class="font-black text-white text-xl mb-1 leading-tight tracking-wide drop-shadow-sm line-clamp-1"
        :title="product.type_of_wood_Object?.name">
        {{ product.type_of_wood_Object?.name || "WD" }}
      </h3>

      <!-- Divider (Thinner/Smaller margin) -->
      <div class="w-8 h-1 bg-[#FFD700] rounded-full mb-2 opacity-80"></div>

      <!-- Specs list (Compact) -->
      <div class="space-y-0.5 mb-2 grid grid-cols-2 gap-x-2">
        <div class="flex flex-col">
          <span class="text-white/70 text-[10px] uppercase font-bold tracking-wider">{{ $t('size') }}</span>
          <span class="text-white font-semibold text-xs truncate">
            {{ product.length_of_wood_Object?.name || "-" }}
          </span>
        </div>
        <div class="flex flex-col">
          <span class="text-white/70 text-[10px] uppercase font-bold tracking-wider">{{ $t('thickness') }}</span>
          <span class="text-white font-semibold text-xs truncate">
            {{ product.end_grain_of_wood_Object?.name || "-" }}
          </span>
        </div>
      </div>

      <!-- Spacer -->
      <div class="mt-auto pt-1 flex flex-col gap-1">
        <!-- Costs/Prices Box (Compact) -->
        <div class="bg-black/20 rounded-lg p-2 backdrop-blur-sm">
          <div class="flex justify-between items-center text-[10px] mb-0.5">
            <span class="text-white/80 font-medium">{{ $t('cost') }}</span>
            <span class="text-white font-bold">${{ Number(product.cost_of_each || 0).toFixed(2) }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-white/80 font-medium text-xs">{{ $t('price') }}</span>
            <span class="text-[#FFD700] text-lg font-black drop-shadow-md">
              ${{ Number(product.price_of_each || 0).toFixed(2) }}
            </span>
          </div>
        </div>
      </div>

    </div>

    <!-- Add Button (Overlay style - Adjusted position) -->
    <div
      class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
      <button
        class="bg-[#1C1C28] text-[#FFD700] hover:bg-white hover:text-[#986b41] p-1.5 rounded-full shadow-lg transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>

  </div>
</template>

<style scoped>
/* Ensure line clamping works */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  /* compatibility fix */
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
