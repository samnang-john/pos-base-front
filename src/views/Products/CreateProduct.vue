<script setup>
import { onMounted, ref, computed } from "vue";
import store from "../../store";
import { useRouter } from "vue-router";
import { toast } from "vue3-toastify";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const router = useRouter();

const image = ref(null);
const listWoodTypes = ref([]);
const listWoodLengths = ref([]);
const listWoodGrains = ref([]);
const listCategory = ref([]);
const selectedCategory = ref(null);
const formData = ref({
  image: null,
  wood_type: "",
  wood_length: "",
  wood_grain: "",
  price: "0",
  quantity: "0",
  total_price: "0",
  cost: "0",
  category: "",
  price_per_kube: "0",
  cost_per_kube: "0",
  total_cube: "0",
});
const loading = ref(false);

const isFormValid = computed(() => {
  const baseValid =
    formData.value.image &&
    formData.value.category;

  if (!baseValid) return false;

  if (selectedCategory.value?.name?.toLowerCase() === 'short') {
    return (
      Number(formData.value.price) > 0 &&
      Number(formData.value.quantity) > 0 &&
      Number(formData.value.cost) > 0
    );
  }
  return true;
});

onMounted(async () => {
  try {
    await Promise.all([getWoodTypes(), getWoodLengths(), getWoodGrains(), getCategory()]);
  } catch (error) {
    console.error("Error during initialization:", error);
  }
});

const getProducts = async () => {
  try {
    await store.dispatch("getProducts", {
      page: 1,
      pageSize: 15,
    });
  } catch (error) {
    console.log(error);
  } finally {
  }
};

const getCategory = async () => {
  try {
    const res = await store.dispatch("getCategories", {
      page: 1,
      pageSize: 20,
    });
    listCategory.value = res?.data?.items || [];
  } catch (error) {
    console.log(error);
  } finally {

  }
}

const getWoodTypes = async () => {
  //   isLoadingWoodType.value = true;
  try {
    const res = await store.dispatch("getWoodTypes", {
      page: 1,
      pageSize: 20,
    });

    listWoodTypes.value = res?.data?.items || [];
  } catch (error) {
    console.log(error);
  } finally {
    // isLoadingWoodType.value = false;
  }
};

const getWoodLengths = async () => {
  //   isLoadingWoodLength.value = true;
  try {
    const res = await store.dispatch("getWoodLengths", {
      page: 1,
      pageSize: 20,
    });

    listWoodLengths.value = res?.data?.items || [];
  } catch (error) {
    console.log(error);
  } finally {
    // isLoadingWoodLength.value = false;
  }
};

const getWoodGrains = async () => {
  //   isLoadingWoodGrain.value = true;
  try {
    const res = await store.dispatch("getWoodGrains", {
      page: 1,
      pageSize: 20,
    });

    listWoodGrains.value = res?.data?.items || [];
  } catch (error) {
    console.log(error);
  } finally {
    // isLoadingWoodGrain.value = false;
  }
};

const handleImageUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    formData.value.image = file; // store actual file
    image.value = URL.createObjectURL(file); // preview
  }
  console.log("formData", formData?.value);
};

const onCreateProduct = async () => {
  loading.value = true;
  try {
    const res = await store.dispatch("createProduct", formData.value);

    if (res) {
      getProducts();
      toast.success(t('TOAST.product_created'));
      setTimeout(() => {
        router.push({ name: "app.product" });
      }, 1500);
    }
  } catch (error) {
    console.log("Error adding product:", error);
    toast.error(t('TOAST.product_unsuccessful'));
  } finally {
    loading.value = false;
  }
};

const onTotalPrice = () => {
  const totalPrice = formData.value.cost * formData.value.quantity;
  formData.value.total_price = totalPrice;
};

const goBack = () => {
  router.back();
};

const onCategoryChange = () => {
  selectedCategory.value = listCategory.value.find(item => item._id === formData.value.category) || null;
};
</script>

