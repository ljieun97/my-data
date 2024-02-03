<template>
    <div class="hello" style="padding: 0 20px">
        <div style="display: flex">
            <input 
                type="text" 
                placeholder="영화 제목"
                @input="getMovies"
                style="width: 100%"
            />
        </div>
        <div style="max-height: 400px; overflow-y: scroll">
            <table style="text-align: center; width: 100%">
                <tr v-for="(item, index) in searchMovies" :key="index">
                    <td width="10%">                    
                        <input 
                            type="date"
                            v-model="item.date"
                            style="width: 100%;"
                        >
                    </td>
                    <td width="65%">
                        {{item.title+'('+item.release_date.substr(0, 4)+')'}} <br/>
                        <img v-if="item.poster_path" width="120" :src='`https://www.themoviedb.org/t/p/w1280/${item.poster_path}`'/>
                    </td>
                    <td width="15%" >
                        <star-rating 
                            v-model="item.rating" 
                            :increment="0.5" 
                            :star-size="25"
                            :show-rating="false"
                            style="margin: 0 auto;"
                        >
                        </star-rating>
                    </td>
                    <td width="10%">
                        <button @click="onClickCreate(item)">등록</button>
                    </td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script>
import ApiDateService from '@/services/api-data-service'
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
            searchMovies: [],
        }
    },
    methods: {
        getMovies(e) {
            ApiDateService.getMovies(e.target.value)
                .then((res) => {
                    this.searchMovies = res.data
                })
        },
        onClickCreate(value) {
            let userId = 1 //나중에 변경
            let myMovie = {
                title: value.title+'('+value.release_date.substr(0, 4)+')',
                image: `https://www.themoviedb.org/t/p/w1280/${value.poster_path}`,
                date: value.date ? value.date : this.today,
                rating: value.rating,
            }
            MyMovieService.createMyMovie(userId, myMovie)
                .then(() => {
                    console.log("등록완료")
                    this.$emit('getMymovies')
                })
        },
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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
