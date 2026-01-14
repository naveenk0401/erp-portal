import api from './api';

export const customerApi = {
  list: (params?: any) => api.get('/customers/', { params }),
  get: (id: string) => api.get(`/customers/${id}`),
  create: (data: any) => api.post('/customers/', data),
  update: (id: string, data: any) => api.patch(`/customers/${id}`, data),
  deactivate: (id: string) => api.delete(`/customers/${id}`),
};

export const vendorApi = {
  list: (params?: any) => api.get('/vendors/', { params }),
  get: (id: string) => api.get(`/vendors/${id}`),
  create: (data: any) => api.post('/vendors/', data),
  update: (id: string, data: any) => api.patch(`/vendors/${id}`, data),
  deactivate: (id: string) => api.delete(`/vendors/${id}`),
};

export const itemApi = {
  list: (params?: any) => api.get('/items/', { params }),
  get: (id: string) => api.get(`/items/${id}`),
  create: (data: any) => api.post('/items/', data),
  update: (id: string, data: any) => api.patch(`/items/${id}`, data),
  deactivate: (id: string) => api.delete(`/items/${id}`),
};

export const categoryApi = {
  list: (params?: any) => api.get('/categories/', { params }),
  create: (data: any) => api.post('/categories/', data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

export const taxApi = {
  list: (params?: any) => api.get('/taxes/', { params }),
  create: (data: any) => api.post('/taxes/', data),
  update: (id: string, data: any) => api.patch(`/taxes/${id}`, data),
  deactivate: (id: string) => api.delete(`/taxes/${id}`),
};

export const priceListApi = {
  list: (params?: any) => api.get('/price-lists/', { params }),
  get: (id: string) => api.get(`/price-lists/${id}`),
  create: (data: any) => api.post('/price-lists/', data),
  update: (id: string, data: any) => api.patch(`/price-lists/${id}`, data),
  deactivate: (id: string) => api.delete(`/price-lists/${id}`),
};
