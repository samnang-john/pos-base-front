<script setup>
import { ref, computed } from "vue";
import { Dialog, DialogPanel, TransitionRoot, TransitionChild } from "@headlessui/vue";

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["add-to-cart"]);

const isOpen = ref(false);

// Dialog form fields
const quantity = ref(1);
const discount = ref(0);
const note = ref("");

// Cubic meter dimension fields
const length = ref(0);
const width = ref(0);
const thickness = ref(0);

const cubicMeters = computed(() => {
  const l = Number(length.value) || 0;
  const w = Number(width.value) || 0;
  const t = Number(thickness.value) || 0;
  const q = Number(quantity.value) || 0;
  return Number(((l * w * t * q) /10000).toFixed(4));
});

const estimatedPrice = computed(() => {
  let price = 0;

  if (props.product?.price_per_kube) {
    price = cubicMeters.value * Number(props.product.price_per_kube || 0);
  } else {
    price = Number(props.product?.price_of_each || 0) * (Number(quantity.value) || 0);
  }
  return price;
});

function resetFormFields() {
  quantity.value = 1;
  discount.value = 0;
  note.value = "";
  length.value = 0;
  width.value = 0;
  thickness.value = 0;
}

function handleCardClick() {
  if (props.product?.category_object?.name === "Long") {
    resetFormFields();
    isOpen.value = true;
  } else {
    emit("add-to-cart", {
      ...props.product,
      quantity: 1,
      discount: 0,
      note: "",
      cubic_meters: null,
      length: null,
      width: null,
      thickness: null,
    });
  }
}

function closeModal() {
  isOpen.value = false;
}

function confirmAddToCart() {
  if (cubicMeters.value <= 0) {
    return; // guard: don't allow zero-volume cubic items
  }

  emit("add-to-cart", {
    ...props.product,
    quantity: Number(quantity.value) || 1,
    discount: Number(discount.value) || 0,
    note: note.value.trim(),
    length: Number(length.value) || 0,
    width: Number(width.value) || 0,
    thickness: Number(thickness.value) || 0,
    cubic_meters: cubicMeters.value,
  });
  closeModal();
}
</script>

