<template>
  <div>
    <my-webtoon-list/>
    <webtoon-list/>
  </div>
</template>

<script>
import MyWebtoonList from '@/components/webtoon/MyWebtoonList.vue'
import WebtoonList from '../components/webtoon/WebtoonList.vue'
export default {
    name: 'MoviePage',
    components: { 
        MyWebtoonList,
        WebtoonList
    },
    props: {

    },
    data() {
      return {

      }
    },
    methods: {

    },
}
</script>

<style scoped>

</style>
