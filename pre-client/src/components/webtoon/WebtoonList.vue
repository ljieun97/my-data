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
                        {{replaceTitle(item.title)}}
                        <img :src="item.image">
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
import ApiDateService from '@/services/api-data.service'
import MyMovieService from '@/services/my-movie.service'
import StarRating from 'vue-star-rating'

export default {
    name: 'WebtoonList',
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
            ApiDateService.getWebtoons(e.target.value)
                .then((res) => {
                    this.searchMovies = res.data
                    console.log(res.data)
                })
        },
        replaceTitle(value) {
            return value.replace(/(<b>|<\/b>|&amp;)/g, '')
        },
        onClickCreate(value) {
            let userId = 1 //나중에 변경
            let myMovie = {
                title: this.replaceTitle(value.title)+'('+value.pubDate+')',
                image: value.image,
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

</style>
