<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center"
        style="background-color: rgba(0, 0, 0, 0.4)"
        @click="handleBackdropClick"
        @keydown.esc="cancel"
        tabindex="-1"
      >
        <div
          class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md"
          @click.stop
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <h2 id="modal-title" class="text-lg font-bold text-gray-800 mb-4">
            {{ title }}
          </h2>
          <p class="text-gray-600 mb-6">{{ message }}</p>
          <div class="flex justify-end gap-4">
            <button
              class="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
              @click="cancel"
            >
              Cancel
            </button>
            <button
              class="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
              @click="confirm"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  isOpen: Boolean,
  message: {
    type: String,
    default: "Are you sure you want to proceed?",
  },
  title: {
    type: String,
    default: "Alert Title",
  },
});

const emit = defineEmits(["confirm", "cancel", "update:isOpen"]);

function handleBackdropClick() {
  emit("cancel");
  emit("update:isOpen", false);
}

function confirm() {
  emit("confirm");
  emit("update:isOpen", false);
}

function cancel() {
  emit("cancel");
  emit("update:isOpen", false);
}
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
