import axiosClient from "../axios";

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

export function getProducts({ commit }, params) {
  return axiosClient
    .get(`/product/list?page=${params?.page}&size=${params?.pageSize}`)
    .then(({ data }) => {
      return data;
    })
    .catch(() => {
      console.log("Get All Products Fail", data);
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
    .catch(() => {
      console.log("Create Product Fail", data);
    });
}

export function getProductDetail({ commit }, params) {
  return axiosClient
    .get(`/product/detail/${params?.id}`)
    .then(({ data }) => {
      return data;
    })
    .catch(() => {
      console.log("Get All Products Fail", data);
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

  console.log("product", product);
  return axiosClient
    .put(`/product/update/${product?.id}`, form)
    .then(({ data }) => {
      return data;
    })
    .catch(() => {
      console.log("Create Product Fail", data);
    });
}

export function deleteProduct({ commit }, productId) {
  return axiosClient
    .delete(`/product/delete/${productId}`)
    .then(({ data }) => {
      return data;
    })
    .catch(() => {
      console.log("Delete Product Fail", data);
    });
}

export function getWoodTypes({ commit }, params) {
  return axiosClient
    .get(`/type-of-wood/list?page=${params?.page}&size=${params?.pageSize}`)
    .then(({ data }) => {
      return data;
    })
    .catch(() => {
      console.log("Get All Wood Types Fail", data);
    });
}

export function createWoodType({ commit }, params) {
  return axiosClient
    .post("/type-of-wood/create", params)
    .then(({ data }) => {
      return data;
    })
    .catch(() => {
      console.log("Create Wood Type Fail", data);
    });
}

export function updateWoodType({ commit }, params) {
  return axiosClient
    .put(`/type-of-wood/update/${params.id}`, params)
    .then(({ data }) => {
      return data;
    })
    .catch(() => {
      console.log("Update Wood Type Fail", data);
    });
}

export function deleteWoodType({ commit }, woodTypeId) {
  return axiosClient
    .delete(`/type-of-wood/delete/${woodTypeId}`)
    .then(({ data }) => {
      return data;
    })
    .catch(() => {
      console.log("Delete Wood Type Fail", data);
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
    .catch(() => {
      console.log("Get All Wood End Grain Fail", data);
    });
}

export function createWoodGrain({ commit }, params) {
  return axiosClient
    .post("/end-grain-of-wood/create", params)
    .then(({ data }) => {
      return data;
    })
    .catch(() => {
      console.log("Create Wood End Grain Fail", data);
    });
}

export function updateWoodGrain({ commit }, params) {
  return axiosClient
    .put(`/end-grain-of-wood/update/${params.id}`, params)
    .then(({ data }) => {
      return data;
    })
    .catch(() => {
      console.log("Update Wood End Grain Fail", data);
    });
}

export function deleteWoodGrain({ commit }, woodLengthId) {
  return axiosClient
    .delete(`/end-grain-of-wood/delete/${woodLengthId}`)
    .then(({ data }) => {
      return data;
    })
    .catch(() => {
      console.log("Delete Wood End Grain Fail", data);
    });
}

export function getWoodLengths({ commit }, params) {
  return axiosClient
    .get(`/length-of-wood/list?page=${params?.page}&size=${params?.pageSize}`)
    .then(({ data }) => {
      return data;
    })
    .catch(() => {
      console.log("Get All Wood Length Fail", data);
    });
}

export function createWoodLength({ commit }, params) {
  return axiosClient
    .post("/length-of-wood/create", params)
    .then(({ data }) => {
      return data;
    })
    .catch(() => {
      console.log("Create Wood Length Fail", data);
    });
}

export function updateWoodLength({ commit }, params) {
  return axiosClient
    .put(`/length-of-wood/update/${params.id}`, params)
    .then(({ data }) => {
      return data;
    })
    .catch(() => {
      console.log("Update Wood Length Fail", data);
    });
}

export function deleteWoodLength({ commit }, woodLengthId) {
  return axiosClient
    .delete(`/length-of-wood/delete/${woodLengthId}`)
    .then(({ data }) => {
      return data;
    })
    .catch(() => {
      console.log("Delete Wood Length Fail", data);
    });
}

export function getUsers({ commit }, params) {
  return axiosClient
    .get(`/user/list?page=${params?.page}&size=${params?.pageSize}`)
    .then(({ data }) => {
      return data;
    })
    .catch(() => {
      console.log("Get Users Fail", data);
    });
}

export function createOrder({ commit }, params) {
  return axiosClient
    .post("/order/create", params)
    .then(({ data }) => {
      return data;
    })
    .catch(() => {
      console.log("Create Order Fail", data);
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
    .catch(() => {
      console.log("Create User Fail", data);
    });
}

// export function getUsers(
//   { commit, state },
//   { url = null, search = "", per_page, sort_field, sort_direction } = {}
// ) {
//   commit("setUsers", [true]);

//   const hasQueryParams = url && url.includes("?");
//   url = url || "/user/getAllUsers";
//   const params = hasQueryParams
//     ? {}
//     : {
//         search,
//         per_page: per_page || state.users.limit,
//         sort_field,
//         sort_direction,
//       };

//   return axiosClient
//     .get(url, { params })
//     .then((response) => {
//       commit("setUsers", [false, response.data]);
//     })
//     .catch(() => {
//       commit("setUsers", [false]);
//     });
// }

export function getUserDetail({ commit }, id) {
  return axiosClient.get(`/user/detail/${id}`);
}

// export function createUser({ commit }, user) {
//   if (user.image instanceof File) {
//     const form = new FormData();
//     form.append("username", user.username);
//     form.append("password", user.password);
//     form.append("full_name", user.full_name);
//     form.append("image", user.image);
//     form.append("role", user.role);

//     user = form;
//   }

//   return axiosClient.post("/user/create", user);
// }

export function updateUser({ commit }, user) {
  const id = user._id;
  if (user.image instanceof File) {
    const form = new FormData();
    form.append("id", user._id);
    form.append("username", user.username);
    form.append("password", user.password);
    form.append("full_name", user.full_name);
    form.append("image", user.image);
    form.append("role", user.role);

    user = form;
  }
  return axiosClient.put(`/user/update/${id}`, user);
}

export function deleteUser({ commit }, id) {
  return axiosClient.delete(`/user/delete/${id}`);
}
