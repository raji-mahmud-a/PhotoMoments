// ===================================================
// Toastify-js Setup for PhotoMoments
// ===================================================

document.addEventListener('DOMContentLoaded', function() {
    // Configure default toast options
    const toastConfig = {
        position: "right",
        gravity: "top",
        duration: 4000,
        close: true,
        stopOnFocus: true,
        className: "",
    };

    // Create wrapper functions for easier usage
    window.showToast = {
        success: (message, options = {}) => {
            Toastify({
                ...toastConfig,
                ...options,
                text: message,
                className: 'toast-success',
                style: {
                    background: "#4caf50"
                }
            }).showToast();
        },

        error: (message, options = {}) => {
            Toastify({
                ...toastConfig,
                duration: 6000, // Longer for errors
                ...options,
                text: message,
                className: 'toast-error',
                style: {
                    background: "#f44336"
                }
            }).showToast();
        },

        warning: (message, options = {}) => {
            Toastify({
                ...toastConfig,
                duration: 5000,
                ...options,
                text: message,
                className: 'toast-warning',
                style: {
                    background: "#ff9800"
                }
            }).showToast();
        },

        info: (message, options = {}) => {
            Toastify({
                ...toastConfig,
                ...options,
                text: message,
                className: 'toast-info',
                style: {
                    background: "#2196f3"
                }
            }).showToast();
        },

        loading: (message, options = {}) => {
            return Toastify({
                ...toastConfig,
                duration: -1, // Won't auto-close
                ...options,
                text: message,
                className: 'toast-loading',
                style: {
                    background: "#9e9e9e"
                }
            }).showToast();
        },

        // Update existing toast (simplified version)
        update: (toastInstance, type, message, options = {}) => {
            if (toastInstance) {
                toastInstance.hideToast();
            }
            // Show new toast with updated message
            return window.showToast[type](message, options);
        },

        // Dismiss specific toast
        dismiss: (toastInstance) => {
            if (toastInstance) {
                toastInstance.hideToast();
            }
        },

        // Dismiss all toasts (Toastify-js doesn't have this built-in)
        dismissAll: () => {
            const toasts = document.querySelectorAll('.toastify');
            toasts.forEach(toast => {
                toast.remove();
            });
        }
    };

    console.log('Toastify initialized! 🍞');
});