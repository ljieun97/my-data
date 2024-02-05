<template>
  <div>
    <my-movie-list :isChangeMymovies="isChangeMymovies"/>
    <search-movie @getMymovies="getMymovies"/>
  </div>
</template>

<script>
import SearchMovie from '@/components/movie/SearchMovie.vue'
import MyMovieList from '../components/movie/MyMovieList.vue'
export default {
    name: 'MoviePage',
    components: { 
      SearchMovie,
      MyMovieList 
    },
    props: {

    },
    data() {
      return {
        isChangeMymovies: false
      }
    },
    methods: {
      getMymovies() {
        this.isChangeMymovies = !this.isChangeMymovies 
      }
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
