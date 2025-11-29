<script setup>
import { computed, onMounted, ref } from "vue";
import store from "../../store";
import ProductCard from "./ProductCard.vue";
import { PRODUCTS_PER_PAGE } from "../../constants";

const perPage = ref(PRODUCTS_PER_PAGE);
const search = ref("");
const products = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const pageSize = ref(15);
const isLoadingProduct = ref(false);

// 🟡 CART
const cart = ref([]);

// Add product to cart
function addToCart(product) {
  const existing = cart.value.find(
    (item) =>
      item?.type_of_wood_Object.name === product.type_of_wood_Object.name &&
      item?.cost_of_each === product.cost_of_each
  );

  if (existing) {
    existing.qty += 1; // increase quantity
  } else {
    cart.value.push({ ...product, qty: 1 });
  }
}

function increaseQty(item) {
  item.qty += 1;
}

function decreaseQty(item) {
  if (item.qty > 1) {
    item.qty -= 1;
  } else {
    // remove item when qty = 0
    cart.value = cart.value.filter((i) => i !== item);
  }
}

// Computed totals
const subtotal = computed(() =>
  cart.value.reduce((sum, p) => sum + Number(p.cost_of_each || 0) * p.qty, 0)
);

const tax = computed(() => subtotal.value); //* 0.075
const total = computed(() => subtotal.value + tax.value);

onMounted(async () => {
  try {
    await Promise.all([getProducts()]);
  } catch (error) {
    console.error("Error during initialization:", error);
  }
});

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
</script>

<template>
  <div class="bg-[#0e0b16] text-white min-h-screen flex justify-center">
    <div class="container mx-auto flex gap-10 py-8">
      <!-- LEFT SIDE -->
      <div class="flex-1">
        <!-- Header -->
        <div class="flex justify-between items-center mb-10 h-20 px-4">
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 border-2 border-gray-400 flex items-center justify-center rounded-full shadow-lg bg-transparent overflow-hidden"
            >
              <img
                src="../../assets/my-logo.png"
                alt="Logo"
                class="w-12 h-12 object-contain"
              />
            </div>

            <h1 class="text-3xl font-extrabold tracking-wide text-yellow-400">
              WOOD
            </h1>
          </div>

          <div class="flex items-center gap-4">
            <p class="text-gray-400">
              Welcome,
              <span class="text-yellow-400 font-semibold">Victoria</span>
            </p>
          </div>
        </div>

        <!-- Search -->
        <div class="mb-8">
          <input
            type="text"
            placeholder="Search our luxury collection..."
            class="block w-full px-6 py-3 rounded-xl shadow-inner focus:ring-2 focus:ring-yellow-400 text-gray-700 bg-white"
          />
        </div>

        <!-- Product cards -->
        <div class="max-h-[700px] overflow-y-auto">
          <div class="grid grid-cols-4 gap-6">
            <!-- ProductCard Emits Full Product -->
            <ProductCard
              v-for="product in products"
              :key="product._id"
              :product="product"
              @add-to-cart="addToCart"
            />
          </div>
        </div>
      </div>

      <!-- RIGHT SIDE (Cart Drawer) -->
      <div class="w-80 border-l border-yellow-500/40 pl-6">
        <h2 class="font-semibold text-lg mb-6">
          Your Selection
          <span class="ml-2 text-yellow-400"> ({{ cart.length }} items) </span>
        </h2>

        <!-- Cart Items -->
        <div class="space-y-4" v-if="cart.length > 0">
          <div
            v-for="item in cart"
            :key="item.name"
            class="flex justify-between items-center"
          >
            <div>
              <p class="font-semibold">{{ item.type_of_wood_Object.name }}</p>
              <p class="text-yellow-400">
                ${{ (item.cost_of_each * item.qty).toFixed(2) }}
              </p>
            </div>

            <!-- Quantity Controls -->
            <div class="flex items-center gap-2">
              <button
                class="w-7 h-7 rounded bg-gray-700 hover:bg-gray-600"
                @click="decreaseQty(item)"
              >
                −
              </button>

              <span class="w-6 text-center">{{ item.qty }}</span>

              <button
                class="w-7 h-7 rounded bg-yellow-400 text-black font-bold hover:bg-yellow-300"
                @click="increaseQty(item)"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <p v-else class="text-gray-500">No items added yet.</p>

        <!-- Totals -->
        <div
          class="mt-8 space-y-2 border-t border-gray-700 pt-4"
          v-if="cart.length > 0"
        >
          <div class="flex justify-between text-gray-400">
            <p>Subtotal:</p>
            <p>${{ subtotal.toFixed(2) }}</p>
          </div>
          <!-- <div class="flex justify-between text-gray-400">
            <p>Tax (7.5%):</p>
            <p>${{ tax.toFixed(2) }}</p>
          </div> -->
          <div class="flex justify-between font-bold text-yellow-400 text-xl">
            <p>Total:</p>
            <p>${{ total.toFixed(2) }}</p>
          </div>
        </div>

        <!-- Purchase Button -->
        <button
          class="mt-6 w-full bg-yellow-400 text-black font-semibold py-3 rounded-lg hover:bg-yellow-300 transition"
          v-if="cart.length > 0"
        >
          Complete Purchase
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
