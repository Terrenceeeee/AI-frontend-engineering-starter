import {createRouter,createWebHistory} from 'vue-router';
const routes=[
  {
    path:'/',
    name:'Home',
    component:()=>import('../src/views/Home.vue'),
  },
  {
    path:'/user',
    name:'User',
    component:()=>import('../src/views/User.vue'),
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../src/views/Admin.vue'),
  },
  {
    path: '/product',
    name: 'Product',
    component: () => import('../src/views/product/index.vue'),
  },
  
];

const router=createRouter({
  history:createWebHistory(),
  routes,
});

export default router;