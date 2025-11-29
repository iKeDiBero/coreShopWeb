export const API_BASE_URL = 'http://localhost:8081/api';

export const AUTH_ENDPOINTS = {
    LOGIN: `${API_BASE_URL}/auth/login`
};

export const USER_ENDPOINTS = {
    PROFILE: `${API_BASE_URL}/user/profile`
};

export const PRODUCT_ENDPOINTS = {
    LIST: `${API_BASE_URL}/products`
};

export const CART_ENDPOINTS = {
    CHECK_EXISTS: `${API_BASE_URL}/carts/user/exists`,
    CREATE: `${API_BASE_URL}/carts`,
    UPDATE: `${API_BASE_URL}/carts`
};

export const ORDER_ENDPOINTS = {
    CREATE_FROM_CART: `${API_BASE_URL}/orders/from-cart`,
    GET_ALL: `${API_BASE_URL}/orders`,
    PAYMENT_CALLBACK: `${API_BASE_URL}/orders/payment-callback`
};
