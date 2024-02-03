<template>
    <div style="padding: 0 20px">
        <div style="display: flex">
            <h4>내웹툰 리스트</h4>
            <button @click="viewType = true">목록형</button>
            <button @click="viewType = false">앨범형</button>
        </div>

        <div v-if="viewType">
            <table width="100%" style="text-align: center">
                <tr >
                    <td width="10%"><button>날짜</button></td>
                    <td width="65%"><button>제목</button></td>
                    <td width="15%"><button>별점</button></td>
                    <td width="10%"></td>
                    <td></td>
                </tr>
            </table>
            <table style="text-align: center; width: 100%">
                <tr v-for="(item, index) in myMovies" :key="index">
                    <td width="10%">                    
                        <input 
                            type="date"
                            v-model="item.date"
                            @change="onClickMyMovie(item._id, item.date, item.rating)"
                            style="width: 100%;"
                        >
                    </td>
                    <td width="65%">
                        {{item.title}}
                    </td>
                    <td width="15%" >
                        <star-rating 
                            v-model="item.rating" 
                            :increment="0.5" 
                            :star-size="25"
                            :show-rating="false"
                            @rating-selected="onClickMyMovie(item._id, item.date, item.rating)"
                            style="margin: 0 auto;"
                        >
                        </star-rating>
                    </td>
                    <td width="10%">
                        <button @click="onClickDelete(item._id)">삭제</button>
                    </td>
                </tr>
            </table>
        </div>
        <div v-else style="display: flex; flex-wrap: wrap;">
            <div v-for="(item, index) in myMovies" :key="index">
                <img :src="item.image" style="width: 150px; height: 200px">
            </div>
        </div>
    </div>
</template>

<script>
import MyMovieService from '@/services/my-movie-service'
import StarRating from 'vue-star-rating'

export default {
    name: 'MyWebttonList',
    props: {
        isChangeMymovies: {},
    },
    components: {
        StarRating,
    },
    data() {
        return {
            today: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
            myMovies: [],
            viewType: true,
        }
    },
    mounted() {
        this.getMyMovies()
    },
    watch: {
        isChangeMymovies() {
            this.getMyMovies()
            console.log(this.isChangeMymovies)
        }
    },
    methods: {
        getMyMovies() {
            let userId = 1 //나중에 변경
            MyMovieService.getMyMovies(userId)
                .then((res) => {
                    this.myMovies = res
                })
        },
        onClickDelete(value) {
            console.log(value)
            MyMovieService.deleteMyMovie(value)
                .then(() => {
                    console.log("삭제완료")
                    this.getMyMovies()
                })
        },
        onClickMyMovie(id, date, rating) {
            if (!this.isCreate) {
                let myMovie = {
                    date: date,
                    rating: rating,
                }
                MyMovieService.updateMyMovie(id, myMovie)
                    .then(() => {
                        console.log("수정완료")
                        this.getMyMovies()
                    })
            }
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
