<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import store from "../../store";
import { toast } from "vue3-toastify";

const router = useRouter();
const route = useRoute();

const proId = route.params.pro_id;

const image = ref(null); // for preview
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
const isEditMode = computed(() => !!proId);

onMounted(async () => {
  try {
    await Promise.all([getWoodTypes(), getWoodLengths(), getWoodGrains()]);

    if (isEditMode.value) {
      await getProductDetail();
    }
  } catch (error) {
    console.error("Error during initialization:", error);
    toast.error("Failed to load data");
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

const getProductDetail = async () => {
  try {
    const res = await store.dispatch("getProductDetail", { id: proId });
    const product = res?.data;

    if (!product) {
      toast.error("Product not found");
      router.back();
      return;
    }

    console.log("Product loaded:", product);

    // Fill form with product data
    formData.value = {
      image: null, // keep null (we'll show existing image via preview)
      wood_type:
        product.type_of_wood_id || product.type_of_wood_Object?._id || "",
      wood_length:
        product.length_of_wood_id || product.length_of_wood_Object?._id || "",
      wood_grain:
        product.end_grain_of_wood_id ||
        product.end_grain_of_wood_Object?._id ||
        "",
      price: String(product.price_of_each || 0),
      quantity: String(product.number_of_wood || 0),
      total_price: String(product.total_price_of_wood || 0),
      cost: String(product.cost_of_each || 0),
    };

    // Show existing image in preview
    if (product.image) {
      image.value = product.image; // direct URL from server
    }
  } catch (error) {
    console.error(error);
    toast.error("Failed to load product details");
  }
};

// Reuse your existing functions
const getWoodTypes = async () => {
  try {
    const res = await store.dispatch("getWoodTypes", { page: 1, pageSize: 50 });
    listWoodTypes.value = res?.data?.items || [];
  } catch (error) {
    console.log(error);
  }
};

const getWoodLengths = async () => {
  try {
    const res = await store.dispatch("getWoodLengths", {
      page: 1,
      pageSize: 50,
    });
    listWoodLengths.value = res?.data?.items || [];
  } catch (error) {
    console.log(error);
  }
};

const getWoodGrains = async () => {
  try {
    const res = await store.dispatch("getWoodGrains", {
      page: 1,
      pageSize: 50,
    });
    listWoodGrains.value = res?.data?.items || [];
  } catch (error) {
    console.log(error);
  }
};

const handleImageUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    formData.value.image = file;
    image.value = URL.createObjectURL(file);
  }
};

const onSubmit = async () => {
  loading.value = true;
  try {
    let res;
    if (isEditMode.value) {
      res = await store.dispatch("updateProduct", {
        id: proId,
        ...formData.value,
      });
      console.log("if(res)", res?.data);
      if (res?.data) {
        getProducts();
        toast.success("Product updated successfully!");
        setTimeout(() => {
          router.back();
        }, 3000);
      }
    } else {
      res = await store.dispatch("createProduct", formData.value);
      toast.success("Product created successfully!");
    }

    // if (res) {
    //   setTimeout(() => router.back(), 1500);
    // }
  } catch (error) {
    console.error("Submit error:", error);
    toast.error(isEditMode.value ? "Update failed!" : "Create failed!");
  } finally {
    loading.value = false;
  }
};

const goBack = () => router.back();

const onTotalPrice = () => {
  const totalPrice = formData.value.price * formData.value.quantity;
  formData.value.total_price = totalPrice;
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
    <h1 class="text-3xl font-semibold">Update Product</h1>
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
        @click="onSubmit"
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
        <p v-else>កែសម្រួលទំនិញ</p>
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
