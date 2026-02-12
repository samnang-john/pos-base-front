<script setup>
import { onMounted, ref } from "vue";
import store from "../../store";
import Spinner from "../../components/core/Spinner.vue";
import TableHeaderCell from "../../components/core/Table/TableHeaderCell.vue";
import { MagnifyingGlassIcon } from "@heroicons/vue/24/outline";
import "vue3-toastify/dist/index.css";
import { useRouter } from "vue-router";
import dayjs from "dayjs";
import { DocumentTextIcon } from "@heroicons/vue/24/solid";

const router = useRouter();
const listHistory = ref([]);
const search = ref("");
const isLoadingProduct = ref(false);
const isLoadingDetail = ref(false);
const currentPage = ref(1);
const totalPages = ref(1);
const pageSize = ref(15);
const isModalOpen = ref(false);
const objDetail = ref(null);
const totalPrice = ref("");
const startDate = ref(dayjs().format("YYYY-MM-DD"));
const endDate = ref(dayjs().format("YYYY-MM-DD"));

onMounted(async () => {
  try {
    await Promise.all([getStockInHistory()]);
  } catch (error) {
    console.error("Error during initialization:", error);
  }
});

const getStockInHistory = async (page = 1) => {
  isLoadingProduct.value = true;
  try {
    const res = await store.dispatch("getStockInHistory", {
      page,
      pageSize: pageSize.value,
      startDate: startDate.value,
      endDate: endDate.value,
    });

    listHistory.value = res.data.items || [];

    // save pagination
    currentPage.value = res?.data?.pagination?.currentPage;
    totalPages.value = res?.data?.pagination?.totalPages;
  } catch (error) {
    console.log(error);
  } finally {
    isLoadingProduct.value = false;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    getWoodTypes(currentPage.value + 1);
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    getWoodTypes(currentPage.value - 1);
  }
};

const openModal = (stockInID) => {
  isModalOpen.value = true;
  getStockInHistoryDetail(stockInID);
};

const getStockInHistoryDetail = async (stockInID) => {
  isLoadingDetail.value = true;
  try {
    const res = await store.dispatch("getStockInHistoryDetail", {
      stockInID: stockInID,
    });
    objDetail.value = res?.data;
    const total = res?.data.items.reduce(
      (sum, p) => sum + Number(p.product_id.cost_of_each || 0) * p.quantity,
      0
    );
    totalPrice.value = total;
  } catch (error) {
    console.log(error);
  } finally {
    isLoadingDetail.value = false;
  }
};

