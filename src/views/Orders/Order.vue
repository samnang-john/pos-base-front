<script setup>
import { onMounted, ref, computed } from "vue";
import store from "../../store";
import Spinner from "../../components/core/Spinner.vue";
import TableHeaderCell from "../../components/core/Table/TableHeaderCell.vue";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import {
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  PrinterIcon,
  ShareIcon,
  ShoppingBagIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  BuildingStorefrontIcon,
  BanknotesIcon
} from "@heroicons/vue/24/outline";
import { DocumentIcon, DocumentTextIcon, CheckCircleIcon } from "@heroicons/vue/24/solid";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { useRouter } from "vue-router";
import dayjs from "dayjs";

const router = useRouter();
const listOrder = ref([]);
const search = ref("");
const isLoadingProduct = ref(false);
const startDate = ref(dayjs().format("YYYY-MM-DD"));
const endDate = ref(dayjs().format("YYYY-MM-DD"));
const currentPage = ref(1);
const totalPages = ref(1);
const pageSize = ref(15);
const isModalOpen = ref(false); // Control modal visibility
const isLoadingDetail = ref(false);
const woodTypeNameForm = ref({
  name: "",
  description: "",
});
const isUpdate = ref(false); // Control For Update
const isErrorValue = ref(false);
const objDetail = ref(null);

const currentUser = computed(() => store.state.user.data);

onMounted(async () => {
  try {
    await Promise.all([getOrders()]);
  } catch (error) {
    console.error("Error during initialization:", error);
  }
});

const getOrders = async (page = 1) => {
  isLoadingProduct.value = true;
  try {
    const res = await store.dispatch("getOrders", {
      page,
      pageSize: pageSize.value,
      startDate: startDate.value,
      endDate: endDate.value,
    });

    listOrder.value = res.data.items || [];

    // save pagination
    currentPage.value = res?.data?.pagination?.currentPage;
    totalPages.value = res?.data?.pagination?.totalPages;
  } catch (error) {
  } finally {
    isLoadingProduct.value = false;
  }
};

