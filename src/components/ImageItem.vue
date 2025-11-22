<template>
  <div class="image-item">
    <div class="image-number">{{ index + 1 }}</div>
    <a 
      href="#"
      class="image-wrapper"
      @click.prevent="$emit('click-image')"
    >
      <img :src="image.dataUrl" :alt="image.name">
    </a>
    <div class="image-name" :title="image.name">{{ image.name }}</div>
    <textarea
      :value="image.comment"
      @input="$emit('update:comment', $event.target.value)"
      class="comment-input"
      placeholder="画像の説明やコメントを入力..."
    ></textarea>
    <button @click="$emit('remove')" class="delete-btn">削除</button>
  </div>
</template>

<script setup>
defineProps({
  image: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  }
})

defineEmits(['update:comment', 'remove', 'click-image'])
</script>
