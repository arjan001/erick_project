import Swal from 'sweetalert2'

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
})

export const notifySuccess = (title, text) => Toast.fire({ icon: 'success', title, text })
export const notifyError = (title, text) => Toast.fire({ icon: 'error', title, text })
export const notifyInfo = (title, text) => Toast.fire({ icon: 'info', title, text })

export const confirmDialog = async (title, text, confirmButtonText = 'Yes, delete it') => {
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText,
    confirmButtonColor: '#111827',
    cancelButtonColor: '#9ca3af',
  })
  return result.isConfirmed
}