<script setup>
import { onMounted, ref, computed } from "vue";
import store from "../store";
import dayjs from "dayjs";

const listProduct = ref([]);
const listOrder = ref([]);
const listHistory = ref([]);
const startDate = ref(dayjs().format("YYYY-MM-DD"));
const endDate = ref(dayjs().format("YYYY-MM-DD"));
const isLoadingProduct = ref(false);
const isLoadingOrder = ref(false);
const isLoadingHistory = ref(false);
const isModalOpen = ref(false);
const objDetail = ref(null);
const dashboardData = ref(null);

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
  isLoadingProduct.value = true;
  try {
    const res = await store.dispatch("getDashboard");
    dashboardData.value = res?.data;
  } catch (error) {
    console.log(error);
  } finally {
    isLoadingProduct.value = false;
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
  <div class="p-6 rounded-xl min-h-screen text-gray-100">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Total Products -->
      <div
        class="bg-white rounded-lg p-6 border border-[#9A6A3A] hover:border-yellow-500/50 transition"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm">
              {{ $t("DASHBOARD.total_product") }}
            </p>
            <p class="text-3xl font-bold mt-2 text-black">
              {{ dashboardData?.total_products }}
            </p>
          </div>
          <div class="text-yellow-400 text-4xl opacity-70">
            <!-- You can replace with an icon library like Heroicons or FontAwesome -->
            📦
          </div>
        </div>
      </div>

      <!-- Orders Today -->
      <div
        class="bg-white rounded-lg p-6 border border-[#9A6A3A] hover:border-yellow-500/50 transition"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm">
              {{ $t("DASHBOARD.order_today") }}
            </p>
            <p class="text-3xl font-bold mt-2 text-black">
              {{ dashboardData?.orders_today }}
            </p>
          </div>
          <div class="text-yellow-400 text-4xl opacity-70">🛒</div>
        </div>
      </div>

      <!-- Total Income -->
      <div
        class="bg-white rounded-lg p-6 border border-[#9A6A3A] hover:border-yellow-500/50 transition"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm">
              {{ $t("DASHBOARD.income_today") }}
            </p>
            <p class="text-3xl font-bold mt-2 text-green-400">
              ${{ dashboardData?.total_profit?.toFixed(2) }}
            </p>
          </div>
          <div class="text-green-400 text-4xl opacity-70">↑</div>
        </div>
      </div>

      <!-- Total Expenses -->
      <div
        class="bg-white rounded-lg p-6 border border-[#9A6A3A] hover:border-yellow-500/50 transition"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm">
              {{ $t("DASHBOARD.expense_today") }}
            </p>
            <p class="text-3xl font-bold mt-2 text-red-400">
              ${{ dashboardData?.expense_today?.toFixed(2) }}
            </p>
          </div>
          <div class="text-red-400 text-4xl opacity-70">↓</div>
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
                {{ dayjs(history.created_date).format("DD/MM/YYYY - hh:mm A") }}
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
            -->
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
