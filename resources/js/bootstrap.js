import axios from 'axios';

window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// CSRF token support for Laravel (required for POST /checkout/validate-promo, etc.)
const tokenMeta = document.querySelector('meta[name="csrf-token"]');
if (tokenMeta) {
    const token = tokenMeta.getAttribute('content');
    if (token) {
        window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
    }
}
