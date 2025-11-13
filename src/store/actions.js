import axiosClient from "../axios";

export function getUser({commit}, data) {
  return axiosClient.get('/auth/me', data)
    .then(({data}) => {
      commit('setUser', data);
      return data;
    })
}

export function login({commit}, data) {
  return axiosClient.post('/auth/login', data)
    .then(({data}) => {
      commit('setUser', data.user);
      commit('setToken', data.token)
      return data;
    })
}

export function logout({commit}) {
  return axiosClient.post('/auth/logout')
    .then((response) => {
      commit('setToken', null)

      return response;
    })
}

export function getProducts({commit, state}, {url = null, search = '', per_page, sort_field, sort_direction} = {}) {
  commit('setProducts', [true])
  
  // If url is full URL with query params, don't add extra params
  const hasQueryParams = url && url.includes('?');
  
  // Base URL if no URL passed
  url = url || '/product/getAllProducts';
  
  // Build params only if url doesn't already contain them
  const params = hasQueryParams ? {} : {
    search,
    per_page: per_page || state.products.limit,
    sort_field,
    sort_direction
  };
  
  return axiosClient.get(url, { params })
    .then((response) => {
      commit('setProducts', [false, response.data])
    })
    .catch(() => {
      commit('setProducts', [false])
    })
}


export function getProduct({commit}, id) {
  return axiosClient.get(`/product/detail/${id}`)
}

export function  createProduct({commit}, product) {
  if (product.image instanceof File) {
    const form = new FormData();
    form.append('name', product.name);
    form.append('image', product.image);
    form.append('description', product.description);
    form.append('price', product.price);
    form.append('cost', product.cost);
    form.append('status', product.status);
    form.append('category_id', product.category_id);
    form.append('created_by', product.created_by);
    form.append('updated_by', product.updated_by);

    product = form;
  }
  return axiosClient.post('/product/create', product)
}

export function updateProduct({commit}, product) {
  const id = product._id
  if (product.image instanceof File) {
    const form = new FormData();
    form.append('id', product._id);
    form.append('name', product.name);
    form.append('image', product.image);
    form.append('description', product.description);
    form.append('price', product.price);
    form.append('cost', product.cost);
    form.append('status', product.status);
    form.append('category_id', product.category_id);
    form.append('created_by', product.created_by);
    form.append('updated_by', product.updated_by);
    product = form;
  }
  return axiosClient.put(`/product/update/${id}`, product)
}

export function deleteProduct({commit}, _id) {
  return axiosClient.delete(`/product/delete/${_id}`)
}

export function getCategories({commit, state}, {url = null, search = '', per_page, sort_field, sort_direction} = {}) {
  commit('setCategories', [true])
  
  // If url is full URL with query params, don't add extra params
  const hasQueryParams = url && url.includes('?');
  
  // Base URL if no URL passed
  url = url || '/category/getAllCategories';
  
  // Build params only if url doesn't already contain them
  const params = hasQueryParams ? {} : {
    search,
    per_page: per_page || state.categories.limit,
    sort_field,
    sort_direction
  };
  
  return axiosClient.get(url, { params })
    .then((response) => {
      commit('setCategories', [false, response.data])
    })
    .catch(() => {
      commit('setCategories', [false])
    })
}

export function getCategory({commit}, id) {
  return axiosClient.get(`/category/detail/${id}`)
}

export function createCategory({commit}, category) {
  if (category.image instanceof File) {
    const form = new FormData();
    form.append('name', category.name);
    form.append('description', category.description);

    category = form;
  }

  return axiosClient.post('/category/create', category)
}

export function updateCategory({commit}, category) {
  const id = category._id
  if (category.image instanceof File) {
    const form = new FormData();
    form.append('id', category._id);
    form.append('name', category.description);
    form.append('description', category.description);
    category = form;
  }
  return axiosClient.put(`/category/update/${id}`, category)
}

export function deleteCategory({commit}, _id) {
  return axiosClient.delete(`/category/delete/${_id}`)
}

export function getUsers({commit, state}, { url = null, search = '', per_page, sort_field, sort_direction} = {}) {
  commit('setUsers', [true])

  const hasQueryParams = url && url.includes('?');
  url = url || '/user/getAllUsers';
  const params = hasQueryParams ? {} : {
    search,
    per_page: per_page || state.users.limit,
    sort_field,
    sort_direction
  };

  return axiosClient.get(url, { params })
    .then((response) => {
      commit('setUsers', [false, response.data])
    })
    .catch(() => {
      commit('setUsers', [false])
    })
}

export function getUserDetail({commit}, id) {
  return axiosClient.get(`/user/detail/${id}`)
}

export function createUser({commit}, user) {
  if (user.image instanceof File) {
    const form = new FormData();
    form.append('username', user.username);
    form.append('password', user.password);
    form.append('full_name', user.full_name);
    form.append('image', user.image);
    form.append('role', user.role);

    user = form;
  }

  return axiosClient.post('/user/create', user)
}

export function updateUser({commit}, user) {
  const id = user._id;
  if (user.image instanceof File) {
    const form = new FormData();
    form.append('id', user._id);
    form.append('username', user.username);
    form.append('password', user.password);
    form.append('full_name', user.full_name);
    form.append('image', user.image);
    form.append('role', user.role);

    user = form;
  }
  return axiosClient.put(`/user/update/${id}`, user);
}

export function deleteUser({commit}, id) {
  return axiosClient.delete(`/user/delete/${id}`);
}