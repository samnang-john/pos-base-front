<script setup>
import { onMounted, ref } from "vue";
import store from "../../store";
import Spinner from "../../components/core/Spinner.vue";
import TableHeaderCell from "../../components/core/Table/TableHeaderCell.vue";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import {
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@heroicons/vue/24/outline";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { useRouter } from "vue-router";
import dayjs from "dayjs";
import { DocumentIcon, DocumentTextIcon } from "@heroicons/vue/24/solid";

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
const woodTypeNameForm = ref({
  name: "",
  description: "",
});
const isUpdate = ref(false); // Control For Update
const isErrorValue = ref(false);
const objDetail = ref(null);

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
    console.log(error);
  } finally {
    isLoadingProduct.value = false;
  }
};

const downloadPDF = async () => {
  const res = await store.dispatch("getOrdersPDF");

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
  const res = await store.dispatch("getOrdersExcel");

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

const openModal = (orderItem) => {
  console.log("akfdkfksda", orderItem);
  objDetail.value = orderItem;
  isModalOpen.value = true;
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
    <h1 class="text-3xl font-semibold">Orders</h1>
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
    <!-- Header Section -->
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-5 mb-5 border-b border-gray-100"
    >
      <!-- Search Input -->
      <div class="relative w-full md:w-auto">
        <div
          class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
        >
          <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
        </div>
        <input
          v-model="search"
          @change="getOrders"
          class="block w-full md:w-64 pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
          placeholder="Search wood type..."
        />
      </div>

      <!-- Filters and Download Buttons -->
      <div
        class="flex flex-col lg:flex-row gap-4 w-full md:w-auto items-start lg:items-center"
      >
        <!-- Date Range Filters -->
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex flex-col">
            <label
              for="startDate"
              class="text-sm font-medium text-gray-700 mb-1"
              >Start Date</label
            >
            <input
              id="startDate"
              v-model="startDate"
              @change="getOrders"
              type="date"
              class="block w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
            />
          </div>
          <div class="flex flex-col">
            <label for="endDate" class="text-sm font-medium text-gray-700 mb-1"
              >End Date</label
            >
            <input
              id="endDate"
              v-model="endDate"
              @change="getOrders"
              type="date"
              class="block w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
            />
          </div>
        </div>

        <!-- Download Buttons -->
        <div class="flex gap-3 mt-4 lg:mt-0">
          <button
            @click="downloadPDF"
            class="inline-flex items-center px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 shadow-sm"
          >
            <DocumentTextIcon class="h-4 w-4 mr-2" />
            Download PDF
          </button>
          <button
            @click="downloadExcel"
            class="inline-flex items-center px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 shadow-sm"
          >
            <DocumentIcon class="h-4 w-4 mr-2" />
            Download Excel
          </button>
        </div>
      </div>
    </div>

    <!-- Table Section -->
    <div class="overflow-x-auto rounded-lg border border-gray-100">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <TableHeaderCell
              field="id"
              class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
            >
              No
            </TableHeaderCell>
            <TableHeaderCell
              field="title"
              class="py-3.5 px-3 text-left text-sm font-semibold text-gray-900"
            >
              Order ID
            </TableHeaderCell>
            <TableHeaderCell
              field="title"
              class="py-3.5 px-3 text-left text-sm font-semibold text-gray-900"
            >
              Order Item
            </TableHeaderCell>
            <TableHeaderCell
              field="title"
              class="py-3.5 px-3 text-left text-sm font-semibold text-gray-900"
            >
              Order Date
            </TableHeaderCell>
            <TableHeaderCell
              field="title"
              class="py-3.5 px-3 text-left text-sm font-semibold text-gray-900"
            >
              Total Price
            </TableHeaderCell>

            <!-- <TableHeaderCell
              field="actions"
              class="py-3.5 pl-3 pr-4 text-left text-sm font-semibold text-gray-900 sm:pr-6"
            >
              Actions
            </TableHeaderCell> -->
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-if="isLoadingProduct || !listOrder.length">
            <td colspan="8" class="px-3 py-6 text-sm text-gray-500 text-center">
              <Spinner v-if="isLoadingProduct" class="mx-auto" />
              <p v-else class="text-center py-8 text-gray-500">
                No wood type found
              </p>
            </td>
          </tr>
          <tr
            v-else
            v-for="(order, index) of listOrder"
            :key="order._id"
            class="animate-fade-in-down hover:bg-gray-50 transition-colors duration-150"
            :style="{ 'animation-delay': index * 0.05 + 's' }"
            @click="openModal(order)"
          >
            <td
              class="whitespace-nowrap py-2 pl-2 pr-2 text-sm font-medium text-gray-700 sm:pl-6"
            >
              {{ (index + 1).toString().padStart(2, "0") }}
            </td>

            <td
              class="whitespace-nowrap px-2 py-2 text-sm text-gray-900 max-w-xs truncate"
            >
              {{ order.order_number }}
            </td>
            <td
              class="whitespace-nowrap px-2 py-2 text-sm text-gray-900 max-w-xs truncate"
            >
              {{ "x" + order.items?.length }}
            </td>
            <td
              class="whitespace-nowrap px-2 py-2 text-sm text-gray-900 max-w-xs truncate"
            >
              {{ dayjs(order.order_date).format("DD/MM/YYYY - hh:MM A") }}
            </td>
            <td
              class="whitespace-nowrap px-2 py-2 text-sm text-gray-900 max-w-xs truncate"
            >
              {{ "$" + order.grand_total }}
            </td>

            <!-- <td
              class="relative whitespace-nowrap py-2 pl-2 pr-2 text-center text-sm font-medium sm:pr-6"
            >
              <Menu as="div" class="relative inline-block text-left">
                <div>
                  <MenuButton
                    class="flex items-center rounded-full p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    <span class="sr-only">Open options</span>
                    <EllipsisVerticalIcon class="h-5 w-5" aria-hidden="true" />
                  </MenuButton>
                </div>

                <transition
                  enter-active-class="transition duration-100 ease-out"
                  enter-from-class="transform scale-95 opacity-0"
                  enter-to-class="transform scale-100 opacity-100"
                  leave-active-class="transition duration-75 ease-in"
                  leave-from-class="transform scale-100 opacity-100"
                  leave-to-class="transform scale-95 opacity-0"
                >
                  <MenuItems
                    class="absolute right-0 z-10 mt-2 w-40 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                  >
                    <div class="py-1">
                      <MenuItem v-slot="{ active }">
                        <button
                          :class="[
                            active
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'text-gray-700',
                            'group flex w-full items-center px-4 py-2 text-sm',
                          ]"
                          @click="onEdit(product)"
                        >
                          <PencilIcon
                            class="mr-3 h-4 w-4 text-indigo-500 group-hover:text-indigo-700"
                            aria-hidden="true"
                          />
                          Edit
                        </button>
                      </MenuItem>
                      <MenuItem v-slot="{ active }">
                        <button
                          :class="[
                            active ? 'bg-red-50 text-red-700' : 'text-gray-700',
                            'group flex w-full items-center px-4 py-2 text-sm',
                          ]"
                          @click="onDeleteProduct(product._id)"
                        >
                          <TrashIcon
                            class="mr-3 h-4 w-4 text-red-500 group-hover:text-red-700"
                            aria-hidden="true"
                          />
                          Delete
                        </button>
                      </MenuItem>
                    </div>
                  </MenuItems>
                </transition>
              </Menu>
            </td> -->
          </tr>
        </tbody>
      </table>
      <div class="flex justify-between items-center py-4">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="px-4 py-2 rounded-lg border bg-white disabled:opacity-40"
        >
          Previous
        </button>

        <span class="text-gray-600">
          Page {{ currentPage }} of {{ totalPages }}
        </span>

        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 rounded-lg border bg-white disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  </div>

  <!-- Modal -->
  <div
    v-if="isModalOpen"
    class="fixed inset-0 z-50 flex items-center justify-center"
    style="background-color: rgba(0, 0, 0, 0.4)"
    @click="closeModal"
  >
    <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md" @click.stop>
      <h2 class="text-lg font-bold text-[#9A6A3A] mb-4">Order Detail</h2>

      <!-- First Row -->
      <div class="flex justify-around mb-4">
        <div class="text-center">
          <p class="text-sm text-gray-600">Order ID</p>
          <p class="text-md font-bold text-gray-900">
            {{ objDetail["order_number"] }}
          </p>
        </div>
        <div class="text-center">
          <p class="text-sm text-gray-600">Order Date</p>
          <p class="text-md font-bold text-gray-900">
            {{ dayjs(objDetail["order_date"]).format("DD/MM/YYYY - hh:mm A") }}
          </p>
        </div>
      </div>

      <!-- Second Row -->
      <div class="flex justify-around mb-4">
        <div class="text-center">
          <p class="text-sm text-gray-600">Customer</p>
          <p class="text-md font-bold text-gray-900">
            {{ objDetail["customer"] }}
          </p>
        </div>
        <div class="text-center">
          <p class="text-sm text-gray-600">Payment Status</p>
          <p class="text-md font-bold text-gray-900">
            {{ objDetail["payment_status"] }}
          </p>
        </div>
      </div>

      <!-- Order Items (looped) -->
      <div class="border-t border-gray-200 pt-4">
        <h3 class="text-md font-semibold text-gray-800">Order Items</h3>

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
              Qty: {{ item.quantity }} × ${{ item.price }}
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
            Total: ${{ objDetail["grand_total"].toFixed(2) }}
          </p>
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
