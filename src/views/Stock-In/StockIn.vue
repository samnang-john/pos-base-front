<script setup>
import { computed, onMounted, ref } from "vue";
import store from "../../store";
import ProductCard from "./ProductCard.vue";
import { PRODUCTS_PER_PAGE } from "../../constants";
import { toast } from "vue3-toastify";
import router from "../../router";
import { ClockIcon, CubeIcon } from "@heroicons/vue/24/solid";
import { XMarkIcon } from "@heroicons/vue/24/outline";
import { toRaw } from "vue";

const perPage = ref(PRODUCTS_PER_PAGE);
const search = ref("");
const products = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const pageSize = ref(15);
const isLoadingProduct = ref(false);

// 🟡 CART & NOTE
const cart = ref([]);
const userItem = ref(null);
const stockNote = ref("");

// 🟣 Long Wood Modal state
const showCubeModal = ref(false);
const pendingProduct = ref(null);
const modalLength = ref("");
const modalWidth = ref("");
const modalThickness = ref("");
const modalLongQty = ref(1);
const modalCubicMeters = ref("");
const cubeInputError = ref("");

function isLongCategory(product) {
  const categoryName = product?.category_object?.name || "";
  return categoryName.toLowerCase().includes("long");
}

function recalculateCubic() {
  const l = parseFloat(modalLength.value) || 0;
  const w = parseFloat(modalWidth.value) || 0;
  const t = parseFloat(modalThickness.value) || 0;
  const q = parseFloat(modalLongQty.value) || 0;

  if (l > 0 && w > 0 && t > 0 && q > 0) {
    let volume = 0;
    if (w < 1 && t < 1) {
      volume = l * w * t * q;
    } else {
      volume = (l * w * t * q) / 10000;
    }
    modalCubicMeters.value = Number(volume.toFixed(4));
  }
}

const modalEstimatedCost = computed(() => {
  const cube = parseFloat(modalCubicMeters.value) || 0;
  const cost = Number(
    pendingProduct.value?.cost_per_kube ||
      pendingProduct.value?.cost_of_each ||
      0
  );
  return Number((cube * cost).toFixed(2));
});

// Add product to cart
function addToCart(product) {
  if (isLongCategory(product)) {
    // Show the dimensions modal for "Long" category
    pendingProduct.value = product;
    modalLength.value = "";
    modalWidth.value = "";
    modalThickness.value = "";
    modalLongQty.value = 1;
    modalCubicMeters.value = "";
    cubeInputError.value = "";
    showCubeModal.value = true;
  } else {
    // Short (or standard) category – existing flow
    doAddToCart(product);
  }
}

function doAddToCart(product) {
  const isCubicItem = isLongCategory(product) || !!product.cubic_meters;

  // Cubic-meter items are kept as distinct line items since dimensions
  // can differ per entry. Regular unit items merge by wood type + cost.
  const existing = !isCubicItem
    ? cart.value.find(
        (item) =>
          !item.cubic_meters &&
          item?.type_of_wood_Object?.name === product.type_of_wood_Object?.name &&
          item?.cost_of_each === product.cost_of_each
      )
    : null;

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.value.push({
      ...product,
      product_id: product._id || product.product_id,
      quantity: product.quantity || 1,
      long_qty: product.long_qty || (isCubicItem ? (product.quantity || 1) : null),
      cubic_meters: product.cubic_meters || null,
      length: product.length || null,
      width: product.width || null,
      thickness: product.thickness || null,
    });
  }
}

function confirmCubeModal() {
  const q = Number(modalLongQty.value) || 0;
  const cm = parseFloat(modalCubicMeters.value);

  if (q <= 0) {
    cubeInputError.value = "Quantity must be greater than 0.";
    return;
  }
  if (isNaN(cm) || cm <= 0) {
    cubeInputError.value = "Cubic meters must be greater than 0.";
    return;
  }

  doAddToCart({
    ...pendingProduct.value,
    long_qty: q,
    quantity: q,
    cubic_meters: cm,
    length: parseFloat(modalLength.value) || 0,
    width: parseFloat(modalWidth.value) || 0,
    thickness: parseFloat(modalThickness.value) || 0,
  });

  showCubeModal.value = false;
  pendingProduct.value = null;
}

