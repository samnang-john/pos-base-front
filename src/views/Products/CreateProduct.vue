<script setup>
import { computed, onMounted } from "vue";
import { ref } from "vue";
import store from "../../store";
import { useRoute, useRouter } from "vue-router";
import { toast } from "vue3-toastify";

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
      toast.success("Product created successfully!");
      setTimeout(() => {
        router.back();
      }, 3000);
    }
  } catch (error) {
    console.log("Error adding product:", error);
    toast.error("Product created unsuccessfully!");
  } finally {
    loading.value = false;
  }
};

const onTotalPrice = () => {
  const totalPrice = formData.value.price * formData.value.quantity;
  formData.value.total_price = totalPrice;
};

const goBack = () => {
  router.back();
};
</script>

<template>
  <!-- Main Header -->
  <div class="flex items-center gap-3 mb-3" @click="goBack">
    <!-- Back Button -->
    <button class="p-2 rounded-full hover:bg-gray-200 transition">
      <!-- Arrow Icon (Heroicons) -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
        class="w-6 h-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M15 19l-7-7 7-7"
        />
      </svg>
    </button>

    <!-- Title -->
    <h1 class="text-3xl font-semibold">Create Product</h1>
  </div>

  <!-- Form Container -->
  <div class="w-full bg-[#F5F5F5] p-10 rounded-xl">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-10 animate-fade-in-down">
      <!-- Image Upload Box -->
      <div class="flex justify-center">
        <label
          for="upload"
          class="w-[260px] h-[300px] border border-gray-300 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer bg-white"
        >
          <div v-if="!image" class="flex flex-col items-center gap-2">
            <img src="" class="w-10 opacity-50" />
            <p class="text-gray-500">Upload Image</p>
          </div>

          <img
            v-else
            :src="image"
            class="w-full h-full object-cover rounded-xl"
          />

          <input
            id="upload"
            type="file"
            class="hidden"
            @change="handleImageUpload"
          />
        </label>
      </div>

      <!-- Form Fields -->
      <div class="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Wood Type -->
        <div class="">
          <label class="block mb-1 font-medium"
            >ប្រភេទឈើ<span class="text-red-500">*</span></label
          >

          <select
            v-model="formData.wood_type"
            class="w-full p-3 rounded-lg bg-white"
          >
            <option value="" disabled selected>ជ្រើសរើសប្រភេទឈើ</option>
            <option
              v-for="item in listWoodTypes"
              :key="item.name"
              :value="item._id"
            >
              {{ item.name }}
            </option>
          </select>
        </div>

        <!-- Wood Length -->
        <div>
          <label class="block mb-1 font-medium">
            ប្រវែង<span class="text-red-500">*</span>
          </label>

          <select
            v-model="formData.wood_length"
            class="w-full p-3 rounded-lg bg-white"
          >
            <option value="" disabled selected>ជ្រើសរើសប្រវែង</option>
            <option
              v-for="item in listWoodLengths"
              :key="item.name"
              :value="item._id"
            >
              {{ item.name }}
            </option>
          </select>
        </div>

        <!-- Weight -->
        <div>
          <label class="block mb-1 font-medium"
            >មុខកាត់<span class="text-red-500">*</span></label
          >
          <select
            v-model="formData.wood_grain"
            class="w-full p-3 rounded-lg bg-white"
          >
            <option value="" disabled selected>ជ្រើសរើសមុខកាត់</option>
            <option
              v-for="item in listWoodGrains"
              :key="item.name"
              :value="item._id"
            >
              {{ item.name }}
            </option>
          </select>
        </div>

        <!-- Quantity -->
        <div>
          <label class="block mb-1 font-medium"
            >តម្លៃក្នុងមួយដុំ<span class="text-red-500">*</span></label
          >
          <input
            type="number"
            v-model="formData.price"
            value="0"
            class="w-full p-3 rounded-lg bg-white"
            @input="onTotalPrice"
          />
        </div>

        <!-- Buying Price -->
        <div>
          <label class="block mb-1 font-medium"
            >ចំនួនឈើ<span class="text-red-500">*</span></label
          >
          <input
            type="number"
            v-model="formData.quantity"
            value="0"
            class="w-full p-3 rounded-lg bg-white"
            @input="onTotalPrice"
          />
        </div>

        <!-- Minimum Stock -->
        <div>
          <label class="block mb-1 font-medium"
            >តម្លៃសរុប<span class="text-red-500">*</span></label
          >
          <input
            type="number"
            v-model="formData.total_price"
            value="0"
            class="w-full p-3 rounded-lg bg-white"
            disabled
          />
        </div>

        <!-- Retail Price -->
        <div>
          <label class="block mb-1 font-medium"
            >តម្លៃលក់ចេញក្នុងមួយឈើ<span class="text-red-500">*</span></label
          >
          <input
            type="number"
            v-model="formData.cost"
            value="0"
            class="w-full p-3 rounded-lg bg-white"
          />
        </div>
      </div>
    </div>

    <!-- Submit Button -->
    <div class="mt-10">
      <button
        @click="onCreateProduct"
        class="flex items-center justify-center w-full bg-[#9A6A3A] hover:bg-[#7d542d] text-white py-3 rounded-lg font-semibold"
        :disabled="loading"
      >
        <svg
          v-if="loading"
          class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p v-else>បញ្ចូលទំនិញ</p>
      </button>
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
