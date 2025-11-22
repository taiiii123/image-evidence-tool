export function useToast() {
  const showToast = (message, type = 'success') => {
    const container = document.getElementById('toast-container')
    if (!container) return

    const toast = document.createElement('div')
    toast.className = `toast toast-${type}`

    const icon = type === 'success' ? '✓' : '✕'

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">${message}</div>
      <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `

    container.appendChild(toast)

    setTimeout(() => {
      toast.classList.add('toast-exit')
      setTimeout(() => {
        if (toast.parentElement) {
          toast.remove()
        }
      }, 300)
    }, 5000)
  }

  return {
    showToast
  }
}
