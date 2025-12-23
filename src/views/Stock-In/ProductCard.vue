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
    class="group relative bg-[#986b41] border border-[#986b41] rounded-xl overflow-hidden cursor-pointer duration-300 hover:scale-105"
    @click="handleAddToCart"
  >
    <!-- Image Container -->
    <div class="aspect-w-1 aspect-h-1 w-full bg-white">
      <div
        class="h-48 sm:h-56 md:h-64 flex items-center justify-center overflow-hidden"
      >
        <img
          :src="product.image || '/fallback-image.jpg'"
          :alt="`${product.type_of_wood_Object?.name || 'Wood'} cutting board`"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
    </div>

    <!-- Content -->
    <div class="p-4 sm:p-5">
      <!-- Wood Type -->
      <h3
        class="font-bold text-white text-lg sm:text-xl line-clamp-2"
        :title="product.type_of_wood_Object?.name"
      >
        {{ product.type_of_wood_Object?.name || "Premium Wood" }}
      </h3>

      <!-- End Grain -->
      <p class="mt-2 text-gray-300 text-sm sm:text-base">
        មុខកាត់:
        <span class="text-white font-medium">
          {{ product.end_grain_of_wood_Object?.name || "-" }}
        </span>
      </p>

      <!-- Length -->
      <p class="mt-1 text-gray-300 text-sm sm:text-base">
        ប្រវែង:
        <span class="text-white font-medium">
          {{ product.length_of_wood_Object?.name || "-" }}
        </span>
      </p>

      <!-- Price -->
      <p class="mt-4 text-white text-lg sm:text-xl font-bold">
        ${{ Number(product.cost_of_each || 0).toFixed(2) }}
      </p>
    </div>

    <!-- Optional: Subtle "Add" indicator on hover (desktop) -->
    <div
      class="absolute inset-0 bg-[#986b41]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-center justify-center"
    >
      <span class="text-[#986b41] font-bold text-lg">+ Add to Cart</span>
    </div>
  </div>
</template>

<style scoped>
/* Ensure line clamping works */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Fallback for older Tailwind versions if not using plugin */
.aspect-w-1 {
  position: relative;
  padding-bottom: 100%;
}
.aspect-w-1 > div {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
