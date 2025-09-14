// ===================================================
// React Toastify Setup for PhotoMoments
// ===================================================

// Wait for React Toastify to be available
document.addEventListener('DOMContentLoaded', function() {
    // Create toast container if it doesn't exist
    if (!document.getElementById('toast-container')) {
        const toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    // Configure default toast options
    const toastConfig = {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        containerId: 'toast-container'
    };

    // Create wrapper functions for easier usage
    window.showToast = {
        success: (message, options = {}) => {
            ReactToastify.toast.success(message, {
                ...toastConfig,
                ...options,
                className: 'toast-success',
                progressClassName: 'toast-progress-success'
            });
        },

        error: (message, options = {}) => {
            ReactToastify.toast.error(message, {
                ...toastConfig,
                autoClose: 6000, // Longer for errors
                ...options,
                className: 'toast-error',
                progressClassName: 'toast-progress-error'
            });
        },

        warning: (message, options = {}) => {
            ReactToastify.toast.warn(message, {
                ...toastConfig,
                autoClose: 5000,
                ...options,
                className: 'toast-warning',
                progressClassName: 'toast-progress-warning'
            });
        },

        info: (message, options = {}) => {
            ReactToastify.toast.info(message, {
                ...toastConfig,
                ...options,
                className: 'toast-info',
                progressClassName: 'toast-progress-info'
            });
        },

        loading: (message, options = {}) => {
            return ReactToastify.toast.loading(message, {
                ...toastConfig,
                autoClose: false,
                closeOnClick: false,
                draggable: false,
                ...options,
                className: 'toast-loading',
            });
        },

        // Update existing toast (useful for loading states)
        update: (toastId, type, message, options = {}) => {
            ReactToastify.toast.update(toastId, {
                render: message,
                type: type,
                isLoading: false,
                autoClose: 4000,
                closeOnClick: true,
                draggable: true,
                ...options
            });
        },

        // Dismiss specific toast
        dismiss: (toastId) => {
            ReactToastify.toast.dismiss(toastId);
        },

        // Dismiss all toasts
        dismissAll: () => {
            ReactToastify.toast.dismiss();
        }
    };

    console.log('React Toastify initialized! 🍞');
});