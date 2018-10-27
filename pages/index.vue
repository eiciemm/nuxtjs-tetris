<template>
  <div class="app" v-on:keydown="keys(e)">

      <div class="score"> TETRIS //// SCORE: {{$store.state.score}} </div>
      <p>矢印キーで方向操作し、スペースキーで回転</p>

      <!-- y軸（縦列）20 -->
      <div class="field" v-for="(y, yIdx) in getHeight" :key="yIdx">

        <!-- x軸（横列）10 -->
        <div class="insideField" 
        v-for="(x, xIdx) in fieldWidth" :key="xIdx"
        :style="`background:${getCellData({ x, y })}`" />
      </div>

  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';

export default {
  data(){
    return{
    }
  },
  created: function () {
    window.addEventListener('keyup', this.keys)
  },

  computed: {
    ...mapState([
      'fieldWidth',
      'movingBlockColor',
      'movingBlockShape',
      'movingBlockRotate',
      'movingBlockX',
      'movingBlockY'
    ]),

    ...mapGetters([
      'getHeight',
      'getCellData',
    ]),
  },

  mounted() {
    this.setGame()
  },

  methods:{
    ...mapMutations([
      'move',
      'rotate'
    ]),

    ...mapActions([
      'setGame',
      'left',
      'right',
      'down',
    ]),

//以下の処理をactionsにとばす
    keys(e){
      if(e.keyCode==37){
        this.left()
      }
      if(e.keyCode==39){
        this.right()
      }
      if(e.keyCode==40){
        this.down()
      }
      if(e.keyCode==32){
        this.move('rotate')
        this.rotate()
        //stateの更新とは別に強制的にレンダリング、更新する関数を呼ぶ
      }
    }
  }

}
</script>

<style scoped>

.app{
  margin-left: 100px;
  margin-top: 20px;
}

.app p{
  font-size: 14px;
}

.score{
  margin-bottom: 10px;
}

.field{
  display:flex;

}

.insideField{
  width: 30px;
  height: 30px;
  background-color: lightgrey;
  border: #BDBDBD 1px solid;
}

.gameover{
  position: absolute;
}

</style>
