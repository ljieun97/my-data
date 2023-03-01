<template>
  <div class="hello" style="padding: 120px">
    <div style="display: flex">
        <v-text-field
            v-model="searchMovie"
            label="영화 제목"
            placeholder="영화 제목"
            solo
            @keyup="getMovies()"
        ></v-text-field>
        <button @click="getMovies()">검색</button>
    </div>

    <h3>검색 리스트</h3>
    <ul v-for="(item, index) in searchMovies" :key="index">
        <p>
            {{replaceTitle(item.title)}}({{item.pubDate}})
            <button @click="onclickMovie(item)">선택</button>
        </p>
    </ul>
    <h3>마이 리스트</h3>
    <v-data-table
        :headers="myMovieHeaders"
        :items="myMovies"
        hide-default-footer
        class="elevation-1"
    ></v-data-table>
    
  </div>
</template>

<script>
import AllMovieService from '@/services/all-movie-service'
import MyMovieService from '@/services/my-movie-service'
export default {
    name: 'MovieList',
    props: {
    },
    data() {
        return {
            searchMovie: "",
            searchMovies: [],
            myMovieHeaders: [
                { text: 'Date', value: 'myInfo.date' },
                { text: 'Title', value: 'movieInfo.title'},
                // { text: 'Director', value: 'movieInfo.director' },
                // { text: 'Actor', value: 'movieInfo.actor' },
                // { text: 'UserRating', value: 'movieInfo.userRating' },
                { text: 'MyRating', value: 'myInfo.myRating' },
            ],
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
            return value.replace(/(<b>|<\/b>)/g, '')
        },
        onclickMovie(value) {
            let userId = 1 //나중에 변경
            let movieInfo = {
                title: this.replaceTitle(value.title)+'('+value.pubDate+')',
                director: value.director,
                actor: value.actor,
                userRating: value.userRating,
            }
            let myInfo = {
                date: '2020-11-11',
                myRating: 10,
            }
            MyMovieService.createMyMovie(userId, movieInfo, myInfo)
                .then(() => {
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
