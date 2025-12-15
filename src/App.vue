<template>
  <div id="app">
    <Toast />
    <ThemeToggle @toggle="toggleTheme" :dark-mode="darkMode" />

    <TheHeader
      v-model:image-width="imageWidth"
      v-model:image-height="imageHeight"
      v-model:row-spacing="rowSpacing"
      v-model:left-columns="leftColumns"
      v-model:top-rows="topRows"
      v-model:show-image-numbers="showImageNumbers"
      v-model:sort-order="sortOrder"
      :images-count="currentTabImages.length"
      @file-select="handleFileSelect"
      @sort="applySortOrder"
      @reset="resetSettings"
      @export="exportToExcel"
      @clear-all="clearAll"
    />

    <TabsContainer
      v-model="tabs"
      v-model:active-tab-id="activeTabId"
    >
      <template #default="{ activeTabId: currentTabId }">
        <div class="image-container">
          <div class="image-count-header">
            <span class="image-count-badge">📷 {{ currentTabImages.length }}枚</span>
          </div>

          <div v-if="currentTabImages.length === 0" class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3>エビデンス画像を追加してください</h3>
            <p>「📁 画像を選択」ボタンから画像ファイルを選択できます</p>
          </div>

          <ImageGrid
            v-else
            :images="currentTabImages"
            @update:images="updateCurrentTabImages($event)"
            @remove="removeImage"
            @open-lightbox="openLightbox"
          />
        </div>
      </template>
    </TabsContainer>

    <Modal
      v-if="showModal"
      :title="modalTitle"
      :message="modalMessage"
      @confirm="handleModalConfirm"
      @cancel="showModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import TheHeader from './components/TheHeader.vue'
import ImageGrid from './components/ImageGrid.vue'
import TabsContainer from './components/TabsContainer.vue'
import Toast from './components/Toast.vue'
import Modal from './components/Modal.vue'
import ThemeToggle from './components/ThemeToggle.vue'
import { useToast } from './composables/useToast'
import { useTheme } from './composables/useTheme'
import { useExcelExport } from './composables/useExcelExport'
import PhotoSwipe from 'photoswipe'

const { showToast } = useToast()
const { darkMode, toggleTheme } = useTheme()
const { exportToExcel: exportExcel } = useExcelExport()

// タブデータ
const tabs = ref([
  {
    id: Date.now(),
    name: 'シート1',
    images: []
  }
])
const activeTabId = ref(tabs.value[0].id)
const nextId = ref(1)

// 現在のタブの画像を取得
const currentTabImages = computed(() => {
  const currentTab = tabs.value.find(tab => tab.id === activeTabId.value)
  return currentTab ? currentTab.images : []
})

// 現在のタブの画像を更新
const updateCurrentTabImages = (newImages) => {
  tabs.value = tabs.value.map(tab =>
    tab.id === activeTabId.value
      ? { ...tab, images: newImages }
      : tab
  )
}

// 設定値
const imageWidth = ref(300)
const imageHeight = ref(200)
const rowSpacing = ref(2)
const leftColumns = ref(1)
const topRows = ref(1)
const showImageNumbers = ref(true)
const sortOrder = ref('name-asc')

// モーダル
const showModal = ref(false)
const modalTitle = ref('')
const modalMessage = ref('')
const modalCallback = ref(null)

// 連番表示の変更を監視して上余白の最小値を調整
watch(showImageNumbers, (newValue) => {
  if (newValue && topRows.value < 1) {
    topRows.value = 1
  }
})

// ファイル選択処理
const handleFileSelect = (files) => {
  const promises = []

  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      const promise = new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          resolve({
            id: nextId.value++,
            name: file.name,
            dataUrl: e.target.result,
            file: file,
            comment: ''
          })
        }
        reader.readAsDataURL(file)
      })
      promises.push(promise)
    }
  })

  Promise.all(promises).then(newImages => {
    const currentTab = tabs.value.find(tab => tab.id === activeTabId.value)
    if (currentTab) {
      currentTab.images.push(...newImages)
    }
    applySortOrder()

    // トースト通知を表示
    const count = newImages.length
    if (count > 0) {
      showToast(`${count}枚の画像をアップロードしました`, 'success')
    }
  })
}

