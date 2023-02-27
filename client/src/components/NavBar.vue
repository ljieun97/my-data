<template>
  <div class="hello">
    <h2>My Data</h2>
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
     </ul>
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
