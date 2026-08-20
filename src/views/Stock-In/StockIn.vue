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

// 🟡 CART
const cart = ref([]);
const userItem = ref(null);

// 🟣 TotalCube Popup state
const showCubeModal = ref(false);
const pendingProduct = ref(null);
const cubeInput = ref("");
const cubeInputError = ref("");

function isLongCategory(product) {
  const categoryName = product?.category_object?.name || "";
  return categoryName.toLowerCase().includes("long");
}

// Add product to cart
function addToCart(product) {
  if (isLongCategory(product)) {
    // Show the totalCube input popup for "Long" category
    pendingProduct.value = product;
    cubeInput.value = "";
    cubeInputError.value = "";
    showCubeModal.value = true;
  } else {
    // Short (or other) category – existing flow, no cube needed
    doAddToCart(product, null);
  }
}

function doAddToCart(product, totalCube) {
  const existing = cart.value.find(
    (item) =>
      item?.type_of_wood_Object.name === product.type_of_wood_Object.name &&
      item?.cost_of_each === product.cost_of_each
  );

  if (existing) {
    existing.quantity += 1;
    // For Long items accumulate cube if re-adding same product
    if (totalCube !== null && totalCube !== undefined) {
      existing.totalCube = Number(
        ((existing.totalCube || 0) + Number(totalCube)).toFixed(4)
      );
    }
  } else {
    const entry = { ...product, quantity: 1, product_id: product?._id };
    if (totalCube !== null && totalCube !== undefined) {
      entry.totalCube = Number(Number(totalCube).toFixed(4));
    }
    console.log("Data", entry);
    cart.value.push(entry);
  }
}

function confirmCubeInput() {
  const val = parseFloat(cubeInput.value);
  if (isNaN(val) || val <= 0) {
    cubeInputError.value = "Please enter a valid value greater than 0.";
    return;
  }
  showCubeModal.value = false;
  doAddToCart(pendingProduct.value, val);
  pendingProduct.value = null;
}

function cancelCubeModal() {
  showCubeModal.value = false;
  pendingProduct.value = null;
  cubeInput.value = "";
  cubeInputError.value = "";
}

function increaseQty(item) {
  item.quantity += 1;
}

function decreaseQty(item) {
  if (item.quantity > 1) {
    item.quantity -= 1;
  } else {
    // remove item when qty = 0
    cart.value = cart.value.filter((i) => i !== item);
  }
}

// Computed totals
// FIX: `isLongCategory` is a function, not a ref — `isLongCategory.value` was
// always `undefined` (falsy), so the cart ALWAYS used the `cost_of_each * quantity`
// branch, even for "Long" items priced by cube. It also needs to be evaluated
// PER ITEM, since the cart can contain a mix of Long and non-Long products.
const subtotal = computed(() =>
  cart.value.reduce((sum, p) => {
    if (isLongCategory(p)) {
      return sum + Number(p.cost_per_kube || 0) * Number(p.totalCube || 0);
    }
    return sum + Number(p.cost_of_each || 0) * Number(p.quantity || 0);
  }, 0)
);

const tax = computed(() => subtotal.value); //* 0.075
const total = computed(() => subtotal.value);

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

    // save pagination
    currentPage.value = res?.data?.pagination?.currentPage;
    totalPages.value = res?.data?.pagination?.totalPages;
  } catch (error) {
    console.log(error);
  } finally {
    isLoadingProduct.value = false;
  }
};

