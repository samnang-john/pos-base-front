<script setup>
import { computed, onMounted, ref } from "vue";
import store from "../../store";
import ProductCard from "./ProductCard.vue";
import { PRODUCTS_PER_PAGE } from "../../constants";
import { toast } from "vue3-toastify";
import { useI18n } from "vue-i18n";
import CustomInput from "../../components/core/CustomInput.vue";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";
import { UserIcon, ArrowLeftOnRectangleIcon, ChevronDownIcon, HomeIcon } from "@heroicons/vue/24/solid";
import router from "../../router";

const perPage = ref(PRODUCTS_PER_PAGE);
const search = ref("");
const products = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const pageSize = ref(15);
const isLoadingProduct = ref(false);
const customer = ref("");

// 🟡 CART
const cart = ref([]);
const userItem = ref(null);

// Add product to cart
function addToCart(product) {
  if (product.number_of_wood <= 0) {
    toast.error(t('TOAST.out_of_stock') || "Product out of stock");
    return;
  }
  const existing = cart.value.find(
    (item) =>
      item?.type_of_wood_Object.name === product.type_of_wood_Object.name &&
      item?.price_of_each === product.price_of_each
  );

  if (existing) {
    existing.quantity += 1; // increase quantity
  } else {
    cart.value.push({
      ...product,
      quantity: 1,
      product_id: product?._id,
      discount: 0,
    });
  }
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
const subtotal = computed(() =>
  cart.value.reduce(
    (sum, p) =>
      sum - Number(p.discount || 0) + Number(p.price_of_each || 0) * p.quantity,
    0
  )
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
    console.log("Error fetching user:", error);
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

  } finally {
    isLoadingProduct.value = false;
  }
};

const completeOrder = async () => {
  const objData = {
    customer: customer.value || "Guest",
    discount: 0,
    tax: 0,
    items: cart.value.map(item => ({
      product_id: item.product_id || item._id,
      quantity: item.quantity,
      price: item.price_of_each,
      discount: item.discount || 0
    })),
  };
  const resOrder = await store.dispatch("createOrder", objData);
  console.log("resOrder", resOrder);

  if (resOrder) {
    downloadReceiptPDF(resOrder?.order?._id);
    cart.value = [];
    customer.value = "";
    toast.success(t('TOAST.order_success'));
  }
};

