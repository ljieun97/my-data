<template>
  <v-app id="app">
    <div class="window" style="height: 100%; margin: 100px; background: #c0c0c0;">
      <nav-bar style="height: 3%;"/>
      <div style="display: flex; height: 97%;  padding: 10px;">
        <tree-view/>
        <router-view/>
      </div>
    </div>
    <task-bar class='task-bar'/>
  </v-app>
</template>

<script>
import NavBar from './components/NavBar.vue'
import TaskBar from './components/TaskBar.vue'
import TreeView from './components/TreeView.vue'
// import MainPage from './pages/MainPage.vue'

export default {
  name: 'App',
  components: {
    NavBar,
    TaskBar,
    TreeView,
    // MainPage
  }
}
</script>

<style>
@import "https://unpkg.com/98.css@0.1.4/build/98.css";
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  background: #2f4f4f;
}
.task-bar {
    position: fixed;
    background-color: #bbc3c4;
    bottom: 0px;
    left: 0px;
    width: 100%;
    max-width: 100%;
    z-index: 10;
    box-shadow: 0px -1px 0px #ffffff;
    padding: 2px 0px;
    display: flex;
}
</style>