<template>
  <div class="group relative bg-[#13131F] rounded-2xl overflow-hidden transition-all duration-300 flex flex-col h-full cursor-pointer hover:shadow-2xl hover:shadow-[#FFD700]/10"
    @click="handleCardClick">
    <!-- Image Container -->
    <div class="h-45 sm:h-50 relative bg-[#1C1C28] overflow-hidden">
      <img :src="product.image || '/fallback-image.jpg'"
        :alt="`${product.type_of_wood_Object?.name || 'Wood'} cutting board`"
        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
    </div>

    <!-- Content -->
    <div class="p-5 flex flex-col flex-1">
      <h3 class="font-black text-[#FFD700] text-2xl mb-3 leading-none" :title="product.type_of_wood_Object?.name">
        {{ product.type_of_wood_Object?.name || "WD" }}
      </h3>

      <div class="space-y-1 mb-4">
        <p v-if="product.category_object?.name" class="text-gray-400 text-sm truncate" :title="product.category_object?.name">
          {{ $t('MENU.category') || 'Category' }}:
          <span class="text-white font-medium">
            {{ product.category_object?.name }}
          </span>
        </p>

        <p v-if="product.category_object?.name !== 'Long'" class="text-gray-400 text-sm">
          {{ $t('size') }}:
          <span class="text-white font-medium">
            {{ product.length_of_wood_Object?.name || "-" }}
          </span>
        </p>
        <p v-if="product.category_object?.name !== 'Long'" class="text-gray-400 text-sm">
          {{ $t('thickness') }}:
          <span class="text-white font-medium">
            {{ product.end_grain_of_wood_Object?.name || "-" }}
          </span>
        </p>

        <p v-if="product.category_object?.name === 'Long'" class="text-gray-400 text-sm">
          Total Meter Cube:
          <span class="text-white font-medium">
            {{ product.total_cube }} m³
          </span>
        </p>
      </div>

      <div class="mt-auto pt-4 flex items-end justify-between">
        <p class="text-[#FFD700] text-2xl font-black">
          ${{ Number(product.price_of_each || 0).toFixed(2) }}
        </p>

        <button
          class="w-10 h-10 bg-[#1C1C28] rounded-lg flex items-center justify-center transition-colors duration-300 group-hover:bg-[#FFD700]"
          @click.stop="handleCardClick">
          <svg xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-[#FFD700] group-hover:text-black transition-colors" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Product Detail Modal (only shown for long category names) -->
    <TransitionRoot appear :show="isOpen" as="template">
      <Dialog as="div" class="relative z-50" @close="closeModal">
        <TransitionChild
          as="template"
          enter="duration-200 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-150 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/70" @click.self="closeModal" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as="template"
              enter="duration-200 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-150 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel
                class="w-full max-w-md transform overflow-hidden rounded-2xl bg-[#13131F] border border-white/10 text-left align-middle shadow-2xl"
                @click.stop
              >
                <div class="h-56 bg-[#1C1C28] overflow-hidden">
                  <img :src="product.image || '/fallback-image.jpg'"
                    :alt="`${product.type_of_wood_Object?.name || 'Wood'} cutting board`"
                    class="w-full h-full object-cover" />
                </div>

                <div class="p-6">
                  <h3 class="font-black text-[#FFD700] text-2xl mb-4 leading-tight break-words">
                    {{ product.type_of_wood_Object?.name || "WD" }}
                  </h3>

                  <div class="space-y-2 mb-6">
                    <p v-if="product.category_object?.name" class="text-gray-400 text-sm break-words">
                      {{ $t('MENU.category') || 'Category' }}:
                      <span class="text-white font-medium">
                        {{ product.category_object?.name }}
                      </span>
                    </p>
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

                  <!-- Cubic meter dimension inputs -->
                  <div class="grid grid-cols-3 gap-3 mb-4">
                    <div>
                      <label class="block text-xs text-gray-400 mb-1.5" for="modal-length">
                        {{ $t('FORM.length') }}
                      </label>
                      <input
                        id="modal-length"
                        v-model.number="length"
                        type="number"
                        min="0"
                        step="0.01"
                        class="w-full bg-[#1C1C28] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label class="block text-xs text-gray-400 mb-1.5" for="modal-width">
                        {{ $t('FORM.width') }}
                      </label>
                      <input
                        id="modal-width"
                        v-model.number="width"
                        type="number"
                        min="0"
                        step="0.01"
                        class="w-full bg-[#1C1C28] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label class="block text-xs text-gray-400 mb-1.5" for="modal-thickness">
                        {{ $t('FORM.thickness') }}
                      </label>
                      <input
                        id="modal-thickness"
                        v-model.number="thickness"
                        type="number"
                        min="0"
                        step="0.01"
                        class="w-full bg-[#1C1C28] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <!-- Live cubic meter preview -->
                  <div class="flex items-center justify-between bg-[#1C1C28] rounded-lg px-3 py-2 mb-4">
                    <span class="text-xs text-gray-400">{{ $t('FORM.cubic_meters') }}</span>
                    <span class="text-sm font-bold text-[#FFD700]">{{ cubicMeters }} m³</span>
                  </div>

                  <div class="flex items-center justify-between mb-6">
                    <span class="text-gray-400 text-sm">{{ $t('BUTTON.total') || 'Price' }}</span>
                    <p class="text-[#FFD700] text-3xl font-black">
                      ${{ estimatedPrice.toFixed(2) }}
                    </p>
                  </div>

                  <div class="flex gap-3">
                    <button
                      class="flex-1 py-3 rounded-xl font-bold text-gray-300 bg-[#1C1C28] hover:bg-[#252535] transition"
                      @click="closeModal"
                    >
                      {{ $t('BUTTON.cancel') || 'Cancel' }}
                    </button>
                    <button
                      class="flex-1 py-3 rounded-xl font-bold text-black bg-[#FFD700] hover:bg-[#e6c200] transition disabled:opacity-50 disabled:cursor-not-allowed"
                      :disabled="cubicMeters <= 0"
                      @click="confirmAddToCart"
                    >
                      {{ $t('BUTTON.add_to_cart') || 'Add to Cart' }}
                    </button>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<style scoped>
/* No extra styles needed with Tailwind */
</style>