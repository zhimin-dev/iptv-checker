<template>
  <div id="app" class='fullWidth'>
    <Iptv />
  </div>
</template>

<script>
import Iptv from './components/Iptv.vue';

export default {
  name: 'app',
  data() {
    return {};
  },
  components: {
    Iptv,
  },
};
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.fixedWidth {
  width: 700px;
}
.fullWidth {
  width: 100%;
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
.normal-container{
  .normal-item{
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    .normal-title{
      font-size: 14px;
    }
  }
}
</style>
