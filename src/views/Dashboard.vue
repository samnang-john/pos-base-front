<script setup>
import { onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import store from "../store";
import dayjs from "dayjs";
import {
  CubeIcon,
  ShoppingCartIcon,
  BanknotesIcon,
  ArrowTrendingDownIcon,
  ArrowUpRightIcon,
  ScaleIcon,
} from "@heroicons/vue/24/outline";

const router = useRouter();
const listProduct = ref([]);
const listOrder = ref([]);
const listHistory = ref([]);
const startDate = ref(dayjs().format("YYYY-MM-DD"));
const endDate = ref(dayjs().format("YYYY-MM-DD"));
const isLoadingProduct = ref(false);
const isLoadingDashboard = ref(false);
const isLoadingOrder = ref(false);
const isLoadingHistory = ref(false);
const isModalOpen = ref(false);
const objDetail = ref(null);
const dashboardData = ref(null); 

const overview = computed(() => dashboardData.value?.data || dashboardData.value || {});

// Computed totals
const subtotal = computed(() =>
  listOrder.value.reduce((sum, p) => sum + Number(p.grand_total || 0), 0)
);

onMounted(async () => {
  try {
    await Promise.all([getDasboard(), getOrders(), getStockInHistory()]);
  } catch (error) {
    console.error("Error during initialization:", error);
  }
});

const getDasboard = async () => {
  isLoadingDashboard.value = true;
  try {
    const res = await store.dispatch("getDashboard");
    dashboardData.value = res?.data || res;
  } catch (error) {
    console.log(error);
  } finally {
    isLoadingDashboard.value = false;
  }
};

// const getProducts = async (page = 1) => {
//   isLoadingProduct.value = true;
//   try {
//     const res = await store.dispatch("getProducts");

//     listProduct.value = res.data.items || [];
//   } catch (error) {
//     console.log(error);
//   } finally {
//     isLoadingProduct.value = false;
//   }
// };

const getOrders = async (page = 1) => {
  isLoadingOrder.value = true;
  try {
    const res = await store.dispatch("getOrders", {
      startDate: startDate.value,
      endDate: endDate.value,
    });
    listOrder.value = res.data.items || [];
  } catch (error) {
    console.log(error);
  } finally {
    isLoadingOrder.value = false;
  }
};

const getStockInHistory = async (page = 1) => {
  isLoadingHistory.value = true;
  try {
    const res = await store.dispatch("getStockInHistory", {
      startDate: startDate.value,
      endDate: endDate.value,
    });

    listHistory.value = res.data.items || [];
  } catch (error) {
    console.log(error);
  } finally {
    isLoadingHistory.value = false;
  }
};

const openModal = (orderItem) => {
  objDetail.value = orderItem;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;

  isUpdate.value = false;
};
</script>

<template>
  <div class="p-6 rounded-xl min-h-screen text-gray-800">
    <!-- Top Row: Modern KPI Metric Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- 1. Total Products -->
      <div
        @click="router.push({ name: 'app.product' })"
        class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <p class="text-xs font-bold uppercase tracking-wider text-gray-500">
              {{ $t("DASHBOARD.total_product") }}
            </p>
            <div v-if="isLoadingDashboard" class="h-9 w-24 bg-gray-100 rounded-lg animate-pulse mt-3"></div>
            <h3 v-else class="text-3xl font-extrabold text-gray-900 tracking-tight mt-3">
              {{ overview.total_products ?? 0 }}
            </h3>
          </div>
          <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0 shadow-xs">
            <CubeIcon class="w-6 h-6" />
          </div>
        </div>

<div class="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
  <span class="font-medium text-blue-600 group-hover:underline flex items-center gap-1">
    {{ $t("DASHBOARD.view_catalog") }}
    <ArrowUpRightIcon class="w-3.5 h-3.5" />
  </span>
  <template v-if="overview.total_stock_qty !== undefined || overview.total_stock_cube !== undefined">
    <div class="flex space-x-2">
      <span v-if="overview.total_stock_qty !== undefined" class="text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-md">
        {{ overview.total_stock_qty }} pcs
      </span>
      <span v-if="overview.total_stock_cube !== undefined" class="text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-md">
        {{ overview.total_stock_cube }} m³
      </span>
    </div>
  </template>
  <template v-else>
    <span class="text-gray-400 font-medium">{{ $t("DASHBOARD.inventory") }}</span>
  </template>
</div>
      </div>

      <!-- 2. Orders Today -->
      <div
        @click="router.push({ name: 'app.order' })"
        class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <p class="text-xs font-bold uppercase tracking-wider text-gray-500">
              {{ $t("DASHBOARD.order_today") }}
            </p>
            <div v-if="isLoadingDashboard" class="h-9 w-24 bg-gray-100 rounded-lg animate-pulse mt-3"></div>
            <h3 v-else class="text-3xl font-extrabold text-gray-900 tracking-tight mt-3">
              {{ overview.orders_today ?? 0 }}
            </h3>
          </div>
          <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0 shadow-xs">
            <ShoppingCartIcon class="w-6 h-6" />
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
          <span class="font-medium text-amber-600 group-hover:underline flex items-center gap-1">
            {{ $t("DASHBOARD.view_orders") }}
            <ArrowUpRightIcon class="w-3.5 h-3.5" />
          </span>
          <span v-if="overview.total_sale_cube !== undefined || overview.total_cube_sale !== undefined" class="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md">
            {{ overview.total_sale_qty !== undefined ? overview.total_sale_qty + ' pcs' : '' }}
          {{ overview.total_sale_cube ?? overview.total_cube_sale }} m³
          </span>
          <span v-else class="text-gray-400 font-medium">{{ $t("DASHBOARD.today") }}</span>
        </div>
      </div>

      <!-- 3. Total Income (Today) -->
      <div
        class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-200 group flex flex-col justify-between"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <p class="text-xs font-bold uppercase tracking-wider text-gray-500">
              {{ $t("DASHBOARD.income_today") }}
            </p>
            <div v-if="isLoadingDashboard" class="h-9 w-32 bg-gray-100 rounded-lg animate-pulse mt-3"></div>
            <h3 v-else class="text-3xl font-extrabold text-emerald-600 tracking-tight mt-3">
              ${{ Number(overview.income_today ?? overview.total_revenue ?? 0).toFixed(2) }}
            </h3>
          </div>
          <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0 shadow-xs">
            <BanknotesIcon class="w-6 h-6" />
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
          <span class="inline-flex items-center text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-md">
            {{ $t("DASHBOARD.revenue") }}
          </span>
          <span
            v-if="overview.total_profit !== undefined"
            class="font-semibold"
            :class="Number(overview.total_profit) >= 0 ? 'text-emerald-600' : 'text-rose-600'"
            :title="$t('DASHBOARD.net_profit')"
          >
            {{ $t("DASHBOARD.net") }}: ${{ Number(overview.total_profit).toFixed(2) }}
          </span>
        </div>
      </div>

      <!-- 4. Total Expenses (Today) -->
      <div
        @click="router.push({ name: 'app.stockinhistory' })"
        class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-rose-200 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <p class="text-xs font-bold uppercase tracking-wider text-gray-500">
              {{ $t("DASHBOARD.expense_today") }}
            </p>
            <div v-if="isLoadingDashboard" class="h-9 w-32 bg-gray-100 rounded-lg animate-pulse mt-3"></div>
            <h3 v-else class="text-3xl font-extrabold text-rose-600 tracking-tight mt-3">
              ${{ Number(overview.expense_today ?? 0).toFixed(2) }}
            </h3>
          </div>
          <div class="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0 shadow-xs">
            <ArrowTrendingDownIcon class="w-6 h-6" />
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
          <span class="font-medium text-rose-600 group-hover:underline flex items-center gap-1">
            {{ $t("DASHBOARD.view_history") }}
            <ArrowUpRightIcon class="w-3.5 h-3.5" />
          </span>
          <span class="text-gray-400 font-medium">{{ $t("DASHBOARD.today") }}</span>
        </div>
      </div>
    </div>

    <!-- Optional: Quick stats for today -->
    <div class="mt-10 bg-white rounded-lg p-6 border border-[#9A6A3A]">
      <h2 class="text-xl font-semibold mb-4 text-[#9A6A3A]">
        {{ $t("DASHBOARD.today_order") }}
      </h2>

      <!-- Orders Table -->
      <div class="overflow-x-auto rounded-lg border border-gray-200">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-4 py-4 text-left font-semibold text-gray-900 sm:px-6"
              >
                {{ $t("TABLE.no") }}
              </th>
              <th class="px-4 py-4 text-left font-semibold text-gray-900">
                {{ $t("TABLE.order_id") }}
              </th>
              <th class="px-4 py-4 text-left font-semibold text-gray-900">
                {{ $t("TABLE.item") }}
              </th>
              <th class="px-4 py-4 text-left font-semibold text-gray-900">
                {{ $t("TABLE.created_date") }}
              </th>
              <th class="px-4 py-4 text-left font-semibold text-gray-900">
                {{ $t("TABLE.total") }}
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-200 bg-white">
            <!-- Loading / Empty State -->
            <tr v-if="isLoadingOrder || !listOrder.length">
              <td colspan="5" class="py-12 text-center text-gray-500">
                <Spinner v-if="isLoadingOrder" class="mx-auto h-8 w-8" />
                <p v-else>{{ $t("DASHBOARD.no_orders") }}</p>
              </td>
            </tr>

            <!-- Order Rows -->
            <tr
              v-else
              v-for="(order, index) in listOrder"     
              :key="order._id"
              class="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
            >
              <td class="px-4 py-4 font-medium text-gray-700 sm:px-6">
                {{ String(index + 1).padStart(2, "0") }}
              </td>

              <td class="px-4 py-4 text-gray-900 truncate max-w-xs">
                {{ order.order_number }}
              </td>

              <td class="px-4 py-4 text-gray-900">
                x{{ order.items?.length }}
              </td>

              <td class="px-4 py-4 text-gray-900">
                {{ dayjs(order.order_date).format("DD/MM/YYYY - hh:mm A") }}
              </td>

              <td class="px-4 py-4 text-gray-900">${{ order.grand_total }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Optional: Quick stats for today -->
    <div class="mt-10 bg-white rounded-lg p-6 border border-[#9A6A3A]">
      <h2 class="text-xl font-semibold mb-4 text-[#9A6A3A]">
        {{ $t("DASHBOARD.today_stock_in") }}
      </h2>

      <!-- Orders Table -->
      <div class="overflow-x-auto rounded-lg border border-gray-200">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-4 py-4 text-left font-semibold text-gray-900 sm:px-6"
              >
                {{ $t("TABLE.no") }}
              </th>
              <th class="px-4 py-4 text-left font-semibold text-gray-900">
                {{ $t("TABLE.sync_invoice") }}
              </th>
              <th class="px-4 py-4 text-left font-semibold text-gray-900">
                {{ $t("TABLE.item") }}
              </th>
              <th class="px-4 py-4 text-left font-semibold text-gray-900">
                {{ $t("TABLE.created_date") }}
              </th>
              <!-- <th class="px-4 py-4 text-left font-semibold text-gray-900">
                Total Price
              </th> -->
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-200 bg-white">
            <!-- Loading / Empty State -->
            <tr v-if="isLoadingHistory || !listHistory.length">
              <td colspan="5" class="py-12 text-center text-gray-500">
                <Spinner v-if="isLoadingHistory" class="mx-auto h-8 w-8" />
                <p v-else>{{ $t("DASHBOARD.no_stock_in") }}</p>
              </td>
            </tr>

            <!-- Order Rows -->
            <tr
              v-else
              v-for="(history, index) in listHistory"
              :key="history._id"
              class="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
              @click="openModal(history)"
            >
              <td class="px-4 py-4 font-medium text-gray-700 sm:px-6">
                {{ String(index + 1).padStart(2, "0") }}
              </td>

              <td class="px-4 py-4 text-gray-900 truncate max-w-xs">
                {{ history.sync_invoice }}
              </td>

              <td class="px-4 py-4 text-gray-900">
                x{{ history?.total_items }}
              </td>

              <td class="px-4 py-4 text-gray-900">
                {{ dayjs(history.createdAt).format("DD/MM/YYYY - hh:mm A") }}
              </td>

              <!-- <td class="px-4 py-4 text-gray-900">${{ order.grand_total }}</td> -->
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center"
      style="background-color: rgba(0, 0, 0, 0.4)"
      @click="closeModal"
    >
      <div
        class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md"
        @click.stop
      >
        <h2 class="text-lg font-bold text-[#9A6A3A] mb-4">
          {{ $t("MODAL.order_detail") }}
        </h2>

        <!-- First Row -->
        <div class="flex justify-around mb-4">
          <div class="text-center">
            <p class="text-sm text-gray-600">{{ $t("TABLE.order_id") }}</p>
            <p class="text-md font-bold text-gray-900">
              {{ objDetail["order_number"] }}
            </p>
          </div>
          <div class="text-center">
            <p class="text-sm text-gray-600">{{ $t("TABLE.created_date") }}</p>
            <p class="text-md font-bold text-gray-900">
              {{
                dayjs(objDetail["order_date"]).format("DD/MM/YYYY - hh:mm A")
              }}
            </p>
          </div>
        </div>

        <!-- Second Row -->
        <div class="flex justify-around mb-4">
          <div class="text-center">
            <p class="text-sm text-gray-600">{{ $t("TABLE.customer") }}</p>
            <p class="text-md font-bold text-gray-900">
              {{ objDetail["customer"] || "N/A" }}
            </p>
          </div>
          <div class="text-center">
            <p class="text-sm text-gray-600">
              {{ $t("TABLE.payment_status") }}
            </p>
            <p class="text-md font-bold text-gray-900">
              {{ objDetail["payment_status"] }}
            </p>
          </div>
        </div>

        <!-- Order Items (looped) -->
        <div class="border-t border-gray-200 pt-4">
          <h3 class="text-md font-semibold text-gray-800">
            {{ $t("TABLE.item") }}
          </h3>

          <div
            v-for="item in objDetail['items']"
            :key="item._id"
            class="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0"
          >
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900">
                {{ item.product_name || item.product_id }}
                <!-- Adjust key if needed -->
              </p>
              <p class="text-xs text-gray-500">
                {{ $t("TABLE.qty") }}: {{ item.quantity }} × ${{ item.price }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-md font-bold text-gray-900">
                ${{ (item.quantity * item.price).toFixed(2) }}
              </p>
            </div>
          </div>

          <!-- Optional: Total -->
          <div class="flex justify-end mt-4">
            <p class="text-lg font-bold text-gray-900">
              {{ $t("TABLE.total") }}: ${{
                objDetail["grand_total"].toFixed(2)
              }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
