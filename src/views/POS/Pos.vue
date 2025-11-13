<template>
    <div class="bg-[#0e0b16] text-white min-h-screen flex justify-center">

        <div class="container mx-auto flex gap-10 py-8">

            <!-- LEFT SIDE -->
            <div class="flex-1">
                <!-- Header -->
                <div class="flex justify-between items-center mb-10 h-20 px-4">
                    <!-- Left: Logo + Brand -->
                    <div class="flex items-center gap-3">
                        <!-- Logo circle -->
                        <div
                            class="w-12 h-12 border-2 border-gray-400 flex items-center justify-center rounded-full shadow-lg bg-transparent overflow-hidden">
                            <img src="../../assets/my-logo.png" alt="Logo" class="w-12 h-12 object-contain" />
                        </div>
                        <!-- Brand name -->
                        <h1 class="text-3xl font-extrabold tracking-wide text-yellow-400 drop-shadow-sm">
                            WOOD
                        </h1>
                    </div>

                    <!-- Right: User + Settings -->
                    <div class="flex items-center gap-4">
                        <p class="text-gray-400">
                            Welcome, <span class="text-yellow-400 font-semibold">Victoria</span>
                        </p>
                        <button
                            class="text-sm border border-yellow-400 rounded-lg px-3 py-1 hover:bg-yellow-400 hover:text-black transition">
                            ⚙ Settings
                        </button>
                    </div>
                </div>


                <!-- Search -->
                <div class="mb-8">
                    <input type="text" placeholder="Search our luxury collection..."
                        class="block w-full px-6 py-3 rounded-xl text-black shadow-inner focus:ring-2 focus:ring-yellow-400 text-gray-700 bg-white" />
                </div>

                <!-- Category filters -->
                <div class="flex gap-8 mb-10 border-b border-gray-700 pb-2">
                    <button class="text-yellow-400 border-b-2 border-yellow-400 pb-1">All Collections</button>
                    <button class="text-gray-400 hover:text-yellow-400">Jewelry</button>
                    <button class="text-gray-400 hover:text-yellow-400">Watches</button>
                    <button class="text-gray-400 hover:text-yellow-400">Fashion</button>
                    <button class="text-gray-400 hover:text-yellow-400">Spirits</button>
                </div>

                <!-- Product cards -->
                <div class="max-h-[700px] overflow-y-auto">
  <div class="grid grid-cols-4 gap-6">
    <ProductCard
      v-for="product in products.data"
      :key="product?._id"
      :name="product?.name"
      :description="product?.description"
      :price="product?.price"
      :image="product?.image"
      :isNew="product?.isNew"
      @add-to-cart="addToCart(product)"
    />
  </div>
</div>

            </div>

            <!-- RIGHT SIDE (Cart Drawer) -->
            <div class="w-80 border-l border-yellow-500/40 pl-6">
                <h2 class="font-semibold text-lg mb-6">Your Selection <span class="ml-2 text-yellow-400">(3
                        items)</span>
                </h2>

                <div class="space-y-4">
                    <div class="flex justify-between">
                        <p>Royal Chrono</p>
                        <span class="text-yellow-400">$12,499</span>
                    </div>
                    <div class="flex justify-between">
                        <p>Diamond Eternity</p>
                        <span class="text-yellow-400">$89,999</span>
                    </div>
                    <div class="flex justify-between">
                        <p>Macallan 50yr x2</p>
                        <span class="text-yellow-400">$76,000</span>
                    </div>
                </div>

                <!-- Totals -->
                <div class="mt-8 space-y-2 border-t border-gray-700 pt-4">
                    <div class="flex justify-between text-gray-400">
                        <p>Subtotal:</p>
                        <p>$178,498</p>
                    </div>
                    <div class="flex justify-between text-gray-400">
                        <p>Tax (7.5%):</p>
                        <p>$13,387</p>
                    </div>
                    <div class="flex justify-between font-bold text-yellow-400 text-xl">
                        <p>Total:</p>
                        <p>$191,885</p>
                    </div>
                </div>

                <!-- Button -->
                <button
                    class="mt-6 w-full bg-yellow-400 text-black font-semibold py-3 rounded-lg hover:bg-yellow-300 transition">
                    Complete Purchase
                </button>
            </div>
        </div>

    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import store from '../../store';
import ProductCard from './ProductCard.vue';
import { PRODUCTS_PER_PAGE } from '../../constants';

const perPage = ref(PRODUCTS_PER_PAGE);
const search = ref('');
const products = computed(() => store.state.products);
const sortField = ref('updated_date');
const sortDirection = ref('desc')

console.log("Products from store:", products.value);

onMounted(() => {
  getProducts();

  // wait for Vuex to update
  setTimeout(() => {
    console.log("Products after fetch:", products.value);
  }, 500);
})


function addToCart(product) {
    console.log("function click", product);
}

function getProducts(url = null) {
  store.dispatch("getProducts", {
    url,
    search: search.value,
    per_page: perPage.value,
    sort_field: sortField.value,
    sort_direction: sortDirection.value
  });
}

</script>

<style scoped></style>