// 並び替え実行
const applySortOrder = () => {
  const currentTab = tabs.value.find(tab => tab.id === activeTabId.value)
  if (!currentTab) return

  switch(sortOrder.value) {
    case 'name-asc':
      currentTab.images.sort((a, b) => {
        return a.name.localeCompare(b.name, undefined, {
          numeric: true,
          sensitivity: 'base'
        })
      })
      break
    case 'name-desc':
      currentTab.images.sort((a, b) => {
        return b.name.localeCompare(a.name, undefined, {
          numeric: true,
          sensitivity: 'base'
        })
      })
      break
    case 'date-desc':
      currentTab.images.sort((a, b) => {
        return b.file.lastModified - a.file.lastModified
      })
      break
    case 'date-asc':
      currentTab.images.sort((a, b) => {
        return a.file.lastModified - b.file.lastModified
      })
      break
    case 'size-desc':
      currentTab.images.sort((a, b) => {
        return b.file.size - a.file.size
      })
      break
    case 'size-asc':
      currentTab.images.sort((a, b) => {
        return a.file.size - b.file.size
      })
      break
  }
  showToast('画像を並び替えました', 'success')
}

// 設定リセット
const resetSettings = () => {
  imageWidth.value = 300
  imageHeight.value = 200
  rowSpacing.value = 2
  leftColumns.value = 1
  topRows.value = 1
  showImageNumbers.value = true
  sortOrder.value = 'name-asc'
  showToast('入力欄をデフォルトに戻しました', 'success')
}

// 画像削除
const removeImage = (id) => {
  const currentTab = tabs.value.find(tab => tab.id === activeTabId.value)
  if (currentTab) {
    currentTab.images = currentTab.images.filter(img => img.id !== id)
  }
}

// すべてクリア
const clearAll = () => {
  modalTitle.value = '確認'
  modalMessage.value = '現在のタブの画像とコメントをすべて削除してもよろしいですか?'
  modalCallback.value = () => {
    const currentTab = tabs.value.find(tab => tab.id === activeTabId.value)
    if (currentTab) {
      currentTab.images = []
    }
    showModal.value = false
  }
  showModal.value = true
}

// モーダル確認
const handleModalConfirm = () => {
  if (modalCallback.value) {
    modalCallback.value()
  }
}

// Lightbox表示
const openLightbox = (index) => {
  const items = currentTabImages.value.map(img => ({
    src: img.dataUrl,
    width: 1920,
    height: 1080,
    alt: img.name
  }))

  try {
    const pswp = new PhotoSwipe({
      dataSource: items,
      index: index,
      bgOpacity: 0.9,
      spacing: 0.1,
      allowPanToNext: true,
      loop: true,
      pinchToClose: true,
      closeOnVerticalDrag: true,
      escKey: true,
      arrowKeys: true,
      returnFocus: false,
      clickToCloseNonZoomable: true,
      imageClickAction: 'zoom',
      tapAction: 'toggle-controls',
      doubleTapAction: 'zoom',
      zoom: true,
      maxZoomLevel: 4,
      initialZoomLevel: 'fit',
      secondaryZoomLevel: 2,
      mouseMovePan: true
    })

    pswp.init()
  } catch (error) {
    console.error('Error initializing PhotoSwipe:', error)
    showToast('画像の拡大表示に失敗しました: ' + error.message, 'error')
  }
}

// Excel出力
const exportToExcel = async () => {
  try {
    await exportExcel(
      tabs.value,
      {
        imageWidth: imageWidth.value,
        imageHeight: imageHeight.value,
        rowSpacing: rowSpacing.value,
        leftColumns: leftColumns.value,
        topRows: topRows.value,
        showImageNumbers: showImageNumbers.value
      }
    )
    showToast('Excelエビデンスファイルのダウンロードを開始しました!', 'success')
  } catch (error) {
    console.error('Excel出力エラー:', error)
    showToast('Excelファイルの作成に失敗しました。エラー: ' + error.message, 'error')
  }
}
</script>

<style lang="scss">
@use './assets/styles/main.scss';
</style>