function cancelCubeModal() {
  showCubeModal.value = false;
  pendingProduct.value = null;
  modalLength.value = "";
  modalWidth.value = "";
  modalThickness.value = "";
  modalLongQty.value = 1;
  modalCubicMeters.value = "";
  cubeInputError.value = "";
}

function increaseQty(item) {
  if (isLongCategory(item) || item.cubic_meters) return;
  item.quantity += 1;
}

function decreaseQty(item) {
  if (isLongCategory(item) || item.cubic_meters) return;
  if (item.quantity > 1) {
    item.quantity -= 1;
  } else {
    cart.value = cart.value.filter((i) => i !== item);
  }
}

function removeItem(item) {
  cart.value = cart.value.filter((i) => i !== item);
}

function lineTotal(item) {
  if (isLongCategory(item) || item.cubic_meters) {
    return Number(item.cost_per_kube || item.cost_of_each || 0) * Number(item.cubic_meters || 0);
  }
  return Number(item.cost_of_each || 0) * Number(item.quantity || 0);
}

const subtotal = computed(() =>
  cart.value.reduce((sum, item) => sum + lineTotal(item), 0)
);

const total = computed(() => subtotal.value);

// Mirrors createOrder cart validation
function validateCart() {
  for (const item of cart.value) {
    const label = item.type_of_wood_Object?.name || "Item";

    if (isLongCategory(item) || item.cubic_meters) {
      if (isNaN(item.cubic_meters) || Number(item.cubic_meters) <= 0) {
        toast.error(`${label}: cubic meters must be greater than 0`);
        return false;
      }
      const longQtyVal = Number(item.long_qty || item.quantity);
      if (!longQtyVal || isNaN(longQtyVal) || longQtyVal <= 0) {
        toast.error(`${label}: quantity must be greater than 0`);
        return false;
      }
    } else {
      if (!item.quantity || isNaN(item.quantity) || Number(item.quantity) <= 0) {
        toast.error(`${label}: quantity must be greater than 0`);
        return false;
      }
    }
  }
  return true;
}

onMounted(async () => {
  try {
    await Promise.all([getProducts(), getUser()]);
  } catch (error) {
    console.error("Error during initialization:", error);
  }
});

const getUser = async () => {
  try {
    const resUser = await store.dispatch("getUser");
    userItem.value = resUser || null;
  } catch (error) {
    console.log(error);
  }
};

const getProducts = async (page = 1) => {
  isLoadingProduct.value = true;
  try {
    const res = await store.dispatch("getProducts", {
      page,
      pageSize: pageSize.value,
    });

    products.value = res.data.items || [];

    currentPage.value = res?.data?.pagination?.currentPage;
    totalPages.value = res?.data?.pagination?.totalPages;
  } catch (error) {
    console.log(error);
  } finally {
    isLoadingProduct.value = false;
  }
};

const completeStockIn = async () => {
  if (cart.value.length === 0) return;

  if (!validateCart()) return;

  const objData = {
    note: stockNote.value.trim() || "Stock in",
    items: cart.value.map((item) => {
      if (isLongCategory(item) || item.cubic_meters) {
        return {
          product_id: item.product_id || item._id,
          long_qty: Number(item.long_qty || item.quantity || 1),
          cubic_meters: Number(item.cubic_meters),
          length: Number(item.length || 0),
          width: Number(item.width || 0),
          thickness: Number(item.thickness || 0),
        };
      }
      return {
        product_id: item.product_id || item._id,
        quantity: Number(item.quantity) || 1,
      };
    }),
  };

  console.log("StockIn Payload:", JSON.stringify(objData, null, 2));

  try {
    const resOrder = await store.dispatch("createStockIn", objData);

    const stockInId = resOrder?.data?._id || resOrder?.sync?._id || resOrder?._id;
    if (stockInId) {
      downloadPDF(stockInId);
    }

    if (resOrder) {
      cart.value = [];
      stockNote.value = "";
      toast.success("Stock in successful!");
    }
  } catch (error) {
    console.error("Stock in error:", error);
    toast.error(error.response?.data?.message || "Failed to stock in");
  }
};

