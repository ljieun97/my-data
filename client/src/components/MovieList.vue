<template>
  <v-app class="hello" style="padding: 120px">
    <div style="display: flex">
        <v-text-field
            v-model="searchMovie"
            label="영화 제목"
            placeholder="영화 제목"
            solo
            @keyup="getMovies()"
        ></v-text-field>
    </div>
    <div style="height: 400px; overflow-y: scroll">
        <table>
            <tr v-for="item, index in searchMovies" :key="index">
                <td width="15%">
                    <v-menu offset-y>
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                                :value="item.date ? item.date : today"
                                v-bind="attrs"
                                v-on="on"
                                prepend-icon="mdi-calendar"
                            ></v-text-field>
                        </template>
                        <v-date-picker
                            v-model="item.date"
                        ></v-date-picker>
                    </v-menu>
                </td>
                <td width="60%">{{replaceTitle(item.title)}}({{item.pubDate}})</td>
                <td width="15%">
                    <star-rating 
                        v-model="item.rating" 
                        :increment="0.5" 
                        :star-size="25"
                        :show-rating="false"
                    >
                    </star-rating>
                </td>
                <td width="10%"><button @click="onclickCreate(item)">선택</button></td>
            </tr>
        </table>
    </div>

    <h3>마이 리스트</h3>
    <div>
        <table>
            <tr v-for="(item, index) in myMovies" :key="index">
                <td width="15%">                    
                    <v-menu offset-y>
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                                :value="item.date ? item.date : today"
                                v-bind="attrs"
                                v-on="on"
                                prepend-icon="mdi-calendar"
                            ></v-text-field>
                        </template>
                        <v-date-picker
                            v-model="item.date"
                        ></v-date-picker>
                    </v-menu>
                </td>
                <td width="60%">{{item.title}}</td>
                <td width="15%">
                    <star-rating 
                        v-model="item.rating" 
                        :increment="0.5" 
                        :star-size="25"
                        :show-rating="false"
                    >
                    </star-rating>
                </td>
                <td width="10%"><button @click="onclickDelete(item)">삭제</button></td>
            </tr>
        </table>
    </div>
  </v-app>
</template>

<script>
import AllMovieService from '@/services/all-movie-service'
import MyMovieService from '@/services/my-movie-service'
import StarRating from 'vue-star-rating'
export default {
    name: 'MovieList',
    props: {
    },
    components: {
        StarRating,
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
            return value.replace(/(<b>|<\/b>)/g, '')
        },
        onclickCreate(value) {
            let userId = 1 //나중에 변경
            let myMovie = {
                title: this.replaceTitle(value.title)+'('+value.pubDate+')',
                date: value.date,
                rating: value.rating,
            }
            console.log(value.date)
            MyMovieService.createMyMovie(userId, myMovie)
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
