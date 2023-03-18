<template>
    <!-- <h2>My Data</h2>
    <ul>
        <li>
            <router-link id='nav_item' :to="{name: 'MainPage'}">
            홈
            </router-link>
        </li>
        <li>
            <router-link id='nav_item' :to="{name: 'MoviePage'}">
            영화
            </router-link>
        </li>
        <li>
            <router-link id='nav_item' :to="{name: 'WebtoonPage'}">
            웹툰
            </router-link>
        </li>
     </ul> -->
     <!-- 이거 트리뷰로 옮기기 누르면 보라색글씨도 적용하고 -->

  <div class="title-bar">
    <div class="title-bar-text">My Data</div>
    <div class="title-bar-controls">
      <button aria-label="Close"></button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Navbar',
  props: {

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
