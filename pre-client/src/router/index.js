import Vue from 'vue'
import VueRouter from 'vue-router'
import MainPage from '@/pages/MainPage.vue'
import MoviePage from '@/pages/MoviePage.vue'
import WebtoonPage from '@/pages/WebtoonPage.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'MainPage',
    component: MainPage,
    props: true
  },
  {
    path: '/movie',
    name: 'MoviePage',
    component: MoviePage,
    props: true
  },
  {
    path: '/webtoon',
    name: 'WebtoonPage',
    component: WebtoonPage,
    props: true
  },
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
  })
  
  
  export default router