import axiosClient from "../axios";

export function getDashboard({ commit }, data) {
  return axiosClient
    .get("/report/overview")
    .then(({ data }) => {
      return data;
    })
    .catch((err) => {

    });
}

export function getUser({ commit }, data) {
  return axiosClient.get("/auth/me", data).then(({ data }) => {
    commit("setUser", data);
    return data;
  });
}

export function login({ commit }, data) {
  return axiosClient.post("/auth/login", data).then(({ data }) => {
    commit("setUser", data.user);
    commit("setToken", data.accessToken || data.token);
    return data;
  });
}

export function logout({ commit }) {
  return axiosClient.post("/auth/logout").then((response) => {
    commit("setToken", null);

    return response;
  });
}

export function getOrders({ commit }, params) {
  return axiosClient
    .get(
      `order/list?page=${params?.page}&size=${params?.pageSize}&startDate=${params?.startDate}&endDate=${params?.endDate}`
    )
    .then(({ data }) => {
      return data;
    })
    .catch((err) => {

    });
}

export function getOrderDetail({ commit }, orderId) {
  return axiosClient
    .get(`/order/detail/${orderId}`)
    .then(({ data }) => {
      return data;
    })
    .catch((err) => {
      console.error("Get Order Detail Fail", err);
    });
}

export function getOrdersPDF({ commit }, params) {
  return axiosClient
    .get(
      `/order/pdf?startDate=${params?.startDate}&endDate=${params?.endDate}`,
      { responseType: "blob" }
    )
    .then(({ data }) => {

      return data;
    })
    .catch((err) => {

    });
}
export function getOrdersReceitPDF({ commit }, params) {
  return axiosClient
    .get(`/order/receipt/${params?.orderID}`, { responseType: "blob" })
    .then(({ data }) => {
      console.log("data", data);
      return data;
    })
    .catch(() => {
      console.log("Get Order Receipt PDF Fail", data);
    });
}

export function getOrdersExcel({ commit }, params) {
  return axiosClient
    .get(
      `/order/excel?startDate=${params?.startDate}&endDate=${params?.endDate}`,
      { responseType: "blob" }
    )
    .then(({ data }) => {
      return data;
    })
    .catch((err) => {

    });
}

export function getProducts({ commit }, params) {
  let url = `/product/list?page=${params?.page}&size=${params?.pageSize}`;
  if (params?.category_id) {
    url += `&category_id=${params.category_id}`;
  }
  return axiosClient
    .get(url)
    .then(({ data }) => {
      return data;
    })
    .catch((err) => {

    });
}

export function getProductDetail({ commit }, params) {
  return axiosClient
    .get(`/product/detail/${params?.id}`)
    .then(({ data }) => {
      return data;
    })
    .catch((err) => {

    });
}

// Only appends a field if it has a real value — prevents "" from
// being sent for ObjectId fields, which crashes the Mongoose cast.
function appendIfPresent(form, key, value) {
  if (value === null || value === undefined || value === "") {
    return;
  }
  form.append(key, value);
}

export function createProduct({ commit }, product) {
  const form = new FormData();
  appendIfPresent(form, "image", product.image);
  appendIfPresent(form, "category_id", product.category);
  appendIfPresent(form, "type_of_wood_id", product.wood_type);
  appendIfPresent(form, "end_grain_of_wood_id", product.wood_grain);
  appendIfPresent(form, "length_of_wood_id", product.wood_length);
  appendIfPresent(form, "cost_of_each", product.cost);
  appendIfPresent(form, "number_of_wood", product.quantity);
  appendIfPresent(form, "total_price_of_wood", product.total_price);
  appendIfPresent(form, "price_of_each", product.price);
  appendIfPresent(form, "price_per_kube", product.price_per_kube);
  appendIfPresent(form, "cost_per_kube", product.cost_per_kube);
  appendIfPresent(form, "total_cube", product.total_cube);
  form.append("car_fee", 5);

  return axiosClient
    .post("/product/create", form)
    .then(({ data }) => {
      return data;
    })
    .catch((err) => {
      console.error("Create Product Fail", err);
      throw err;
    });
}

export function updateProduct({ commit }, product) {
  const form = new FormData();
  appendIfPresent(form, "image", product.image);
  appendIfPresent(form, "category_id", product.category);
  appendIfPresent(form, "type_of_wood_id", product.wood_type);
  appendIfPresent(form, "end_grain_of_wood_id", product.wood_grain);
  appendIfPresent(form, "length_of_wood_id", product.wood_length);
  appendIfPresent(form, "cost_of_each", product.cost);
  appendIfPresent(form, "number_of_wood", product.quantity);
  appendIfPresent(form, "total_price_of_wood", product.total_price);
  appendIfPresent(form, "price_of_each", product.price);
  appendIfPresent(form, "price_per_kube", product.price_per_kube);
  appendIfPresent(form, "cost_per_kube", product.cost_per_kube);
  appendIfPresent(form, "total_cube", product.total_cube);
  form.append("car_fee", 5);

  return axiosClient
    .put(`/product/update/${product?.id}`, form)
    .then(({ data }) => {
      return data;
    })
    .catch((err) => {
      console.error("Update Product Fail", err);
      throw err;
    });
}

export function deleteProduct({ commit }, productId) {
  return axiosClient
    .delete(`/product/delete/${productId}`)
    .then(({ data }) => {
      return data;
    })
    .catch((err) => {

    });
}

export function getWoodTypes({ commit }, params) {
  return axiosClient
    .get(`/type-of-wood/list?page=${params?.page}&size=${params?.pageSize}`)
    .then(({ data }) => {
      return data;
    })
    .catch((err) => {

    });
}

