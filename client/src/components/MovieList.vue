<template>
  <div class="hello" style="padding: 120px">
    <div style="display: flex">
        <v-text-field
            v-model="searchMovie"
            label="영화 제목"
            placeholder="영화 제목"
            solo
        ></v-text-field>
        <button @click="getMovieList()">검색</button>
    </div>

    <h3>검색 리스트</h3>
    <ul v-for="item in searchMovieList" :key="item">
        <p>
            {{replaceTitle(item.title)}}({{item.pubDate}})
            <button @click="onclickMovie(item)">선택</button>
        </p>
    </ul>
    <h3>마이 리스트</h3>
    <v-data-table
        :headers="myMovieHeaders"
        :items="myMovieList"
        hide-default-footer
        class="elevation-1"
    ></v-data-table>
    
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
            searchMovie: "",
            searchMovieList: [],
            myMovieHeaders: [
                { text: 'Title', value: 'title'},
                { text: 'PubDate', value: 'pubDate' },
                { text: 'Director', value: 'director' },
                { text: 'Actor', value: 'actor' },
                { text: 'UserRating', value: 'userRating' },
            ],
            myMovieList: [],
        }
    },
    mounted() {
    },
    methods: {
        async getMovieList() {
            await MovieService.getMovieList(this.searchMovie).then((res) => {
                this.searchMovieList = res.data
            })
        },
        replaceTitle(value) {
            return value.replace(/(<b>|<\/b>)/g, '')
        },
        onclickMovie(value) {
            this.myMovieList.push({
                title: this.replaceTitle(value.title),
                pubDate: value.pubDate,
                director: value.director,
                actor: value.actor,
                userRating: value.userRating,
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
