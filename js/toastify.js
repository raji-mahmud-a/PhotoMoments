
// ===================================================
// 2. js/toastify.js
// ===================================================

// Enhanced Toastify wrapper for better UX
window.toast = {
    success: function(message, options = {}) {
        Toastify({
            text: message,
            duration: options.duration || 4000,
            close: true,
            gravity: "top",
            position: "right",
            style: {
                background: "linear-gradient(135deg, #10b981, #059669)",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500"
            },
            onClick: function(){} // Callback after click
        }).showToast();
    },
    
    error: function(message, options = {}) {
        Toastify({
            text: message,
            duration: options.duration || 6000,
            close: true,
            gravity: "top",
            position: "right",
            style: {
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500"
            },
            onClick: function(){}
        }).showToast();
    },
    
    warning: function(message, options = {}) {
        Toastify({
            text: message,
            duration: options.duration || 5000,
            close: true,
            gravity: "top",
            position: "right",
            style: {
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500"
            },
            onClick: function(){}
        }).showToast();
    },
    
    info: function(message, options = {}) {
        Toastify({
            text: message,
            duration: options.duration || 4000,
            close: true,
            gravity: "top",
            position: "right",
            style: {
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500"
            },
            onClick: function(){}
        }).showToast();
    },
    
    loading: function(message) {
        return Toastify({
            text: `⏳ ${message}`,
            duration: -1, // Persistent
            close: true,
            gravity: "top",
            position: "right",
            style: {
                background: "linear-gradient(135deg, #6b7280, #4b5563)",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500"
            }
        }).showToast();
    }
};

console.log('Toastify wrapper loaded!');
