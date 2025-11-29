import { createRouter, createWebHistory } from "vue-router";
import AppLayout from "../components/AppLayout.vue";
import Login from "../views/Login.vue";
import Dashboard from "../views/Dashboard.vue";
import RequestPassword from "../views/RequestPassword.vue";
import ResetPassword from "../views/ResetPassword.vue";
import store from "../store";
import Product from "../views/Products/Product.vue";
import CreateProduct from "../views/Products/CreateProduct.vue";
import ProductDetail from "../views/Products/ProductDetail.vue";
import NotFound from "../views/NotFound.vue";
import Categories from "../views/Categories/Categories.vue";
import Users from "../views/Settings/User.vue";
import Pos from "../views/POS/Pos.vue";
import WoodType from "../views/Settings/WoodType.vue";
import WoodLength from "../views/Settings/WoodLength.vue";
import WoodGrain from "../views/Settings/WoodGrain.vue";

const routes = [
  {
    path: "/",
    redirect: "/app/dashboard",
  },
  {
    path: "/app",
    name: "app",
    component: AppLayout,
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: "dashboard",
        name: "app.dashboard",
        component: Dashboard,
      },
      {
        path: "product",
        name: "app.product",
        component: Product,
      },
      {
        path: "createproduct",
        name: "app.createproduct",
        component: CreateProduct,
      },
      {
        path: "productdetail/:pro_id",
        name: "app.productdetail",
        component: ProductDetail,
      },
      {
        path: "categories",
        name: "app.categories",
        component: Categories,
      },
      {
        path: "users",
        name: "app.users",
        component: Users,
      },
      {
        path: "woodtype",
        name: "app.woodtype",
        component: WoodType,
      },
      {
        path: "woodlength",
        name: "app.woodlength",
        component: WoodLength,
      },
      {
        path: "woodgrain",
        name: "app.woodgrain",
        component: WoodGrain,
      },
    ],
  },
  {
    path: "/login",
    name: "login",
    component: Login,
    meta: {
      requiresGuest: true,
    },
  },
  {
    path: "/request-password",
    name: "requestPassword",
    component: RequestPassword,
    meta: {
      requiresGuest: true,
    },
  },
  {
    path: "/reset-password/:token",
    name: "resetPassword",
    component: ResetPassword,
    meta: {
      requiresGuest: true,
    },
  },
  {
    path: "/pos",
    name: "app.pos",
    component: Pos,
  },
  {
    path: "/:pathMatch(.*)",
    name: "notfound",
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  // console.log(to);
  // next();
  if (to.meta.requiresAuth && !store.state.user.token) {
    next({ name: "login" });
  } else if (to.meta.requiresGuest && store.state.user.token) {
    next({ name: "app.dashboard" });
  } else {
    next();
  }
});

export default router;
