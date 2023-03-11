<template>
    <table style="text-align: center">
        <tr v-for="(item, index) in list" :key="index">
            <td width="10%">                    
                <input 
                    type="date"
                    v-model="item.date"
                    @change="onClickMyMovie(item._id, item.date, item.rating)"
                    style="width: 100%;"
                >
            </td>
            <td width="65%">{{replaceTitle(item)}}</td>
            <td width="15%">
                <star-rating 
                    v-model="item.rating" 
                    :increment="0.5" 
                    :star-size="25"
                    :show-rating="false"
                    @rating-selected="onClickMyMovie(item._id, item.date, item.rating)"
                >
                </star-rating>
            </td>
            <td width="10%">
                <button v-if="isCreate" @click="$emit('onClickEvent', item)">등록</button>
                <button v-else @click="$emit('onClickEvent', item._id)">삭제</button>
            </td>
        </tr>
    </table>
</template>

<script>
import MyMovieService from '@/services/my-movie-service'
import StarRating from 'vue-star-rating'
export default {
    name: 'MovieTable',
    props: {
        isCreate: {},
        list: {},
    },
    components: {
        StarRating,
    },
    data() {
        return {
            today: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
        }
    },
    mounted() {
    },
    methods: {
        onClickMyMovie(id, date, rating) {
            if (!this.isCreate) {
                let myMovie = {
                    date: date,
                    rating: rating,
                }
                MyMovieService.updateMyMovie(id, myMovie)
                    .then(() => {
                        console.log("수정완료")
                    })
            }
        },
        replaceTitle(value) {
            if (this.isCreate) {
                return value.title.replace(/(<b>|<\/b>|&amp;)/g, '')+'('+value.pubDate+')'
            } else {
                return value.title
            }
        },
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
