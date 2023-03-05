<template>
  <div class="hello" style="padding: 0 120px">
    <div style="display: flex">
        <v-text-field
            v-model="searchMovie"
            label="영화 제목"
            placeholder="영화 제목"
            solo
            @keyup="getMovies()"
        ></v-text-field>
    </div>
    <div style="max-height: 400px; overflow-y: scroll">
        <movie-table :isCreate="1" :list="searchMovies" @onClickEvent="onClickCreate"/>
    </div>

    <h3>마이 리스트</h3>
    <div>
        <movie-table :isCreate="0" :list="myMovies" @onClickEvent="onClickDelete"/>
    </div>
  </div>
</template>

<script>
import MovieTable from './MovieTable.vue'
import AllMovieService from '@/services/all-movie-service'
import MyMovieService from '@/services/my-movie-service'

export default {
    name: 'MovieList',
    props: {
    },
    components: {
        MovieTable,
    },
    data() {
        return {
            today: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
            searchMovie: "",
            searchMovies: [],
            myMovies: [],
        }
    },
    mounted() {
        this.getMyMovies()
    },
    methods: {
        getMovies() {
            AllMovieService.getMovies(this.searchMovie)
                .then((res) => {
                    this.searchMovies = res.data
                    console.log(res.data)
                })
        },
        getMyMovies() {
            let userId = 1 //나중에 변경
            MyMovieService.getMyMovies(userId)
                .then((res) => {
                    this.myMovies = res.data
                })
        },
        replaceTitle(value) {
            return value.replace(/(<b>|<\/b>|&amp;)/g, '')
        },
        onClickCreate(value) {
            let userId = 1 //나중에 변경
            let myMovie = {
                title: this.replaceTitle(value.title)+'('+value.pubDate+')',
                date: value.date ? value.date : this.today,
                rating: value.rating,
            }
            MyMovieService.createMyMovie(userId, myMovie)
                .then(() => {
                    console.log("등록완료")
                    this.getMyMovies()
                })
        },
        onClickDelete(value) {
            console.log(value)
            MyMovieService.deleteMyMovie(value)
                .then(() => {
                    console.log("삭제완료")
                    this.getMyMovies()
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
