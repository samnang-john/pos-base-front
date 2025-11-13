import {createRouter, createWebHistory} from "vue-router";
import AppLayout from '../components/AppLayout.vue'
import Login from "../views/Login.vue";
import Dashboard from "../views/Dashboard.vue";
import RequestPassword from "../views/RequestPassword.vue";
import ResetPassword from "../views/ResetPassword.vue";
import store from "../store";
import Products from "../views/Products/Products.vue";
import NotFound from "../views/NotFound.vue";
import Categories from "../views/Categories/Categories.vue";
import Users from "../views/Users/Users.vue";
import Pos from "../views/POS/Pos.vue";

const routes = [
  {
    path: '/',
    redirect: '/app/dashboard'
  },
  {
    path: '/app',
    name: 'app',
    component: AppLayout,
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: 'dashboard',
        name: 'app.dashboard',
        component: Dashboard
      },
      {
        path: 'products',
        name: 'app.products',
        component: Products
      },
      {
        path: 'categories',
        name: 'app.categories',
        component: Categories
      },
      {
        path: 'users',
        name: 'app.users',
        component: Users
      }
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: {
      requiresGuest: true
    }
  },
  {
    path: '/request-password',
    name: 'requestPassword',
    component: RequestPassword,
    meta: {
      requiresGuest: true
    }
  },
  {
    path: '/reset-password/:token',
    name: 'resetPassword',
    component: ResetPassword,
    meta: {
      requiresGuest: true
    }
  },
  {
    path: '/pos',
    name: 'app.pos',
    component: Pos
  },
  {
    path: '/:pathMatch(.*)',
    name: 'notfound',
    component: NotFound,
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  console.log(to);
  if (to.meta.requiresAuth && !store.state.user.token) {
    next({name: 'login'})
  } else if (to.meta.requiresGuest && store.state.user.token) {
    next({name: 'app.dashboard'})
  } else {
    next();
  }

})

export default router;