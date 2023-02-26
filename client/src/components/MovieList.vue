<template>
  <div class="hello">
    <h3>Installed CLI Plugins</h3>
    <ul v-for="item in movieList" :key="item">
        <p>{{item.title}}({{item.pubDate}})</p>
        <p>{{item.subtitle}}</p>
        <p>{{item.director}}</p>
        <p>{{item.actor}}</p>
        <p>{{item.userRating}}</p>
    </ul>
  </div>
</template>

<script>
import MovieService from '@/services/movie.service'
export default {
  name: 'MovieList',
  props: {
  },
  data() {
    return {
        movieList: {},
    }
  },
  mounted() {
    this.getMovieList()
    console.log('mo')
  },
  methods: {
    async getMovieList() {
      await MovieService.getMovieList().then((res) => {
        console.log('되니?')
        this.movieList = res.data
      })
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
