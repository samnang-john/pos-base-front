<script setup>
import { computed, onMounted, ref } from "vue";
import store from "../../store";
import ProductCard from "./ProductCard.vue";
import { PRODUCTS_PER_PAGE } from "../../constants";
import { toast } from "vue3-toastify";

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

// Add product to cart
function addToCart(product) {
  const existing = cart.value.find(
    (item) =>
      item?.type_of_wood_Object.name === product.type_of_wood_Object.name &&
      item?.cost_of_each === product.cost_of_each
  );

  if (existing) {
    existing.quantity += 1; // increase quantity
  } else {
    cart.value.push({ ...product, quantity: 1, product_id: product?._id });
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
    (sum, p) => sum + Number(p.cost_of_each || 0) * p.quantity,
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

const completeStockIn = async () => {};
</script>

<template>
  <div class="text-white">
    <div class="">
      <div class="flex mb-4">
        <h1 class="text-3xl font-semibold text-black">Stock In</h1>
      </div>

      <!-- Main Layout: Products + Cart -->
      <div class="flex flex-col lg:flex-row gap-10">
        <!-- LEFT SIDE: Products -->
        <div class="flex-1 lg:order-1 order-2">
          <!-- Product cards -->
          <div class="">
            <div
              class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
            >
              <ProductCard
                v-for="product in products"
                :key="product._id"
                :product="product"
                @add-to-cart="addToCart"
              />
            </div>
          </div>
        </div>

        <!-- RIGHT SIDE: Cart (fixed width on large screens, full on small) -->
        <div
          class="w-full lg:w-80 lg:border-l border-yellow-500/40 lg:pl-6 lg:order-2 order-1"
        >
          <h2 class="font-semibold text-lg mb-6 text-black">
            Your Selection
            <span class="ml-2 text-[#986b41]"> ({{ cart.length }} items) </span>
          </h2>

          <!-- Cart Items -->
          <div class="space-y-4" v-if="cart.length > 0">
            <div
              v-for="item in cart"
              :key="item.name"
              class="flex justify-between items-center"
            >
              <div>
                <p class="font-semibold text-black">
                  {{
                    item.type_of_wood_Object.name +
                    " " +
                    item.end_grain_of_wood_Object.name +
                    " x " +
                    item.length_of_wood_Object.name
                  }}
                </p>
                <p class="text-[#986b41]">
                  ${{ item.cost_of_each.toFixed(2) }}
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

                <span class="w-6 text-center text-black">{{
                  item.quantity
                }}</span>

                <button
                  class="w-7 h-7 rounded bg-[#986b41] text-white font-bold hover:bg-[#B68E65]"
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
            <div class="flex justify-between font-bold text-[#B68E65] text-xl">
              <p>Total:</p>
              <p>${{ total.toFixed(2) }}</p>
            </div>
          </div>

          <!-- Purchase Button -->
          <button
            class="mt-6 w-full bg-[#986b41] text-white font-semibold py-3 rounded-lg hover:bg-[#B68E65] transition"
            v-if="cart.length > 0"
            @click="completeOrder()"
          >
            Complete Stock In
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
