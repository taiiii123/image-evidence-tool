<template>
  <div class="tabs-container">
    <div class="tabs-header">
      <div class="tabs-list" ref="tabsListRef">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab-button', { active: tab.id === activeTabId }]"
          @click="selectTab(tab.id)"
        >
          <input
            v-if="editingTabId === tab.id"
            v-model="editingTabName"
            @blur="finishEditing"
            @keyup.enter="finishEditing"
            @keyup.esc="cancelEditing"
            @click.stop
            class="tab-name-input"
            ref="tabNameInput"
            :maxlength="31"
          />
          <span v-else @dblclick="startEditing(tab)">{{ tab.name }}</span>
          <button
            v-if="tabs.length > 1"
            @click.stop="removeTab(tab.id)"
            class="tab-close-button"
            title="タブを削除"
          >
            ×
          </button>
        </button>
        <button @click="addNewTab" class="tab-add-button" title="新しいタブを追加">
          +
        </button>
      </div>
    </div>
    <div class="tabs-content">
      <slot :active-tab-id="activeTabId"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    required: true
  },
  activeTabId: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'update:activeTabId'])

const tabs = ref(props.modelValue)
const editingTabId = ref(null)
const editingTabName = ref('')
const tabNameInput = ref(null)

watch(() => props.modelValue, (newValue) => {
  tabs.value = newValue
}, { deep: true })

const selectTab = (tabId) => {
  emit('update:activeTabId', tabId)
}

const addNewTab = () => {
  // 既存のシート名から番号を抽出して、最大値+1を使用
  const existingNumbers = tabs.value
    .map(tab => {
      const match = tab.name.match(/^シート(\d+)$/)
      return match ? parseInt(match[1], 10) : 0
    })
    .filter(num => num > 0)

  const nextNumber = existingNumbers.length > 0
    ? Math.max(...existingNumbers) + 1
    : tabs.value.length + 1

  const newTab = {
    id: Date.now(),
    name: `シート${nextNumber}`,
    images: []
  }
  const updatedTabs = [...tabs.value, newTab]
  emit('update:modelValue', updatedTabs)
  emit('update:activeTabId', newTab.id)
}

const removeTab = (tabId) => {
  if (tabs.value.length === 1) return

  const updatedTabs = tabs.value.filter(tab => tab.id !== tabId)
  emit('update:modelValue', updatedTabs)

  if (props.activeTabId === tabId) {
    emit('update:activeTabId', updatedTabs[0].id)
  }
}

const startEditing = (tab) => {
  editingTabId.value = tab.id
  editingTabName.value = tab.name
  nextTick(() => {
    if (tabNameInput.value && tabNameInput.value[0]) {
      tabNameInput.value[0].focus()
      tabNameInput.value[0].select()
    }
  })
}

const finishEditing = () => {
  if (editingTabId.value !== null) {
    const trimmedName = editingTabName.value.trim()
    if (trimmedName) {
      const updatedTabs = tabs.value.map(tab =>
        tab.id === editingTabId.value
          ? { ...tab, name: trimmedName }
          : tab
      )
      emit('update:modelValue', updatedTabs)
    }
    editingTabId.value = null
    editingTabName.value = ''
  }
}

const cancelEditing = () => {
  editingTabId.value = null
  editingTabName.value = ''
}
</script>

<style scoped lang="scss">
.tabs-container {
  width: 100%;
}

.tabs-header {
  border-bottom: 2px solid var(--border-color);
  background-color: var(--background-secondary);
  padding: 0 1rem;
  position: relative;
}

.tabs-list {
  display: flex;
  gap: 0.25rem;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--border-color) transparent;
  padding-bottom: 2px;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
    margin: 0 0.5rem;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--border-color);
    border-radius: 3px;

    &:hover {
      background-color: var(--text-color-secondary);
    }
  }
}

.tab-button {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: var(--text-color);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: 100px;
  flex-shrink: 0;

  &:hover {
    background-color: var(--hover-background);
    border-bottom-color: var(--primary-color-light);
  }

  &.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
    background-color: var(--background-primary);
    font-weight: 600;
  }
}

.tab-name-input {
  background-color: var(--background-primary);
  border: 1px solid var(--primary-color);
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  color: var(--text-color);
  font-size: 0.9rem;
  font-weight: 500;
  outline: none;
  min-width: 80px;
  max-width: 200px;
}

.tab-close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  background-color: transparent;
  border: none;
  border-radius: 50%;
  color: var(--text-color-secondary);
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--danger-color);
    color: white;
  }
}

.tab-add-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin: 0.5rem 0;
  padding: 0;
  background-color: var(--primary-color);
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-size: 1.5rem;
  font-weight: bold;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-left: 0.5rem;

  &:hover {
    background-color: var(--primary-color-dark);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
}

.tabs-content {
  padding: 1.5rem;
}
</style>
