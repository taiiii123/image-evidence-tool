<template>
  <div class="header">
    <h1>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 2C7.89543 2 7 2.89543 7 4V20C7 21.1046 7.89543 22 9 22H18C19.1046 22 20 21.1046 20 20V7.41421C20 6.88378 19.7893 6.37507 19.4142 6L16 2.58579C15.6249 2.21071 15.1162 2 14.5858 2H9Z" stroke="#3b82f6" stroke-width="2"/>
        <path d="M7 8H4C2.89543 8 2 8.89543 2 10V20C2 21.1046 2.89543 22 4 22H7" stroke="#3b82f6" stroke-width="2"/>
        <path d="M11 11H16M11 15H16" stroke="#3b82f6" stroke-width="2" stroke-linecap="round"/>
      </svg>
      エビデンス作成ツール
    </h1>

    <div class="controls">
      <div class="control-group">
        <label for="imageWidth">画像幅:</label>
        <input
          type="number"
          id="imageWidth"
          :value="imageWidth"
          @input="$emit('update:imageWidth', Number($event.target.value))"
          step="10"
        >
        <span>px</span>
      </div>

      <div class="control-group">
        <label for="imageHeight">画像高さ:</label>
        <input
          type="number"
          id="imageHeight"
          :value="imageHeight"
          @input="$emit('update:imageHeight', Number($event.target.value))"
          step="10"
        >
        <span>px</span>
      </div>

      <div class="control-group">
        <label for="rowSpacing">行間:</label>
        <input
          type="number"
          id="rowSpacing"
          :value="rowSpacing"
          @input="$emit('update:rowSpacing', Number($event.target.value))"
          step="1"
        >
        <span>行</span>
      </div>

      <div class="control-group">
        <label for="leftColumns">左余白:</label>
        <input
          type="number"
          id="leftColumns"
          :value="leftColumns"
          @input="$emit('update:leftColumns', Number($event.target.value))"
          step="1"
        >
        <span>列</span>
      </div>

      <div class="control-group">
        <label for="topRows">上余白:</label>
        <input
          type="number"
          id="topRows"
          :value="topRows"
          @input="$emit('update:topRows', Number($event.target.value))"
          step="1"
        >
        <span>行</span>
      </div>
    </div>

    <div class="controls">
      <div class="control-group">
        <label>
          <input
            type="checkbox"
            :checked="showImageNumbers"
            @change="$emit('update:showImageNumbers', $event.target.checked)"
          >
          連番を付ける
        </label>
      </div>

      <div class="control-group">
        <label for="sortOrder">並び順:</label>
        <select
          id="sortOrder"
          :value="sortOrder"
          @change="$emit('update:sortOrder', $event.target.value)"
        >
          <option value="name-asc">ファイル名順(昇順)</option>
          <option value="name-desc">ファイル名順(降順)</option>
          <option value="date-desc">更新日時順(新しい→古い)</option>
          <option value="date-asc">更新日時順(古い→新しい)</option>
          <option value="size-desc">ファイルサイズ順(大きい→小さい)</option>
          <option value="size-asc">ファイルサイズ順(小さい→大きい)</option>
        </select>
      </div>

      <button @click="$emit('sort')" :disabled="imagesCount === 0" class="btn btn-secondary">
        並び替え実行
      </button>

      <button @click="$emit('reset')" class="btn btn-secondary">
        入力欄をデフォルトに戻す
      </button>
    </div>

    <div class="controls">
      <label for="fileInput" class="btn btn-primary">
        📁 画像を選択
      </label>
      <input
        type="file"
        id="fileInput"
        @change="handleFileInput"
        multiple
        accept="image/*"
        ref="fileInputRef"
      >

      <button @click="$emit('export')" :disabled="imagesCount === 0" class="btn btn-success">
        📥 Excelエビデンス出力
      </button>

      <button @click="$emit('clear-all')" :disabled="imagesCount === 0" class="btn btn-danger">
        🗑️ すべてクリア
      </button>
    </div>

    <div class="usage-section">
      <div class="usage-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"></circle>
        </svg>
        使い方
      </div>
      <ul class="usage-list">
        <li>画像を選択して追加</li>
        <li>ドラッグ&ドロップで並び替え</li>
        <li>各画像にコメント(説明・備考)を記入</li>
        <li>Excelエビデンス出力でダウンロード</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  imageWidth: Number,
  imageHeight: Number,
  rowSpacing: Number,
  leftColumns: Number,
  topRows: Number,
  showImageNumbers: Boolean,
  sortOrder: String,
  imagesCount: Number
})

const emit = defineEmits([
  'update:imageWidth',
  'update:imageHeight',
  'update:rowSpacing',
  'update:leftColumns',
  'update:topRows',
  'update:showImageNumbers',
  'update:sortOrder',
  'file-select',
  'sort',
  'reset',
  'export',
  'clear-all'
])

const fileInputRef = ref(null)

const handleFileInput = (event) => {
  const files = Array.from(event.target.files)
  emit('file-select', files)
  // リセット
  event.target.value = ''
}
</script>

<style scoped lang="scss">
input[type="file"] {
  display: none;
}
</style>
