export function setUser(state, user) {
  state.user.data = user;
}

export function setToken(state, token) {
  state.user.token = token;
  if (token) {
    sessionStorage.setItem('TOKEN', token);
  } else {
    sessionStorage.removeItem('TOKEN')
  }
}

export function setProducts(state, [loading, data = null]) {
  state.products.loading = loading;

  if (data) {
    state.products = {
      ...state.products,
      data: data.data || [],
      links: data.links || [],
      page: data.page || 1,
      limit: data.limit || 10,
      from: data.from || null,
      to: data.to || null,
      total: data.total || 0
    };
  }
}

export function setCategories(state, [loading, data = null]) {
  state.categories.loading = loading;

  if (data) {
    state.categories = {
      ...state.categories,
      data: data.data || [],
      links: data.links || [],
      page: data.page || 1,
      limit: data.limit || 10,
      from: data.from || null,
      to: data.to || null,
      total: data.total || 0
    }
  }
}

export function setUsers(state, [loading, data = null]) {
  state.users.loading = loading;

  if (data) {
    state.users = {
      ...state.users,
      data: data.data || [],
      links: data.links || [],
      page: data.page || 1,
      limit: data.limit || 10,
      from: data.from || null,
      to: data.to || null,
      total: data.total || 0
    }
  }
}
