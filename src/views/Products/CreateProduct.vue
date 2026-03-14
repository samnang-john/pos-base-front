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
const formData = ref({
  image: null,
  wood_type: "",
  wood_length: "",
  wood_grain: "",
  price: "0",
  quantity: "0",
  total_price: "0",
  cost: "0",
});
const loading = ref(false);

const isFormValid = computed(() => {
  return (
    formData.value.image &&
    formData.value.wood_type &&
    formData.value.wood_length &&
    formData.value.wood_grain &&
    Number(formData.value.price) > 0 &&
    Number(formData.value.quantity) > 0 &&
    Number(formData.value.cost) > 0
  );
});

onMounted(async () => {
  try {
    await Promise.all([getWoodTypes(), getWoodLengths(), getWoodGrains()]);
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
</script>

<template>
  <!-- Main Container -->
  <div class="min-h-screen bg-[#F8F9FA] p-8 md:p-12">
    <!-- Header -->
    <div class="flex items-center gap-4 mb-8">
      <button @click="goBack" class="p-2 rounded-full hover:bg-white hover:shadow transition-all bg-transparent group">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"
          class="w-6 h-6 text-gray-700 group-hover:text-black">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 class="text-3xl font-bold text-[#1A1A1A]">{{ $t('create_product') }}</h1>
    </div>

    <!-- Form Card -->
    <div class="max-w-7xl mx-auto bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 p-10 md:p-16">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-16">

        <!-- Left Column: Image Upload -->
        <div class="lg:col-span-5 flex flex-col items-center">
          <label for="upload"
            class="relative w-full aspect-[4/5] bg-[#1A3C34] rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all hover:opacity-90 shadow-lg">

            <!-- Default Placeholder (Plant Logo) -->
            <div v-if="!image" class="flex flex-col items-center gap-6">
              <div class="w-24 h-24 flex items-center justify-center">
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
              <span class="text-[#F8F9FA] text-2xl font-medium tracking-[0.2em]">PRODUCT</span>
            </div>

            <!-- Preview Image -->
            <img v-else :src="image" class="w-full h-full object-cover" />

            <!-- Invisible Input -->
            <input id="upload" type="file" class="hidden" @change="handleImageUpload" accept="image/*" />
          </label>
        </div>

        <!-- Right Column: Form Fields -->
        <div class="lg:col-span-7">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">

            <!-- Wood Type -->
            <div class="flex flex-col gap-2">
              <label class="text-gray-700 font-semibold">{{ $t('TABLE.wood_type') }} <span
                  class="text-red-500">*</span></label>
              <select v-model="formData.wood_type"
                class="w-full bg-[#f8f9fa] border-none p-4 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#9A6A3A] transition-all appearance-none cursor-pointer">
                <option value="" disabled>{{ $t('FORM.select_wood_type') }}</option>
                <option v-for="item in listWoodTypes" :key="item.name" :value="item._id">{{ item.name }}</option>
              </select>
            </div>

            <!-- Wood Length -->
            <div class="flex flex-col gap-2">
              <label class="text-gray-700 font-semibold">{{ $t('TABLE.wood_length') }} <span
                  class="text-red-500">*</span></label>
              <select v-model="formData.wood_length"
                class="w-full bg-[#f8f9fa] border-none p-4 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#9A6A3A] transition-all appearance-none cursor-pointer">
                <option value="" disabled>{{ $t('FORM.select_wood_length') }}</option>
                <option v-for="item in listWoodLengths" :key="item.name" :value="item._id">{{ item.name }}</option>
              </select>
            </div>

            <!-- Wood Grain -->
            <div class="flex flex-col gap-2">
              <label class="text-gray-700 font-semibold">{{ $t('TABLE.wood_grain') }} <span
                  class="text-red-500">*</span></label>
              <select v-model="formData.wood_grain"
                class="w-full bg-[#f8f9fa] border-none p-4 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#9A6A3A] transition-all appearance-none cursor-pointer">
                <option value="" disabled>{{ $t('FORM.select_wood_grain') }}</option>
                <option v-for="item in listWoodGrains" :key="item.name" :value="item._id">{{ item.name }}</option>
              </select>
            </div>

            <!-- Price Per Piece (Cost) -->
            <div class="flex flex-col gap-2">
              <label class="text-gray-700 font-semibold">{{ $t('FORM.price_per_piece') }} <span
                  class="text-red-500">*</span></label>
              <input type="number" v-model="formData.cost" @input="onTotalPrice"
                class="w-full bg-[#f8f9fa] border-none p-4 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#9A6A3A] transition-all" />
            </div>

            <!-- Quantity -->
            <div class="flex flex-col gap-2">
              <label class="text-gray-700 font-semibold">{{ $t('FORM.quantity_of_wood') }} <span
                  class="text-red-500">*</span></label>
              <input type="number" v-model="formData.quantity" @input="onTotalPrice"
                class="w-full bg-[#f8f9fa] border-none p-4 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#9A6A3A] transition-all" />
            </div>

            <!-- Total Price -->
            <div class="flex flex-col gap-2">
              <label class="text-gray-700 font-semibold">{{ $t('FORM.total_price') }} <span
                  class="text-red-500">*</span></label>
              <input type="number" v-model="formData.total_price" disabled
                class="w-full bg-[#f1f3f5] border-none p-4 rounded-xl text-gray-500 font-medium" />
            </div>

            <!-- Retail Price -->
            <div class="flex flex-col gap-2">
              <label class="text-gray-700 font-semibold">{{ $t('FORM.retail_price_per_piece') }} <span
                  class="text-red-500">*</span></label>
              <input type="number" v-model="formData.price"
                class="w-full bg-[#f8f9fa] border-none p-4 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#9A6A3A] transition-all" />
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="mt-20 flex flex-col items-center gap-6">
        <button @click="onCreateProduct"
          class="group relative w-full max-w-lg bg-[#9A6A3A] hover:bg-[#86592d] text-white py-5 rounded-[1.25rem] font-bold text-xl shadow-xl shadow-brown-200 transition-all flex items-center justify-center gap-3 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="loading || !isFormValid">
          <div v-if="loading" class="animate-spin h-6 w-6 border-4 border-white border-t-transparent rounded-full">
          </div>
          <template v-else>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
              <path
                d="M18 3H6C4.89 3 4 3.9 4 5V19C4 20.1 4.89 21 6 21H18C19.1 21 20 20.1 20 19V5C20 3.9 19.1 3 18 3ZM12 19C10.34 19 9 17.66 9 16C9 14.34 10.34 13 12 13C13.66 13 15 14.34 15 16C15 17.66 13.66 19 12 19ZM16 10H8V5H16V10Z" />
            </svg>
            {{ $t('FORM.enter_product') }}
          </template>
        </button>
        <button @click="goBack" class="text-[#9A6A3A] font-semibold hover:underline decoration-2 underline-offset-4">
          {{ $t('BUTTON.cancel') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom Shadow for the brown button */
.shadow-brown-200 {
  box-shadow: 0 10px 15px -3px rgba(154, 106, 58, 0.2), 0 4px 6px -4px rgba(154, 106, 58, 0.1);
}

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

/* Transitions for rounded corners and focus */
.rounded-xl {
  transition: all 0.3s ease;
}

select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 1rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}
</style>