const closeModal = () => {
  isModalOpen.value = false;
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

const goBack = () => {
  router.back();
};

// Computed totals
// const subtotal = computed(() => {
//   console.log("ghghghgh", objDetail);
//   // objDetail.value.items.reduce(
//   //   (sum, p) => sum - p.discount + Number(p.price_of_each || 0) * p.quantity,
//   //   0
//   // )
// });

// const total = computed(() => subtotal.value);
</script>

<template>
  <!-- Main Header -->
  <div class="flex items-center gap-3 mb-3" @click="goBack">
    <!-- Back Button -->
    <button class="p-2 rounded-full hover:bg-gray-200 transition">
      <!-- Arrow Icon (Heroicons) -->
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
        class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </button>

    <!-- Title -->
    <h1 class="text-3xl font-semibold">{{ $t('MENU.stock_in_history') }}</h1>
  </div>

  <!-- Table List Items -->
  <div class="bg-white p-6 rounded-xl shadow-lg animate-fade-in-down">
    <!-- Header Section -->
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 mb-5 border-b border-gray-100">
      <div class="relative w-full md:w-auto">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
        </div>
        <input v-model="search" @change="getProducts(null)"
          class="block w-full md:w-64 pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
          :placeholder="$t('TABLE.search_wood_type')" />
      </div>

      <!-- Filters and Download Buttons -->
      <div class="flex flex-col lg:flex-row gap-4 w-full md:w-auto items-start lg:items-center">
        <!-- Date Range Filters -->
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex flex-col">
            <label for="startDate" class="text-sm font-medium text-gray-700 mb-1">{{ $t('TABLE.start_date') }}</label>
            <input id="startDate" v-model="startDate" @change="getStockInHistory" type="date"
              class="block w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm" />
          </div>
          <div class="flex flex-col">
            <label for="endDate" class="text-sm font-medium text-gray-700 mb-1">{{ $t('TABLE.end_date') }}</label>
            <input id="endDate" v-model="endDate" @change="getStockInHistory" type="date"
              class="block w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm" />
          </div>
        </div>
      </div>
    </div>

    <!-- Table Section -->
    <div class="overflow-x-auto rounded-lg border border-gray-100">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <!-- <TableHeaderCell
              field="id"
              class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
            >
              ID
            </TableHeaderCell> -->
            <TableHeaderCell field="title" class="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
              {{ $t('TABLE.sync_invoice') }}
            </TableHeaderCell>
            <TableHeaderCell field="title" class="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
              {{ $t('TABLE.item') }}
            </TableHeaderCell>
            <TableHeaderCell field="title" class="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
              {{ $t('TABLE.created_date') }}
            </TableHeaderCell>
            <TableHeaderCell field="title" class="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
              {{ $t('TABLE.note') }}
            </TableHeaderCell>
            <TableHeaderCell field="title" class="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
              {{ $t('TABLE.action') }}
            </TableHeaderCell>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-if="isLoadingProduct || !listHistory.length">
            <td colspan="8" class="px-3 py-6 text-sm text-gray-500 text-center">
              <Spinner v-if="isLoadingProduct" class="mx-auto" />
              <p v-else class="text-center py-8 text-gray-500">
                No wood type found
              </p>
            </td>
          </tr>
          <tr v-else v-for="(history, index) of listHistory" :key="history._id"
            class="animate-fade-in-down hover:bg-gray-50 transition-colors duration-150"
            :style="{ 'animation-delay': index * 0.05 + 's' }" @click="openModal(history._id)">
            <!-- <td
              class="whitespace-nowrap py-2 pl-2 pr-2 text-sm font-medium text-gray-700 sm:pl-6"
            >
              {{ history._id }}
            </td> -->

            <td class="whitespace-nowrap px-2 py-2 text-sm text-gray-900 max-w-xs truncate">
              {{ history.sync_invoice }}
            </td>
            <td class="whitespace-nowrap px-2 py-2 text-sm text-gray-900 max-w-xs truncate">
              {{ history.total_items }}
            </td>
            <td class="whitespace-nowrap px-2 py-2 text-sm text-gray-900 max-w-xs truncate">
              {{ dayjs(history.createdAt).format("DD/MM/YYYY - hh:MM A") }}
            </td>
            <td class="whitespace-nowrap px-2 py-2 text-sm text-gray-900 max-w-xs truncate">
              {{ history.note }}
            </td>
            <td class="whitespace-nowrap px-2 py-2 text-sm text-gray-900 max-w-xs truncate">
              <button @click="downloadPDF(history._id)"
                class="inline-flex items-center px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 shadow-sm">
                <DocumentTextIcon class="h-4 w-4 mr-2" />
                {{ $t('BUTTON.download_pdf') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="flex justify-between items-center py-4">
        <button @click="prevPage" :disabled="currentPage === 1"
          class="px-4 py-2 rounded-lg border bg-white disabled:opacity-40">
          {{ $t('BUTTON.previous') }}
        </button>

        <span class="text-gray-600">
          {{ $t('BUTTON.page') }} {{ currentPage }} {{ $t('BUTTON.of') }} {{ totalPages }}
        </span>

        <button @click="nextPage" :disabled="currentPage === totalPages"
          class="px-4 py-2 rounded-lg border bg-white disabled:opacity-40">
          {{ $t('BUTTON.next') }}
        </button>
      </div>
    </div>
  </div>

  <!-- Modal -->
  <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center"
    style="background-color: rgba(0, 0, 0, 0.4)" @click="closeModal">
    <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md" @click.stop>
      <h2 class="text-lg font-bold text-[#9A6A3A] mb-4">
        {{ $t('MODAL.stock_in_detail') }}
      </h2>
      <div v-if="isLoadingDetail">
        <Spinner v-if="isLoadingDetail" class="mx-auto" />
      </div>
      <div v-else>
        <!-- First Row -->
        <div class="flex justify-around mb-4">
          <div class="text-center">
            <p class="text-sm text-gray-600">{{ $t('TABLE.sync_invoice') }}</p>
            <p class="text-md font-bold text-gray-900">
              {{ objDetail["sync_invoice"] }}
            </p>
          </div>
          <div class="text-center">
            <p class="text-sm text-gray-600">{{ $t('TABLE.created_date') }}</p>
            <p class="text-md font-bold text-gray-900">
              {{ dayjs(objDetail["createdAt"]).format("DD/MM/YYYY - hh:mm A") }}
            </p>
          </div>
        </div>

        <!-- Second Row -->
        <div class="flex justify-around mb-4">
          <!-- <div class="text-center">
          <p class="text-sm text-gray-600">Customer</p>
          <p class="text-md font-bold text-gray-900">
            {{ "Supplier" }}
          </p>
        </div> -->
          <!-- <div class="text-center">
          <p class="text-sm text-gray-600">Payment Status</p>
          <p class="text-md font-bold text-gray-900">
            {{ objDetail["payment_status"] }}
          </p>
        </div> -->
        </div>

        <!-- Order Items (looped) -->
        <div class="border-t border-gray-200 pt-4">
          <h3 class="text-md font-semibold text-gray-800">{{ $t('TABLE.item') }}</h3>

          <div v-for="item in objDetail['items']" :key="item._id"
            class="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900">
                {{ item.product_id.type_of_wood_id.name || "" }}
              </p>
              <p class="text-xs text-gray-500">{{ $t('TABLE.qty') }}: {{ item.quantity }}</p>
              <!-- <p class="text-xs text-gray-500">Discount: ${{ item.discount }}</p> -->
            </div>
            <div class="text-right">
              <p class="text-md font-bold text-gray-900">
                ${{ item.product_id.cost_of_each.toFixed(2) * item.quantity }}
              </p>
            </div>
          </div>

          <!-- Optional: Total -->
          <!-- <div class="flex justify-end mt-4">
            <p class="text-md font-bold text-gray-900">
              Tax: ${{ objDetail["tax"] }}
            </p>
          </div> -->
          <div class="flex justify-end mt-2">
            <p class="text-lg font-bold text-gray-900">
              {{ $t('TABLE.total') }}: ${{ totalPrice.toFixed(2) }}
            </p>
          </div>
        </div>
        <div class="mt-6 flex justify-end">
          <button @click="downloadPDF(objDetail._id)"
            class="mt-2 inline-flex items-center px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 shadow-sm">
            <DocumentTextIcon class="h-4 w-4 mr-2" />
            {{ $t('TABLE.download_pdf') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom animations */
.animate-fade-in-down {
  animation: fadeInDown 0.5s ease-out;
}

@keyframes fadeInDown {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