export function createWoodType({ commit }, params) {
  return axiosClient
    .post("/type-of-wood/create", params)
    .then(({ data }) => {
      return data;
    })
    .catch((err) => {

    });
}

export function updateWoodType({ commit }, params) {
  return axiosClient
    .put(`/type-of-wood/update/${params.id}`, params)
    .then(({ data }) => {
      return data;
    })
    .catch((err) => {

    });
}

export function deleteWoodType({ commit }, woodTypeId) {
  return axiosClient
    .delete(`/type-of-wood/delete/${woodTypeId}`)
    .then(({ data }) => {
      return data;
    })
    .catch((err) => {

    });
}

export function getWoodGrains({ commit }, params) {
  return axiosClient
    .get(
      `/end-grain-of-wood/list?page=${params?.page}&size=${params?.pageSize}`
    )
    .then(({ data }) => {
      return data;
    })
    .catch((err) => {

    });
}

export function createWoodGrain({ commit }, params) {
  return axiosClient
    .post("/end-grain-of-wood/create", params)
    .then(({ data }) => {
      return data;
    })
    .catch((err) => {

    });
}

export function updateWoodGrain({ commit }, params) {
  return axiosClient
    .put(`/end-grain-of-wood/update/${params.id}`, params)
    .then(({ data }) => {
      return data;
    })
    .catch((err) => {

    });
}

export function deleteWoodGrain({ commit }, woodLengthId) {
  return axiosClient
    .delete(`/end-grain-of-wood/delete/${woodLengthId}`)
    .then(({ data }) => {
      return data;
    })
    .catch((err) => {

    });
}

export function getWoodLengths({ commit }, params) {
  return axiosClient
    .get(`/length-of-wood/list?page=${params?.page}&size=${params?.pageSize}`)
    .then(({ data }) => {
      return data;
    })
    .catch((err) => {

    });
}

export function createWoodLength({ commit }, params) {
  return axiosClient
    .post("/length-of-wood/create", params)
    .then(({ data }) => {
      return data;
    })
    .catch((err) => {

    });
}

export function updateWoodLength({ commit }, params) {
  return axiosClient
    .put(`/length-of-wood/update/${params.id}`, params)
    .then(({ data }) => {
      return data;
    })
    .catch((err) => {

    });
}

export function deleteWoodLength({ commit }, woodLengthId) {
  return axiosClient
    .delete(`/length-of-wood/delete/${woodLengthId}`)
    .then(({ data }) => {
      return data;
    })
    .catch((err) => {

    });
}

export function getUsers({ commit }, params) {
  return axiosClient
    .get(`/user/list?page=${params?.page}&size=${params?.pageSize}`)
    .then(({ data }) => {
      return data;
    })
    .catch((err) => {

    });
}

export function createOrder({ commit }, params) {
  return axiosClient
    .post("/order/create", params)
    .then(({ data }) => {
      return data;
    })
    .catch((err) => {

    });
}

export function createStockIn({ commit }, params) {
  return axiosClient
    .post("/order/sync-stock", params)
    .then(({ data }) => {
      return data;
    })
    .catch((err) => {

    });
}

export function downloadStockIn({ commit }, params) {
  return axiosClient
    .get(`/stock/stock-sync/${params?.stockInID}/pdf`, { responseType: "blob" })
    .then(({ data }) => {
      return data;
    })
    .catch((err) => {

    });
}

export function getStockInHistory({ commit }, params) {
  return axiosClient
    .get(
      `/stock/stock-syncs?page=${params?.page}&size=${params?.pageSize}&startDate=${params?.startDate}&endDate=${params?.endDate}`
    )
    .then(({ data }) => {
      return data;
    })
    .catch((err) => {

    });
}

export function getStockInHistoryDetail({ commit }, params) {
  return axiosClient
    .get(`/stock/stock-sync/${params?.stockInID}`)
    .then(({ data }) => {
      return data;
    })
    .catch((err) => {

    });
}

export function createUser({ commit }, user) {
  const form = new FormData();
  form.append("image", user.image);
  form.append("name", user.name);
  form.append("username", user.username);
  form.append("password", user.password);
  user = form;
  return axiosClient
    .post("/user/create", user)
    .then(({ data }) => {
      return data;
    })
    .catch((err) => {

    });
}

export function getUserDetail({ commit }, id) {
  return axiosClient.get(`/user/detail/${id}`);
}

export function updateUser({ commit }, userObj) {
  const id = userObj.id;

  const form = new FormData();
  form.append("id", userObj.id);
  form.append("name", userObj.name);
  form.append("username", userObj.username);
  form.append("password", userObj.password);
  form.append("image", userObj.image);

  return axiosClient.put(`/user/update/${id}`, form);
}

export function deleteUser({ commit }, id) {
  return axiosClient.delete(`/user/delete/${id}`);
}

export function getCategories({ commit }, params) {
  return axiosClient
    .get(`/category/list?page=${params?.page}&size=${params?.pageSize}`)
    .then(({ data }) => {
      return data;
    })
    .catch((err) => {

    });
}

export function createCategory({ commit }, params) {
  return axiosClient
    .post("/category/create", params)
    .then(({ data }) => {
      return data;
    })
    .catch((err) => {

    });
}

export function updateCategory({ commit }, params) {
  return axiosClient
    .put(`/category/update/${params.id}`, params)
    .then(({ data }) => {
      return data;
    })
    .catch((err) => {

    });
}

export function deleteCategory({ commit }, woodTypeId) {
  return axiosClient
    .delete(`/category/delete/${woodTypeId}`)
    .then(({ data }) => {
      return data;
    })
    .catch((err) => {

    });
}