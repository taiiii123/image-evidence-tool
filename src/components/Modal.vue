<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">{{ title }}</h3>
      </div>
      <div class="modal-body">
        {{ message }}
      </div>
      <div class="modal-footer">
        <button class="modal-btn modal-btn-cancel" @click="$emit('cancel')">
          キャンセル
        </button>
        <button class="modal-btn modal-btn-confirm" @click="$emit('confirm')">
          削除
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const handleOverlayClick = (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    emit('cancel')
  }
}
</script>