const completeStockIn = async () => {
  const objData = {
    note: "New stock in!",
    items: cart.value.map((item) => {
      const entry = {
        product_id: item.product_id,
        quantity:
          item.totalCube !== undefined && item.totalCube !== null
            ? 0
            : item.quantity,
      };

      if (item.totalCube !== undefined && item.totalCube !== null) {
        entry.totalCube = item.totalCube;
      }

      return entry;
    }),
  };

  console.log("Payload:", JSON.stringify(objData, null, 2));

  const resOrder = await store.dispatch("createStockIn", objData);

  downloadPDF(resOrder?.data?._id);

  if (resOrder) {
    cart.value = [];
    toast.success("Stock in successful!");
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

function removeItem(item) {
  cart.value = cart.value.filter((i) => i !== item);
}
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
        <h2 class="font-semibold text-lg mb-6 text-black">
          {{ $t('BUTTON.your_selection') }}
          <span class="ml-2 text-[#986b41]"> ({{ cart.length }} {{ $t('BUTTON.item') }}) </span>
        </h2>

        <!-- Cart Items -->
        <div class="space-y-4" v-if="cart.length > 0">
          <div v-for="item in cart" :key="item.name" class="rounded-xl border border-gray-200 p-3 bg-white shadow-sm">
            <!-- Product info + qty controls -->
            <div class="flex justify-between items-start">
              <div class="flex-1 pr-2">
                <p class="font-semibold text-black text-sm leading-tight">
                  {{
                    [
                      item.type_of_wood_Object?.name,
                      item.end_grain_of_wood_Object?.name,
                      item.length_of_wood_Object?.name
                  ].filter(Boolean).join(' ') || ''
                  }}
                </p>
                <p class="text-[#986b41] text-xs mt-0.5">${{ item.cost_of_each.toFixed(2) }}</p>
                <!-- Category badge -->
                <span v-if="item.category_object?.name"
                  class="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  :class="isLongCategory(item) ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'">
                  {{ item.category_object.name }}
                </span>
              </div>

              <!-- Quantity Controls -->
              <div v-if="!isLongCategory(item)" class="flex items-center gap-1.5">
                <button class="w-7 h-7 rounded bg-gray-700 hover:bg-gray-600 text-white font-bold text-lg leading-none"
                  @click="decreaseQty(item)">
                  −
                </button>
                <span class="w-6 text-center text-black font-semibold text-sm">{{ item.quantity }}</span>
                <button class="w-7 h-7 rounded bg-[#986b41] text-white font-bold hover:bg-[#B68E65]"
                  @click="increaseQty(item)">
                  +
                </button>
              </div>

              <button v-if="isLongCategory(item)" @click="removeItem(item)"
                class="w-4 h-4 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition"
                title="Remove">
                <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2.5"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
            </div>

            <!-- TotalCube editable row – only for Long category -->
            <div v-if="isLongCategory(item)" class="mt-2 pt-2 border-t border-amber-100">
              <div class="flex items-center gap-2">
                <CubeIcon class="h-4 w-4 text-amber-600 flex-shrink-0" />
                <label class="text-xs font-semibold text-amber-700 flex-shrink-0">Total Cube</label>
                <input type="number" min="0" step="0.0001" v-model.number="item.totalCube"
                  class="flex-1 min-w-0 border border-amber-300 rounded-md px-2 py-1 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-amber-400 bg-amber-50"
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
          <!-- <div class="flex justify-between text-gray-400">
              <p>Tax (7.5%):</p>
              <p>${{ tax.toFixed(2) }}</p>
            </div> -->
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

    <!-- ======== TotalCube Modal Popup ======== -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showCubeModal" class="fixed inset-0 z-50 flex items-center justify-center"
          @click.self="cancelCubeModal">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

          <!-- Modal Card -->
          <div class="modal-card relative z-10 w-full max-w-sm mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
            <!-- Header -->
            <div class="bg-gradient-to-r from-[#986b41] to-[#B68E65] px-6 py-4 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <CubeIcon class="h-5 w-5 text-white" />
                <h3 class="text-white font-bold text-lg">Enter Total Cube</h3>
              </div>
              <button @click="cancelCubeModal" class="p-1 rounded-full hover:bg-white/20 transition-colors">
                <XMarkIcon class="h-5 w-5 text-white" />
              </button>
            </div>

            <!-- Body -->
            <div class="px-6 py-5">
              <!-- Product preview -->
              <div v-if="pendingProduct" class="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
                <p class="text-xs text-amber-600 font-semibold uppercase tracking-wide mb-1">Product</p>
                <p class="text-sm font-bold text-gray-800">
                  {{ pendingProduct.type_of_wood_Object?.name }}
                  {{ pendingProduct.end_grain_of_wood_Object?.name }}
                  <span v-if="pendingProduct.category_object?.name !== 'Long'">
                    × {{ pendingProduct.length_of_wood_Object?.name }}
                  </span>
                </p>
                <span
                  class="inline-block mt-1 text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                  {{ pendingProduct.category_object?.name }}
                </span>
              </div>

              <label class="block text-sm font-semibold text-gray-700 mb-1.5">
                Total Cube
                <span class="text-red-500 ml-0.5">*</span>
              </label>
              <input id="totalCubeInput" type="number" min="0" step="0.0001" v-model="cubeInput"
                @keydown.enter="confirmCubeInput" autofocus
                class="w-full border-2 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none transition-all"
                :class="cubeInputError
                  ? 'border-red-400 focus:border-red-500'
                  : 'border-gray-200 focus:border-[#986b41]'" placeholder="e.g. 2.35" />
              <p v-if="cubeInputError" class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <span>⚠</span> {{ cubeInputError }}
              </p>
            </div>

            <!-- Footer -->
            <div class="px-6 pb-5 flex gap-3">
              <button @click="cancelCubeModal"
                class="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button @click="confirmCubeInput"
                class="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#986b41] to-[#B68E65] text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-md shadow-amber-200">
                Confirm
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