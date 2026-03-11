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
    commit("setToken", data.token);
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
  return axiosClient
    .get(`/product/list?page=${params?.page}&size=${params?.pageSize}`)
    .then(({ data }) => {
      return data;
    })
    .catch((err) => {

    });
}

export function createProduct({ commit }, product) {
  const form = new FormData();
  form.append("image", product.image);
  form.append("type_of_wood_id", product.wood_type);
  form.append("end_grain_of_wood_id", product.wood_grain);
  form.append("length_of_wood_id", product.wood_length);
  form.append("cost_of_each", product.cost);
  form.append("number_of_wood", product.quantity);
  form.append("total_price_of_wood", product.total_price);
  form.append("price_of_each", product.price);
  form.append("car_fee", 5);
  product = form;
  return axiosClient
    .post("/product/create", product)
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

export function updateProduct({ commit }, product) {
  const form = new FormData();
  form.append("image", product.image);
  form.append("type_of_wood_id", product.wood_type);
  form.append("end_grain_of_wood_id", product.wood_grain);
  form.append("length_of_wood_id", product.wood_length);
  form.append("cost_of_each", product.cost);
  form.append("number_of_wood", product.quantity);
  form.append("total_price_of_wood", product.total_price);
  form.append("price_of_each", product.price);
  form.append("car_fee", 5);


  return axiosClient
    .put(`/product/update/${product?.id}`, form)
    .then(({ data }) => {
      return data;
    })
    .catch((err) => {

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
