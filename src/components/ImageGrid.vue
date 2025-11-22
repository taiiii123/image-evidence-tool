<template>
  <div id="sortable-container" class="image-grid" ref="containerRef">
    <ImageItem
      v-for="(image, index) in images"
      :key="image.id"
      :image="image"
      :index="index"
      :data-id="image.id"
      @update:comment="updateComment(image.id, $event)"
      @remove="$emit('remove', image.id)"
      @click-image="$emit('open-lightbox', index)"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import Sortable from 'sortablejs'
import ImageItem from './ImageItem.vue'

const props = defineProps({
  images: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:images', 'remove', 'open-lightbox'])

const containerRef = ref(null)
let sortableInstance = null

const updateComment = (id, comment) => {
  const updatedImages = props.images.map(img => 
    img.id === id ? { ...img, comment } : img
  )
  emit('update:images', updatedImages)
}

onMounted(() => {
  if (containerRef.value) {
    sortableInstance = Sortable.create(containerRef.value, {
      animation: 150,
      ghostClass: 'sortable-ghost',
      dragClass: 'sortable-drag',
      onEnd: (evt) => {
        const oldIndex = evt.oldIndex
        const newIndex = evt.newIndex

        const newImages = [...props.images]
        const movedItem = newImages.splice(oldIndex, 1)[0]
        newImages.splice(newIndex, 0, movedItem)

        emit('update:images', newImages)
      }
    })
  }
})

onUnmounted(() => {
  if (sortableInstance) {
    sortableInstance.destroy()
  }
})
</script>