const downloadPDF = async (stockInID) => {
  console.log("stockInID", stockInID);
  const res = await store.dispatch("downloadStockIn", {
    stockInID: stockInID,
  });

  // Create blob from binary data
  const blob = new Blob([res], { type: "application/pdf" });

  // Create download link
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `report-${new Date().toISOString().slice(0, 10)}.pdf`; // e.g., report-2025-12-20.pdf
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  window.URL.revokeObjectURL(url);
};

const onViewListHistory = () => {
  router.push({
    name: "app.stockinhistory",
  });
};
</script>

<template>
  <div class="text-white">
    <!-- Main Layout: Products + Cart -->
    <div class="flex flex-col lg:flex-row gap-10">
      <!-- LEFT SIDE: Products -->
      <div class="flex-1 lg:order-1 order-2">
        <div class="flex mb-4 justify-between">
          <h1 class="text-3xl font-semibold text-black">{{ $t('MENU.stock_in') }}</h1>
          <button type="button" @click="onViewListHistory"
            class="inline-flex items-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#986b41] hover:bg-[#B68E65] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <ClockIcon class="h-5 w-5 mr-2" />
            {{ $t('BUTTON.stock_in_history') }}
          </button>
        </div>
        <!-- Product cards -->
        <div class="">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <ProductCard v-for="product in products" :key="product._id" :product="product" @add-to-cart="addToCart" />
          </div>
        </div>
      </div>

      <!-- RIGHT SIDE: Cart (fixed width on large screens, full on small) -->
      <div class="w-full lg:w-80 lg:border-l border-yellow-500/40 lg:pl-6 lg:order-2 order-1">
        <h2 class="font-semibold text-lg mb-4 text-black">
          {{ $t('BUTTON.your_selection') }}
          <span class="ml-2 text-[#986b41]"> ({{ cart.length }} {{ $t('BUTTON.item') }}) </span>
        </h2>

        <!-- Note Input -->
        <div class="mb-4" v-if="cart.length > 0">
          <label class="block text-xs font-semibold text-gray-700 mb-1">
            {{ $t('FORM.note') || 'Note' }}
          </label>
          <input
            type="text"
            v-model="stockNote"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#986b41] bg-white shadow-sm"
            placeholder="e.g. Sync stock"
          />
        </div>

        <!-- Cart Items -->
        <div class="space-y-3" v-if="cart.length > 0">
          <div v-for="(item, index) in cart" :key="`${item._id || item.product_id}-${index}`" 
            class="rounded-xl border border-gray-200 p-3.5 bg-white shadow-sm hover:shadow-md transition">
            <!-- Header: Product info + Price + Remove -->
            <div class="flex justify-between items-start gap-2">
              <div class="flex-1 min-w-0 pr-1">
                <p class="font-semibold text-gray-900 text-sm leading-tight truncate">
                  {{
                    [
                      item.type_of_wood_Object?.name,
                      item.end_grain_of_wood_Object?.name,
                      item.length_of_wood_Object?.name
                  ].filter(Boolean).join(' ') || ''
                  }}
                </p>
                <div class="flex flex-wrap items-center gap-2 mt-1">
                  <!-- Category badge -->
                  <span v-if="item.category_object?.name"
                    class="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full"
                    :class="isLongCategory(item) ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'">
                    {{ item.category_object.name }}
                  </span>
                  <span class="text-xs text-[#986b41] font-bold">
                    ${{ lineTotal(item).toFixed(2) }}
                  </span>
                  <span v-if="isLongCategory(item) && item.cost_per_kube" class="text-[11px] text-gray-400">
                    (${{ Number(item.cost_per_kube).toFixed(2) }}/m³)
                  </span>
                </div>
              </div>

              <!-- Action buttons -->
              <div class="flex items-center gap-1.5 flex-shrink-0">
                <!-- Quantity Controls for Short items -->
                <div v-if="!isLongCategory(item)" class="flex items-center bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  <button class="w-6 h-6 hover:bg-gray-200 text-gray-700 font-bold text-sm leading-none transition"
                    @click="decreaseQty(item)">
                    −
                  </button>
                  <span class="w-6 text-center text-gray-900 font-semibold text-xs">{{ item.quantity }}</span>
                  <button class="w-6 h-6 bg-[#986b41] hover:bg-[#B68E65] text-white font-bold text-sm leading-none transition"
                    @click="increaseQty(item)">
                    +
                  </button>
                </div>

                <!-- Remove button -->
                <button @click="removeItem(item)"
                  class="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                  title="Remove">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Long category specs & editable cube -->
            <div v-if="isLongCategory(item)" class="mt-2.5 pt-2 border-t border-amber-100 flex items-center justify-between gap-2">
              <div class="flex flex-wrap items-center gap-1 text-[11px]">
                <span v-if="item.length || item.width || item.thickness" 
                  class="bg-amber-50 text-gray-700 px-1.5 py-0.5 rounded border border-amber-200 font-mono">
                  {{ item.length }}×{{ item.width }}×{{ item.thickness }}
                </span>
                <span v-if="item.long_qty" 
                  class="bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.5 rounded">
                  {{ item.long_qty }} {{ $t('BUTTON.item') || 'pcs' }}
                </span>
              </div>

              <!-- Cubic input -->
              <div class="flex items-center gap-1.5 flex-shrink-0">
                <CubeIcon class="h-3.5 w-3.5 text-amber-600" />
                <span class="text-[11px] font-semibold text-amber-800">m³:</span>
                <input type="number" min="0" step="0.0001" v-model.number="item.cubic_meters"
                  class="w-20 border border-amber-300 rounded px-1.5 py-0.5 text-xs text-right text-gray-800 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-amber-50 font-semibold"
                  placeholder="0.0000" />
              </div>
            </div>
          </div>
        </div>

        <p v-else class="text-gray-500">{{ $t('BUTTON.no_item_add_yet') }}</p>

        <!-- Totals -->
        <div class="mt-8 space-y-2 border-t border-gray-700 pt-4" v-if="cart.length > 0">
          <div class="flex justify-between text-gray-400">
            <p>{{ $t('BUTTON.sub_total') }}:</p>
            <p>${{ subtotal.toFixed(2) }}</p>
          </div>
          <div class="flex justify-between font-bold text-[#B68E65] text-xl">
            <p>{{ $t('BUTTON.total') }}:</p>
            <p>${{ total.toFixed(2) }}</p>
          </div>
        </div>

        <!-- Purchase Button -->
        <button class="mt-6 w-full bg-[#986b41] text-white font-semibold py-3 rounded-lg hover:bg-[#B68E65] transition"
          v-if="cart.length > 0" @click="completeStockIn()">
          {{ $t('BUTTON.complete_stock_in') }}
        </button>
      </div>
    </div>

    <!-- ======== Long Wood Dimensions Modal Popup ======== -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showCubeModal" class="fixed inset-0 z-50 flex items-center justify-center"
          @click.self="cancelCubeModal">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

          <!-- Modal Card -->
          <div class="modal-card relative z-10 w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
            <!-- Header -->
            <div class="bg-gradient-to-r from-[#986b41] to-[#B68E65] px-6 py-4 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <CubeIcon class="h-5 w-5 text-white" />
                <h3 class="text-white font-bold text-lg">{{ $t('enter_total_cube') || 'Wood Dimensions' }}</h3>
              </div>
              <button @click="cancelCubeModal" class="p-1 rounded-full hover:bg-white/20 transition-colors">
                <XMarkIcon class="h-5 w-5 text-white" />
              </button>
            </div>

            <!-- Body -->
            <div class="px-6 py-5">
              <!-- Product preview -->
              <div v-if="pendingProduct" class="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
                <p class="text-xs text-amber-600 font-semibold uppercase tracking-wide mb-1">{{ $t('MENU.product') }}</p>
                <p class="text-sm font-bold text-gray-800">
                  {{ pendingProduct.type_of_wood_Object?.name }}
                  {{ pendingProduct.end_grain_of_wood_Object?.name }}
                  <span v-if="!isLongCategory(pendingProduct)">
                    × {{ pendingProduct.length_of_wood_Object?.name }}
                  </span>
                </p>
                <div class="flex items-center justify-between mt-1">
                  <span class="inline-block text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                    {{ pendingProduct.category_object?.name }}
                  </span>
                  <span class="text-xs font-semibold text-[#986b41]">
                    Cost: ${{ Number(pendingProduct.cost_per_kube || pendingProduct.cost_of_each || 0).toFixed(2) }}/m³
                  </span>
                </div>
              </div>

              <!-- Dimensions Grid: Length, Width, Thickness, Qty -->
              <div class="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1">
                    {{ $t('FORM.length') || 'Length' }}
                  </label>
                  <input type="number" min="0" step="0.01" v-model="modalLength" @input="recalculateCubic"
                    placeholder="e.g. 3"
                    class="w-full border rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-[#986b41]" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1">
                    {{ $t('FORM.width') || 'Width' }}
                  </label>
                  <input type="number" min="0" step="0.01" v-model="modalWidth" @input="recalculateCubic"
                    placeholder="e.g. 0.12 or 12"
                    class="w-full border rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-[#986b41]" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1">
                    {{ $t('FORM.thickness') || 'Thickness' }}
                  </label>
                  <input type="number" min="0" step="0.01" v-model="modalThickness" @input="recalculateCubic"
                    placeholder="e.g. 0.06 or 6"
                    class="w-full border rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-[#986b41]" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1">
                    {{ $t('FORM.long_qty') || 'Quantity (pcs)' }} <span class="text-red-500">*</span>
                  </label>
                  <input type="number" min="1" step="1" v-model="modalLongQty" @input="recalculateCubic"
                    placeholder="e.g. 15"
                    class="w-full border rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-[#986b41]" />
                </div>
              </div>

              <!-- Cubic Meters field (Auto-calculated, and editable) -->
              <div class="mb-3">
                <label class="block text-xs font-semibold text-gray-700 mb-1">
                  {{ $t('FORM.cubic_meters') || 'Cubic Meters (m³)' }}
                  <span class="text-red-500 ml-0.5">*</span>
                </label>
                <div class="relative">
                  <input type="number" min="0" step="0.0001" v-model="modalCubicMeters"
                    class="w-full border-2 rounded-xl px-4 py-2.5 text-gray-800 text-sm font-semibold focus:outline-none transition-all"
                    :class="cubeInputError
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-amber-200 focus:border-[#986b41] bg-amber-50/50'"
                    placeholder="e.g. 0.75" />
                  <span class="absolute right-3 top-2.5 text-xs text-amber-700 font-bold">m³</span>
                </div>
              </div>

              <!-- Estimated Cost Preview -->
              <div class="flex items-center justify-between bg-amber-50 rounded-lg p-3 border border-amber-200 mb-2">
                <span class="text-xs font-medium text-gray-600">{{ $t('cost') || 'Estimated Cost' }}:</span>
                <span class="text-base font-bold text-[#986b41]">${{ modalEstimatedCost.toFixed(2) }}</span>
              </div>

              <p v-if="cubeInputError" class="mt-1 text-xs text-red-500 flex items-center gap-1">
                <span>⚠</span> {{ cubeInputError }}
              </p>
            </div>

            <!-- Footer -->
            <div class="px-6 pb-5 flex gap-3">
              <button @click="cancelCubeModal"
                class="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">
                {{ $t('BUTTON.cancel') }}
              </button>
              <button @click="confirmCubeModal"
                class="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#986b41] to-[#B68E65] text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-md shadow-amber-200">
                {{ $t('BUTTON.confirm') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* Modal fade + scale transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-card,
.modal-fade-leave-active .modal-card {
  transition: transform 0.25s ease;
}

.modal-fade-enter-from .modal-card,
.modal-fade-leave-to .modal-card {
  transform: scale(0.95) translateY(12px);
}
</style>