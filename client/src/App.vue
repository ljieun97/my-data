<template>
  <div id="app">
    <Header msg="Welcome to Your Vue.js App"/>
    <movie-list/>
  </div>
</template>

<script>
import Header from './components/Header'
import MovieList from './components/MovieList'

export default {
  name: 'App',
  components: {
    Header,
    MovieList
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