<template>
  <!-- Main Container -->
  <div class="min-h-screen bg-[#F8F9FA] p-6 md:p-8">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6 max-w-5xl mx-auto">
      <button @click="goBack" class="p-2 rounded-full hover:bg-white hover:shadow transition-all bg-transparent group">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"
          class="w-5 h-5 text-gray-700 group-hover:text-black">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 class="text-xl font-bold text-[#1A1A1A]">{{ $t('create_product') }}</h1>
    </div>

    <!-- Form Card -->
    <div class="max-w-5xl mx-auto bg-white rounded-2xl shadow-md shadow-gray-200/60 p-6 md:p-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">

        <!-- Left Column: Image Upload -->
        <div class="lg:col-span-4 flex flex-col items-center">
          <label for="upload"
            class="relative w-full aspect-square bg-[#986b41] rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all hover:opacity-90 shadow-md">

            <!-- Default Placeholder (Plant Logo) -->
            <div v-if="!image" class="flex flex-col items-center gap-3">
              <div class="w-14 h-14 flex items-center justify-center">
                <!-- SVG Plant Logo (Similar to photo) -->
                <svg viewBox="0 0 100 150" class="w-full h-full text-[#F8F9FA] opacity-80" fill="currentColor">
                  <path d="M50 140V100M50 100C30 90 20 70 20 50C20 30 35 15 50 15C65 15 80 30 80 50C80 70 70 90 50 100Z"
                    fill="none" stroke="currentColor" stroke-width="2" />
                  <path d="M50 100C40 85 35 70 35 55M50 100C60 85 65 70 65 55" stroke="currentColor" stroke-width="2" />
                  <path d="M50 80C40 70 30 50 35 35M50 80C60 70 70 50 65 35" stroke="currentColor" stroke-width="2" />
                  <circle cx="50" cy="110" r="3" fill="currentColor" />
                  <path d="M40 130L50 120L60 130" stroke="currentColor" stroke-width="2" fill="none" />
                </svg>
              </div>
              <span class="text-[#F8F9FA] text-sm font-medium tracking-[0.2em]">{{ $t('MENU.product') }}</span>
            </div>

            <!-- Preview Image -->
            <img v-else :src="image" class="w-full h-full object-cover" />

            <!-- Invisible Input -->
            <input id="upload" type="file" class="hidden" @change="handleImageUpload" accept="image/*" />
          </label>
          <span class="text-xs text-gray-400 mt-2">{{ $t('FORM.upload_hint') || 'JPG or PNG, click to upload' }}</span>
        </div>

        <!-- Right Column: Form Fields -->
        <div class="lg:col-span-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">

            <!-- Category -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm text-gray-700 font-medium">{{ $t('TABLE.category') }} <span
                  class="text-red-500">*</span></label>
              <select v-model="formData.category" @change="onCategoryChange"
                class="w-full bg-[#f8f9fa] border border-gray-200 px-3 py-2.5 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#9A6A3A] focus:border-transparent transition-all appearance-none cursor-pointer">
                <option value="" disabled>{{ $t('FORM.select_category') }}</option>
                <option v-for="item in listCategory" :key="item.name" :value="item._id">{{ item.name }}</option>
              </select>
            </div>

            <!-- Wood Type -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm text-gray-700 font-medium">{{ $t('TABLE.wood_type') }} <span
                  class="text-red-500">*</span></label>
              <select v-model="formData.wood_type"
                class="w-full bg-[#f8f9fa] border border-gray-200 px-3 py-2.5 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#9A6A3A] focus:border-transparent transition-all appearance-none cursor-pointer">
                <option value="" disabled>{{ $t('FORM.select_wood_type') }}</option>
                <option v-for="item in listWoodTypes" :key="item.name" :value="item._id">{{ item.name }}</option>
              </select>
            </div>

            <template v-if="selectedCategory?.name?.toLowerCase() !== 'long'">
              <!-- Wood Length -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm text-gray-700 font-medium">{{ $t('TABLE.wood_length') }} <span
                  class="text-red-500">*</span></label>
              <select v-model="formData.wood_length"
                class="w-full bg-[#f8f9fa] border border-gray-200 px-3 py-2.5 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#9A6A3A] focus:border-transparent transition-all appearance-none cursor-pointer">
                <option value="" disabled>{{ $t('FORM.select_wood_length') }}</option>
                <option v-for="item in listWoodLengths" :key="item.name" :value="item._id">{{ item.name }}</option>
              </select>
            </div>

            <!-- Wood Grain -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm text-gray-700 font-medium">{{ $t('TABLE.wood_grain') }} <span
                  class="text-red-500">*</span></label>
              <select v-model="formData.wood_grain"
                class="w-full bg-[#f8f9fa] border border-gray-200 px-3 py-2.5 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#9A6A3A] focus:border-transparent transition-all appearance-none cursor-pointer">
                <option value="" disabled>{{ $t('FORM.select_wood_grain') }}</option>
                <option v-for="item in listWoodGrains" :key="item.name" :value="item._id">{{ item.name }}</option>
              </select>
            </div>

            </template>
            <template v-if="selectedCategory?.name?.toLowerCase() !== 'long'">
              <!-- Divider for pricing section -->
            <div class="md:col-span-2 border-t border-gray-100 my-1"></div>
              <!-- Price Per Piece (Cost) -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm text-gray-700 font-medium">{{ $t('FORM.price_per_piece') }} <span
                  class="text-red-500">*</span></label>
              <input type="number" v-model="formData.cost" @input="onTotalPrice"
                class="w-full bg-[#f8f9fa] border border-gray-200 px-3 py-2.5 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#9A6A3A] focus:border-transparent transition-all" />
            </div>

            <!-- Quantity -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm text-gray-700 font-medium">{{ $t('FORM.quantity_of_wood') }} <span
                  class="text-red-500">*</span></label>
              <input type="number" v-model="formData.quantity" @input="onTotalPrice"
                class="w-full bg-[#f8f9fa] border border-gray-200 px-3 py-2.5 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#9A6A3A] focus:border-transparent transition-all" />
            </div>

            <!-- Retail Price -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm text-gray-700 font-medium">{{ $t('FORM.retail_price_per_piece') }} </label>
              <input type="number" v-model="formData.price"
                class="w-full bg-[#f8f9fa] border border-gray-200 px-3 py-2.5 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#9A6A3A] focus:border-transparent transition-all" />
            </div>

            <!-- Total Price (computed, read-only) -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm text-gray-700 font-medium">{{ $t('FORM.total_price') }}</label>
              <div class="w-full bg-[#FBF6EF] border border-dashed border-[#D9C2A0] px-3 py-2.5 rounded-lg text-sm text-[#9A6A3A] font-semibold">
                {{ formData.total_price }}
              </div>
            </div>
            </template>

            <template v-if="selectedCategory?.name?.toLowerCase() === 'long'">
              <div class="md:col-span-2 border-t border-gray-100 my-1"></div>
              <div class="flex flex-col gap-1.5 md:col-span-2">
                <label class="text-sm text-gray-700 font-medium">{{ $t('FORM.total_cube') }}</label>
                <input type="number" v-model="formData.total_cube"
                  class="w-full bg-[#f8f9fa] border border-gray-200 px-3 py-2.5 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#9A6A3A] focus:border-transparent transition-all" />
              </div>
            </template>

            <template v-if="selectedCategory?.name?.toLowerCase() === 'long'">
              <div class="md:col-span-2 border-t border-gray-100 my-1"></div>
              <div class="flex flex-col gap-1.5">
                <label class="text-sm text-gray-700 font-medium">{{ $t('FORM.cost_per_cube') }}</label>
                <input type="number" v-model="formData.cost_per_kube"
                  class="w-full bg-[#f8f9fa] border border-gray-200 px-3 py-2.5 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#9A6A3A] focus:border-transparent transition-all" />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-sm text-gray-700 font-medium">{{ $t('FORM.price_per_cube') }}</label>
                <input type="number" v-model="formData.price_per_kube"
                  class="w-full bg-[#f8f9fa] border border-gray-200 px-3 py-2.5 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#9A6A3A] focus:border-transparent transition-all" />
              </div>
            </template>


          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="mt-10 flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
        <button @click="goBack"
          class="px-5 py-2.5 rounded-lg font-medium text-sm text-gray-600 hover:bg-gray-50 transition-all">
          {{ $t('BUTTON.cancel') }}
        </button>
        <button @click="onCreateProduct"
          class="group relative bg-[#9A6A3A] hover:bg-[#86592d] text-white px-6 py-2.5 rounded-lg font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="loading || !isFormValid">
          <div v-if="loading" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full">
          </div>
          <template v-else>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
              <path
                d="M18 3H6C4.89 3 4 3.9 4 5V19C4 20.1 4.89 21 6 21H18C19.1 21 20 20.1 20 19V5C20 3.9 19.1 3 18 3ZM12 19C10.34 19 9 17.66 9 16C9 14.34 10.34 13 12 13C13.66 13 15 14.34 15 16C15 17.66 13.66 19 12 19ZM16 10H8V5H16V10Z" />
            </svg>
            {{ $t('FORM.enter_product') }}
          </template>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Hide number input arrows */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
}

input[type=number] {
  -moz-appearance: textfield;
  appearance: textfield;
}

select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.75rem center;
  background-repeat: no-repeat;
  background-size: 1.25em 1.25em;
  padding-right: 2.25rem;
}
</style>