const downloadPDF = async () => {
  const res = await store.dispatch("getOrdersPDF", {
    startDate: startDate.value,
    endDate: endDate.value,
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

const downloadExcel = async () => {
  const res = await store.dispatch("getOrdersExcel", {
    startDate: startDate.value,
    endDate: endDate.value,
  });

  // Trigger download
  const url = window.URL.createObjectURL(res);
  const link = document.createElement("a");
  link.href = url;
  link.download = `orders-report-${new Date().toISOString().slice(0, 10)}.xlsx`; // .xlsx extension
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
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

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    getOrders(currentPage.value + 1);
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    getOrders(currentPage.value - 1);
  }
};

const openModal = async (orderItem) => {
  isModalOpen.value = true;
  isLoadingDetail.value = true;
  objDetail.value = null; // Reset input on open
  try {
    const res = await store.dispatch("getOrderDetail", orderItem._id);
    if (res && res.data) {
      objDetail.value = res.data;
    }
  } catch (error) {
    console.error(error);
  } finally {
    isLoadingDetail.value = false;
  }
};

const closeModal = () => {
  isModalOpen.value = false;
  woodTypeNameForm.value = {
    name: "",
    description: "",
  }; // Reset input on close
  isUpdate.value = false;
  // objEdit.value = null;
};
</script>

<template>
  <!-- Main Header -->
  <div class="flex items-center justify-between mb-3">
    <h1 class="text-3xl font-semibold">{{ $t("MENU.order") }}</h1>
    <!-- <button
      type="button"
      @click="onAddNew"
      class="py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#986b41] hover:bg-[#B68E65] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      Add New
    </button> -->
  </div>

  <!-- Table List Items -->
  <div class="bg-white p-6 rounded-xl shadow-lg animate-fade-in-down">
    <!-- Header Section -->
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-5 mb-5 border-b border-gray-100">
      <!-- Search Input -->
      <div class="relative w-full md:w-auto">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
        </div>
        <input v-model="search" @change="getOrders"
          class="block w-full md:w-64 pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
          :placeholder="$t('TABLE.search_wood_type')" />
      </div>

      <!-- Filters and Download Buttons -->
      <div class="flex flex-col lg:flex-row gap-4 w-full md:w-auto items-start lg:items-center">
        <!-- Date Range Filters -->
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex flex-col">
            <label for="startDate" class="text-sm font-medium text-gray-700 mb-1">{{ $t("TABLE.start_date") }}</label>
            <input id="startDate" v-model="startDate" @change="getOrders" type="date"
              class="block w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm" />
          </div>
          <div class="flex flex-col">
            <label for="endDate" class="text-sm font-medium text-gray-700 mb-1">{{ $t("TABLE.end_date") }}</label>
            <input id="endDate" v-model="endDate" @change="getOrders" type="date"
              class="block w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm" />
          </div>
        </div>

        <!-- Download Buttons -->
        <div class="flex gap-3 mt-4 lg:mt-0">
          <button @click="downloadPDF"
            class="inline-flex items-center px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 shadow-sm">
            <DocumentTextIcon class="h-4 w-4 mr-2" />
            {{ $t("TABLE.download_pdf") }}
          </button>
          <button @click="downloadExcel"
            class="inline-flex items-center px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 shadow-sm">
            <DocumentIcon class="h-4 w-4 mr-2" />
            {{ $t("TABLE.download_excel") }}
          </button>
        </div>
      </div>
    </div>

    <!-- Table Section -->
    <div class="overflow-x-auto rounded-lg border border-gray-100">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <TableHeaderCell field="id" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
              {{ $t("TABLE.no") }}
            </TableHeaderCell>
            <TableHeaderCell field="title" class="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
              {{ $t("TABLE.order_id") }}
            </TableHeaderCell>
            <TableHeaderCell field="title" class="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
              {{ $t("TABLE.item") }}
            </TableHeaderCell>
            <TableHeaderCell field="title" class="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
              {{ $t("TABLE.created_date") }}
            </TableHeaderCell>
            <TableHeaderCell field="title" class="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
              {{ $t("TABLE.total") }}
            </TableHeaderCell>
            <TableHeaderCell field="title" class="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
              Action
            </TableHeaderCell>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-if="isLoadingProduct || !listOrder.length">
            <td colspan="8" class="px-3 py-6 text-sm text-gray-500 text-center">
              <Spinner v-if="isLoadingProduct" class="mx-auto" />
              <p v-else class="text-center py-8 text-gray-500">
                {{ $t("DASHBOARD.no_orders") }}
              </p>
            </td>
          </tr>
          <tr v-else v-for="(order, index) of listOrder" :key="order._id"
            class="animate-fade-in-down hover:bg-gray-50 transition-colors duration-150"
            :style="{ 'animation-delay': index * 0.05 + 's' }" @click="openModal(order)">
            <td class="whitespace-nowrap py-2 pl-2 pr-2 text-sm font-medium text-gray-700 sm:pl-6">
              {{ (index + 1).toString().padStart(2, "0") }}
            </td>

            <td class="whitespace-nowrap px-2 py-2 text-sm text-gray-900 max-w-xs truncate">
              {{ order.order_number }}
            </td>
            <td class="whitespace-nowrap px-2 py-2 text-sm text-gray-900 max-w-xs truncate">
              {{ "x" + order.items?.length }}
            </td>
            <td class="whitespace-nowrap px-2 py-2 text-sm text-gray-900 max-w-xs truncate">
              {{ dayjs(order.order_date).format("DD/MM/YYYY - hh:mm A") }}
            </td>
            <td class="whitespace-nowrap px-2 py-2 text-sm text-gray-900 max-w-xs truncate">
              {{ "$" + order.grand_total }}
            </td>

            <td class="whitespace-nowrap px-2 py-2 text-sm text-gray-900 max-w-xs truncate">
              <button @click="downloadReceiptPDF(order._id)"
                class="inline-flex items-center px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 shadow-sm">
                <DocumentTextIcon class="h-4 w-4 mr-2" />
                Download PDF
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="flex justify-between items-center py-4">
        <button @click="prevPage" :disabled="currentPage === 1"
          class="px-4 py-2 rounded-lg border bg-white disabled:opacity-40">
          {{ $t("BUTTON.previous") }}
        </button>

        <span class="text-gray-600">
          {{ $t("BUTTON.page") }} {{ currentPage }} {{ $t("BUTTON.of") }}
          {{ totalPages }}
        </span>

        <button @click="nextPage" :disabled="currentPage === totalPages"
          class="px-4 py-2 rounded-lg border bg-white disabled:opacity-40">
          {{ $t("BUTTON.next") }}
        </button>
      </div>
    </div>
  </div>

  <!-- Modal -->
  <div v-if="isModalOpen"
    class="fixed inset-0 z-[100] flex justify-center py-6 px-4 bg-gray-500/20 backdrop-blur-sm overflow-y-auto"
    @click="closeModal">
    <div class="bg-gray-50/95 shadow-xl w-full max-w-6xl rounded-2xl p-6 md:p-8 flex flex-col gap-6" @click.stop
      style="min-height: max-content; margin-top: auto; margin-bottom: auto;">

      <!-- Top Bar: Title & Actions -->
      <div
        class="bg-white rounded-xl shadow-sm p-4 md:p-5 flex flex-col md:flex-row justify-between items-center w-full">
        <div class="flex items-center gap-4 w-full md:w-auto">
          <div class="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <DocumentTextIcon class="w-7 h-7" />
          </div>
          <div>
            <h2 class="text-xl md:text-2xl font-bold text-gray-900 leading-tight">សេចក្តីលម្អិតការបញ្ជាទិញ</h2>
            <p class="text-sm text-gray-400 mt-0.5">គ្រប់គ្រងរាល់ប្រតិបត្តិការលក់របស់អ្នក</p>
          </div>
        </div>
        <div class="flex gap-3 mt-4 md:mt-0 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button @click="downloadReceiptPDF(objDetail?.order?._id)"
            class="px-5 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-semibold flex items-center gap-2 transition-colors shrink-0 text-sm">
            <PrinterIcon class="w-5 h-5" /> បោះពុម្ព
          </button>
          <button
            class="px-5 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-semibold flex items-center gap-2 shadow-sm transition-colors shrink-0 text-sm">
            <ShareIcon class="w-5 h-5" /> ចែករំលែក
          </button>
        </div>
      </div>

      <div v-if="isLoadingDetail" class="flex justify-center items-center h-64 w-full bg-white rounded-xl shadow-sm">
        <Spinner />
      </div>

      <div v-else-if="objDetail && objDetail.order"
        class="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full relative h-[calc(100%-110px)] overflow-hidden">

        <!-- Left Column (Order Info, Items, Totals) -->
        <div class="lg:col-span-8 flex flex-col gap-6 h-full overflow-y-auto pr-1 pb-1 custom-scrollbar">

          <!-- Order Header Card -->
          <div
            class="bg-white rounded-xl shadow-sm p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div class="flex items-center gap-5">
              <div class="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                <ShoppingBagIcon class="w-8 h-8" />
              </div>
              <div>
                <p class="text-[13px] font-medium text-gray-400 mb-1">លេខបញ្ជាទិញ</p>
                <h3 class="text-3xl font-black text-gray-900 tracking-tight">#{{ objDetail.order.order_number }}</h3>
              </div>
            </div>
            <div class="mt-5 sm:mt-0 text-left sm:text-right w-full sm:w-auto">
              <div class="inline-flex flex-col sm:items-end">
                <span
                  class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[13px] font-bold bg-green-50 text-green-700 mb-2 border border-green-100/60 shadow-sm w-fit">
                  <span class="w-2 h-2 rounded-full bg-green-500/80 animate-pulse"></span> បានបង់ប្រាក់ (PAID)
                </span>
                <p class="text-[13px] font-medium text-gray-400">កាលបរិច្ឆេទ: {{
                  dayjs(objDetail.order.order_date).format("DD/MM/YYYY - hh:mm A") }}</p>
              </div>
            </div>
          </div>

          <!-- Ordered Items Card -->
          <div class="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col border border-gray-50/50">
            <div
              class="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white/50 backdrop-blur-sm z-10 sticky top-0">
              <h3 class="text-[17px] font-bold text-gray-900">ទំនិញដែលបានកម្ម៉ង់</h3>
              <span class="text-sm font-semibold text-gray-400">{{ objDetail.items.length }} មុខទំនិញ</span>
            </div>
            <div class="overflow-x-auto custom-scrollbar">
              <table class="w-full text-left text-[14px] whitespace-nowrap lg:whitespace-normal">
                <thead class="bg-gray-50/80 text-gray-500 border-b border-gray-100">
                  <tr>
                    <th class="px-6 py-4 font-semibold">ព័ត៌មានទំនិញ</th>
                    <th class="px-6 py-4 font-semibold text-right">តម្លៃរាយ</th>
                    <th class="px-6 py-4 font-semibold text-center">បរិមាណ</th>
                    <th class="px-6 py-4 font-semibold text-right">បញ្ចុះតម្លៃ</th>
                    <th class="px-6 py-4 font-semibold text-right">សរុប</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100/80 bg-white">
                  <tr v-for="item in objDetail.items" :key="item._id" class="hover:bg-gray-50/50 transition-colors">
                    <td class="px-6 py-5">
                      <div class="flex items-center gap-5">
                        <div
                          class="w-16 h-16 rounded-[14px] bg-gray-50 overflow-hidden shrink-0 border border-gray-100 shadow-sm">
                          <img :src="item.product_id?.image || 'https://via.placeholder.com/150'"
                            class="w-full h-full object-cover mix-blend-multiply" />
                        </div>
                        <div class="min-w-0 pr-4">
                          <p class="font-bold text-gray-900 text-[15px] mb-1.5 truncate">
                            {{ item.product_id?.type_of_wood_id?.name ? 'Wood ' + item.product_id?.type_of_wood_id?.name
                              : (item.product_name || 'Product') }}
                          </p>
                          <p class="text-[13px] text-gray-400 truncate w-[200px] lg:w-auto"
                            v-if="item.product_id?.type_of_wood_id">
                            <span class="italic font-medium">Type:</span> {{ item.product_id?.type_of_wood_id?.name }},
                            <span class="italic font-medium">End Grain:</span> {{
                              item.product_id?.end_grain_of_wood_id?.name }}cm,
                            <span class="italic font-medium">Length:</span> {{ item.product_id?.length_of_wood_id?.name
                            }}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-5 text-right font-medium text-gray-700">${{ item.price.toFixed(2) }}</td>
                    <td class="px-6 py-5 text-center font-bold text-gray-900">{{ item.cubic_meters ?? item.quantity }}</td>
                    <td class="px-6 py-5 text-right font-medium text-red-500">-${{ item.discount.toFixed(2) }}</td>
                    <td class="px-6 py-5 text-right font-bold text-gray-900 text-[15px]">${{ item.total.toFixed(2) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Totals Card -->
          <div class="bg-white rounded-xl shadow-sm p-6 ml-auto w-full md:w-3/5 border border-gray-50/50">
            <div class="space-y-4">
              <div class="flex justify-between items-center text-gray-500">
                <span class="font-medium text-[14px]">សរុបរង (Subtotal):</span>
                <span class="font-bold text-gray-900 text-[15px]">${{ objDetail.order.subtotal?.toFixed(2) || '0.00'
                  }}</span>
              </div>
              <div class="flex justify-between items-center text-gray-500">
                <span class="font-medium text-[14px]">ពន្ធ (Tax 0%):</span>
                <span class="font-bold text-gray-900 text-[15px]">${{ objDetail.order.tax?.toFixed(2) || '0.00'
                  }}</span>
              </div>
              <div class="pt-5 mt-3 border-t border-gray-100 flex justify-between items-center border-dashed">
                <span class="text-lg font-bold text-gray-900">សរុបរួម:</span>
                <span class="text-[28px] leading-none font-black text-blue-600">${{
                  objDetail.order.grand_total?.toFixed(2) || '0.00' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column (Customer, Payment, Seller) -->
        <div class="lg:col-span-4 flex flex-col gap-6 h-full overflow-y-auto pb-1 pl-1 custom-scrollbar">

          <!-- Customer Info Card -->
          <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-50/50">
            <div class="flex items-center gap-3 mb-6 border-b border-gray-100 pb-5">
              <UserIcon class="w-[22px] h-[22px] text-blue-600" />
              <h3 class="text-[17px] font-bold text-gray-900">ព័ត៌មានអតិថិជន</h3>
            </div>

            <div class="flex items-center gap-4 mb-7">
              <div
                class="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-[3px] border-white shadow-sm ring-1 ring-gray-100 shrink-0">
                <img
                  :src="`https://ui-avatars.com/api/?name=${objDetail.order.customer?.split(' ').join('+') || 'Customer'}&background=F3F4F6&color=4B5563&font-size=0.4`"
                  class="w-full h-full object-cover" />
              </div>
              <div class="min-w-0 pr-2">
                <p class="font-bold text-gray-900 text-lg truncate">{{ objDetail.order.customer || 'Nouy Samnang' }}</p>
                <p class="text-[13px] font-medium text-gray-400 mt-0.5">អតិថិជនទូទៅ</p>
              </div>
            </div>

            <div class="space-y-4 pt-1">
              <div class="flex items-start gap-4 hover:bg-gray-50/50 p-2 -mx-2 rounded-lg transition-colors">
                <div class="p-2.5 bg-gray-50 rounded-xl shrink-0 text-gray-400">
                  <CalendarIcon class="w-5 h-5" />
                </div>
                <div class="mt-1">
                  <p class="text-[12px] font-semibold text-gray-400/80 mb-0.5 uppercase tracking-wider">ថ្ងៃខែឆ្នាំលក់
                  </p>
                  <p class="text-[14px] font-bold text-gray-700">{{ dayjs(objDetail.order.order_date).format("DD MMM YYYY") }}</p>
                </div>
              </div>
              <div class="flex items-start gap-4 hover:bg-gray-50/50 p-2 -mx-2 rounded-lg transition-colors mb-5">
                <div class="p-2.5 bg-gray-50 rounded-xl shrink-0 text-gray-400">
                  <ClockIcon class="w-5 h-5" />
                </div>
                <div class="mt-1">
                  <p class="text-[12px] font-semibold text-gray-400/80 mb-0.5 uppercase tracking-wider">ម៉ោងបញ្ជាទិញ</p>
                  <p class="text-[14px] font-bold text-gray-700">{{ dayjs(objDetail.order.order_date).format("hh:mm A")
                    }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Method Card -->
          <div class="bg-[#f0f5ff] border border-blue-100/60 rounded-xl p-6 relative overflow-hidden">
            <div class="absolute -right-6 -top-6 w-24 h-24 bg-blue-100/50 rounded-full blur-2xl"></div>
            <div class="flex items-center gap-3 mb-5 relative z-10">
              <BanknotesIcon class="w-[22px] h-[22px] text-blue-600" />
              <h3 class="text-[17px] font-bold text-gray-900">វិធីសាស្ត្របង់ប្រាក់</h3>
            </div>
            <div
              class="bg-white rounded-[14px] p-4 flex items-center justify-between shadow-sm relative z-10 border border-white/60">
              <div class="flex items-center gap-3">
                <div class="bg-blue-50/80 p-2.5 rounded-xl text-blue-600">
                  <BanknotesIcon class="w-[20px] h-[20px]" />
                </div>
                <span class="font-bold text-gray-900 text-[15px]">សាច់ប្រាក់ (Cash)</span>
              </div>
              <CheckCircleIcon class="w-[26px] h-[26px] text-[#22c55e]" />
            </div>
          </div>

          <!-- Seller Info Card -->
          <div
            class="border-[1.5px] border-dashed border-gray-200 bg-gray-50/50 rounded-xl p-6 text-center mt-auto flex-shrink-0">
            <p class="text-[12px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">អ្នកលក់ (Seller)</p>
            <p class="text-[17px] font-black text-gray-800">{{ currentUser.name || 'Sales Staff' }}</p>
          </div>

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

/* Custom scrollbar for ordered items if needed */
.custom-scrollbar::-webkit-scrollbar {
  height: 6px;
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