const downloadReceiptPDF = async (orderID) => {
  const res = await store.dispatch("getOrdersReceitPDF", {
    orderID: orderID,
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

const { locale, t } = useI18n();

const toggleLang = () => {
  locale.value = locale.value === "en" ? "km" : "en";
  localStorage.setItem("lang", locale.value);
};
</script>

<template>
  <div class="bg-[#0B0B15] text-white min-h-screen font-sans">
    <!-- Navbar / Header -->
    <div class="px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-white/5">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-[#FFD700] rounded-lg flex items-center justify-center text-black font-bold">
          <img src="../../assets/my-logo.png" alt="Logo" class="w-8 h-8 object-contain" />
        </div>
        <h1 class="text-2xl font-black tracking-wider text-[#FFD700]">WOOD</h1>
      </div>

      <div class="flex items-center gap-4">
        <div class="text-right">
          <p class="text-xs text-gray-400 mb-0.5">
            {{ $t("BUTTON.welcome") }},
          </p>
          <p class="text-sm font-bold text-white leading-none">
            {{ userItem?.name || $t("FORM.guest") }}
          </p>
        </div>

        <!-- Navigation Dropdown -->
        <Menu as="div" class="relative inline-block text-left">
          <MenuButton
            class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700 hover:bg-gray-700 transition overflow-hidden">
            <img v-if="userItem?.image" :src="userItem.image" class="w-full h-full object-cover" />
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20"
              fill="currentColor">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
            </svg>
          </MenuButton>

          <transition enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0">
            <MenuItems
              class="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-white/5 rounded-xl bg-[#13131F] border border-white/10 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden">
              <div class="py-1">
                <MenuItem v-slot="{ active }">
                <button @click="router.push({ name: 'app.dashboard' })" :class="[
                  active ? 'bg-white/10 text-white' : 'text-gray-300',
                  'group flex w-full items-center px-4 py-3 text-sm transition-colors font-medium',
                ]">
                  <HomeIcon class="mr-3 h-5 w-5 text-[#FFD700]" aria-hidden="true" />
                  {{ $t('MENU.dashboard') }}
                </button>
                </MenuItem>

                <MenuItem v-slot="{ active }">
                <button @click="router.push({ name: 'app.profile' })" :class="[
                  active ? 'bg-white/10 text-white' : 'text-gray-300',
                  'group flex w-full items-center px-4 py-3 text-sm transition-colors font-medium',
                ]">
                  <UserIcon class="mr-3 h-5 w-5 text-[#FFD700]" aria-hidden="true" />
                  {{ $t('profile') }}
                </button>
                </MenuItem>
              </div>

              <div class="py-1">
                <MenuItem v-slot="{ active }">
                <button @click="store.dispatch('logout').then(() => router.push({ name: 'login' }))" :class="[
                  active ? 'bg-red-500/20 text-red-500' : 'text-gray-400',
                  'group flex w-full items-center px-4 py-3 text-sm transition-colors font-medium',
                ]">
                  <ArrowLeftOnRectangleIcon class="mr-3 h-5 w-5" aria-hidden="true" />
                  {{ $t('logout') }}
                </button>
                </MenuItem>
              </div>
            </MenuItems>
          </transition>
        </Menu>
      </div>
    </div>

    <!-- Main Content -->
    <div class="p-6 md:p-8 flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-88px)] overflow-y-auto lg:overflow-hidden">
      <!-- Left: Products Section -->
      <div class="flex-1 flex flex-col lg:overflow-hidden min-h-[500px] lg:min-h-0">
        <!-- Title & Subtitle -->
        <div class="mb-6">
          <h2 class="text-2xl font-bold mb-1">
            {{ $t("Luxury_product_catalog") }}
          </h2>
          <p class="text-gray-400 text-sm">
            {{ $t("Select_the_perfect_wood_for_your_project") }}
          </p>
        </div>

        <!-- Search is hidden in the design image but good to keep if needed, maybe cleaner -->
        <!-- <div class="mb-6"> ... </div> -->

        <!-- Scrollable Grid -->
        <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
            <ProductCard v-for="product in products" :key="product._id" :product="product" @add-to-cart="addToCart" />
          </div>
        </div>
      </div>

      <!-- Right: Cart / Order Summary -->
      <div class="w-full lg:w-[400px] flex flex-col gap-4">
        <div
          class="bg-[#13131F] rounded-2xl p-6 flex flex-col h-full border border-white/5 shadow-2xl relative overflow-hidden">
          <!-- Header -->
          <div class="flex justify-between items-center mb-6">
            <h3 class="font-bold text-lg">{{ $t("BUTTON.your_selection") }}</h3>

            <span class="bg-[#FFD700] text-black text-xs font-bold px-2 py-1 rounded-full">
              {{ cart.length }} {{ $t("BUTTON.item") }}
            </span>
          </div>

          <!-- Customer Name Input -->
          <div class="relative mb-6">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" viewBox="0 0 20 20"
                fill="currentColor">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
              </svg>
            </div>
            <input id="customer-name" name="customer" type="text" v-model="customer" required
              class="block w-full pl-10 pr-3 py-3 bg-[#1C1C28] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent transition-all duration-200 shadow-inner sm:text-sm"
              :placeholder="$t('TABLE.customer') || 'Customer Name'" />
          </div>

          <!-- Empty State -->
          <div v-if="cart.length === 0"
            class="flex-1 flex flex-col justify-center items-center border-2 border-dashed border-gray-700 rounded-xl p-8 text-center bg-white/5">
            <div class="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p class="text-gray-400 text-sm max-w-[200px]">
              {{ $t("No_items_selected_yet") }} <br />
              {{ $t("Please_select_products_from_the_catalog") }}
            </p>
          </div>

          <!-- Cart Items List -->
          <div v-else class="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
            <div v-for="item in cart" :key="item._id" class="bg-[#1C1C28] p-3 rounded-lg flex gap-3 group relative">
              <!-- Image thumb -->
              <div class="w-16 h-16 bg-gray-800 rounded-md overflow-hidden flex-shrink-0">
                <img :src="item.image" class="w-full h-full object-cover" />
              </div>

              <div class="flex-1 flex flex-col justify-between">
                <div class="flex justify-between items-start">
                  <div>
                    <h4 class="font-bold text-sm text-white">
                      {{ item.type_of_wood_Object?.name }}
                    </h4>
                    <p class="text-xs text-gray-400">
                      {{ item.length_of_wood_Object?.name }}
                    </p>
                  </div>
                  <p class="font-bold text-[#FFD700]">
                    ${{ (item.price_of_each * item.quantity).toFixed(2) }}
                  </p>
                </div>

                <div class="flex justify-between items-center mt-2">
                  <div class="flex items-center bg-[#2C2C3A] rounded overflow-hidden">
                    <button @click="decreaseQty(item)" class="px-2 py-1 hover:bg-gray-600 transition text-xs">
                      -
                    </button>
                    <span class="text-xs px-2 min-w-[20px] text-center">{{
                      item.quantity
                    }}</span>
                    <button @click="increaseQty(item)" class="px-2 py-1 hover:bg-gray-600 transition text-xs">
                      +
                    </button>
                  </div>

                  <!-- Discount Input (Small) -->
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-500">{{ $t("FORM.discount_short") }}:</span>
                    <input type="number" v-model="item.discount" min="0"
                      class="w-16 bg-[#2C2C3A] border border-gray-700 rounded text-xs px-2 py-1 text-right text-white focus:outline-none focus:border-[#FFD700]" />
                  </div>
                </div>

                <!-- Price Breakdown if Discounted -->
                <div v-if="item.discount > 0"
                  class="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                  <span class="text-xs text-gray-400">Final:</span>
                  <span class="text-sm font-bold text-[#FFD700]">
                    ${{
                      Math.max(
                        0,
                        item.price_of_each * item.quantity - item.discount
                      ).toFixed(2)
                    }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Area -->
          <div class="mt-auto pt-6 border-t border-white/10">
            <div class="flex justify-between items-center mb-2 text-gray-400 text-sm">
              <span>{{ $t("BUTTON.total") }}</span>
              <span class="text-white text-xl font-bold">${{ total.toFixed(2) }}</span>
            </div>

            <button @click="completeOrder" :disabled="cart.length === 0"
              class="w-full bg-[#2C2C3A] hover:bg-[#363645] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl mt-4 transition-all flex items-center justify-center gap-2">
              <span>{{ $t("BUTTON.complete_purchase") }}</span>
            </button>
          </div>
        </div>

        <!-- Settings/Additional Actions (Bottom right icon in design) -->
        <div class="flex justify-end">
          <button @click="toggleLang"
            class="w-12 h-12 rounded-full bg-[#13131F] flex items-center justify-center hover:bg-[#1C1C28] transition text-[#FFD700]"
            :title="locale === 'en' ? 'Switch to Khmer' : 'Switch to English'">
            <!-- Globe Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <!-- Optional: Language Code Indicator -->
            <span
              class="absolute -top-1 -right-1 bg-[#FFD700] text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {{ locale === "en" ? "EN" : "KH" }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
