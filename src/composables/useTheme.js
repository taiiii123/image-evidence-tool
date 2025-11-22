import { ref, onMounted } from 'vue'
import { useToast } from './useToast'

export function useTheme() {
  const darkMode = ref(false)
  const { showToast } = useToast()

  const toggleTheme = () => {
    darkMode.value = !darkMode.value
    if (darkMode.value) {
      document.body.classList.add('dark-mode')
      localStorage.setItem('theme', 'dark')
      showToast('ダークモードに切り替えました', 'success')
    } else {
      document.body.classList.remove('dark-mode')
      localStorage.setItem('theme', 'light')
      showToast('ライトモードに切り替えました', 'success')
    }
  }

  const loadTheme = () => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      darkMode.value = true
      document.body.classList.add('dark-mode')
    }
  }

  onMounted(() => {
    loadTheme()
  })

  return {
    darkMode,
    toggleTheme
  }
}
