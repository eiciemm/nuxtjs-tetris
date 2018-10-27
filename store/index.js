let movement

const colors = ['black', 'red', 'purple', 'blue', 'orange', 'green', 'yellow']

const stick = [
    [[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,0,0,0]],
    [[1,1,1,1],[0,0,0,0],[0,0,0,0],[0,0,0,0]],
    [[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,0,0,0]],
    [[1,1,1,1],[0,0,0,0],[0,0,0,0],[0,0,0,0]] ]

const el = [
    [[1,0,0],[1,0,0],[1,1,0]],
    [[1,1,1],[1,0,0],[0,0,0]],
    [[0,1,1],[0,0,1],[0,0,1]],
    [[0,0,1],[1,1,1],[0,0,0]] ]

const reverseEl = [
    [[0,1,0],[0,1,0],[1,1,0]],
    [[1,0,0],[1,1,1],[0,0,0]],
    [[1,1,0],[1,0,0],[1,0,0]],
    [[1,1,1],[0,0,1],[0,0,0]] ]

const zett = [
    [[1,1,0],[0,1,1],[0,0,0]],
    [[0,0,1],[0,1,1],[0,1,0]],
    [[1,1,0],[0,1,1],[0,0,0]],
    [[0,0,1],[0,1,1],[0,1,0]] ]

const reverseZett = [
    [[0,1,1],[1,1,0],[0,0,0]],
    [[0,1,0],[0,1,1],[0,0,1]],
    [[0,1,1],[1,1,0],[0,0,0]],
    [[1,0,0],[1,1,0],[0,1,0]] ]

const tee = [
    [[1,1,1],[0,1,0],[0,0,0]],
    [[0,0,1],[0,1,1],[0,0,1]],
    [[0,1,0],[1,1,1],[0,0,0]],
    [[1,0,0],[1,1,0],[1,0,0]] ]


export const state = () => {
    return {
        shapes: [
            [[1,1],[1,1]], //箱
            [[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,0,0,0]], //棒
            [[1,1,1],[0,1,0],[0,0,0]], // T
            [[1,0,0],[1,0,0],[1,1,0]], // L
            [[0,1,0],[0,1,0],[1,1,0]], // 逆L
            [[1,1,0],[0,1,1],[0,0,0]], // Z
            [[0,1,1],[1,1,0],[0,0,0]] ], // 逆Z

        field:[
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
        ],

        fieldWidth: 10,
        gameMode:'opening',
        
        movingBlockColor: 0,
        movingBlockShape: 0,

        movingBlockRotate: 0,
        movingBlockX: 4,
        movingBlockY: 0,
        movingBlockHeight: 0,
        
        score: 0
    }
}


export const plugins = [
    (store) => {
      store.subscribe(() => {
        //並んだら消す処理
        let count
        for(let i = 19; i >= 0; i--){
            count = 0
            for(let n = 0; n < 10; n++){
                if(store.state.field[i*10 + n] > 0){
                    count++
                    if(count == 10){
                        store.commit('clearBlocks', i)
                        count = 0
                    }
                }
            }
        }

        //ゲームオーバーの処理
        if(store.state.field[14] !== 0){
            clearInterval(movement)
        }

      });
    },
];

export const getters = {
    getHeight: (state) => {
        const num = state.field.length
        return num/state.fieldWidth
    },

    getCellData: (state, getters) => (info) => {
        const x = info.x - 1
        const y = info.y - 1
        const index = y * 10 + x

        if(getters.mergeBlockField[index] == 0) return ''
        if(getters.mergeBlockField[index] > 0) return colors[getters.mergeBlockField[index] - 1]
    },

    //落ちてるブロックとfieldデータを合体させる関数
    mergeBlockField: (state) => {
        const movingBlock = state.shapes[state.movingBlockShape]
        const field = [...state.field]
        const index = state.movingBlockY * 10 + state.movingBlockX
        
        for(let i = 0; i < movingBlock.length; i++){
            for(let n = 0; n < movingBlock[i].length; n++){
                if(movingBlock[i][n]!==0){
                    field[index + n + (i * 10)] = movingBlock[i][n] + state.movingBlockColor
                }
            }
        }
        return field
    },

    //進行方向の状況を調べてtrue, falseを返す関数
    checkDirection: (state, getters) => (info) => {
        const movingBlock = state.shapes[state.movingBlockShape]
        const field = [...state.field]
        const index = state.movingBlockY * 10 + state.movingBlockX

        //////左方向へ移動の場合//////////////
        if(info == 'left'){
            let left = []
            //動いてるブロックの左側のindexを取得
            for(let i=0; i<movingBlock.length; i++){
                if(movingBlock[i].indexOf(1) !== -1){
                    left.push(i*10 + movingBlock[i].indexOf(1) + state.movingBlockX + state.movingBlockY*10)
                }
            }

            let flg = true
            // 上記で取得したindexの左隣にブロックがないか確認
            for(let i = 0; i < left.length; i++){
                if(field[left[i] - 1] > 0 || left[i] % 10 == 0) flg = false
            }
            if(flg) return true
            if(!flg) return false
        }

        //////右方向へ移動の場合//////////////
        if(info == 'right'){
            let right = {}
            // 動いてるブロックの右側のindexを取得
            for(let i = 0; i < movingBlock.length; i++){
                for(let n = 0; n < movingBlock[i].length; n++){
                    if(movingBlock[i][n] > 0) right[i] = n
                }
            }

            // 連想配列から配列に変換
            const rightArr = Object.keys(right).map(function (key) {return right[key]})

            // 上記で取得したindexをfield配列内でのindexに変換
            let rightIndex = []
            for(let i=0; i<rightArr.length; i++){
                rightIndex.push(i*10 + rightArr[i] + state.movingBlockX + state.movingBlockY*10)
            }

            let flg = true
            // 上記のindexの右隣にブロックがないか確認
            for(let i = 0; i < rightIndex.length; i++){
                if(field[rightIndex[i] + 1] > 0 || rightIndex[i] % 10 == 9) flg = false
            }
            if(flg) return true
            if(!flg) return false
        }

        //////下方向へ移動の場合//////////////
        if(info == 'down'){
            let data = {}
            for(let n = 0; n < movingBlock.length; n++){
                data[n] = -1   
            }
            for(let i = 0; i < movingBlock.length; i++){
                for(let n = 0; n < movingBlock.length; n++){
                    if(movingBlock[i][n] == 1) data[n] = i*1
                }
            }
    
            //連想配列から配列に変換
            const downArr = Object.keys(data).map(function (key) {return data[key]})
            
            //上記で取得したindexをfield配列内でのindexに変換
            let downIndex = []
            for(let i=0; i<downArr.length; i++){
                if(downArr[i] !== -1){
                    downIndex.push(10 * downArr[i] + state.movingBlockX + i + state.movingBlockY*10)
                }
            }
    
            //下にブロックがないか、一番下じゃないかを確認
            let flg = true
            for(let i = 0; i < downIndex.length; i++){
                if(field[downIndex[i] + 10] > 0 || state.movingBlockY + state.movingBlockHeight > 19) flg = false
            }
            if(flg) return true
            if(!flg) return false
        }
    }, //checkDirection閉じタグ
}


//mutationsではあくまでもstateを書き換えるだけ、計算はしない。
export const mutations = {
    gameStart(state, number){
        state.movingBlockColor = number.color
        state.movingBlockShape = number.shape
        state.gameMode = 'playing'

        // 新しいピースのheightを調べて、ストアに格納
        const movingBlock = state.shapes[state.movingBlockShape]
        const heightArr = []
        for(let i = 0; i<movingBlock.length; i++){
            heightArr[i] = 0
            for(let n = 0; n < movingBlock.length; n++){
                heightArr[i] += movingBlock[i][n]
            }
        }
        heightArr.forEach((item, index) => {
            if(item === 0) heightArr.splice(index, 1);
        });

        state.movingBlockHeight = heightArr.length
    },

    move(state, direction){
        if(direction == 'left') state.movingBlockX -= 1
        if(direction == 'right') state.movingBlockX += 1
        if(direction == 'down') state.movingBlockY += 1
        if(direction == 'rotate') state.movingBlockRotate += 1
    },

    moveDown(state){
        const movingBlock = state.shapes[state.movingBlockShape]
        const color = state.movingBlockColor
        const field = [...state.field]
        const index = state.movingBlockY * 10 + state.movingBlockX
        
        //movingBlockが一番下に着地した場合//////////////////////
        //fieldに転写、リセットし次のブロックを出す
        if(state.movingBlockY + state.movingBlockHeight > 19){
            for(let i = 0; i < movingBlock.length; i++){
                for(let n = 0; n < movingBlock[i].length; n++){
                    if(movingBlock[i][n] == 1){
                        field[index + n + (i * 10)] = movingBlock[i][n] + color
                    }
                }
            }
            state.field = field
            state.movingBlockY = 0
            state.movingBlockX = 4
            state.movingBlockRotate = 0
            state.movingBlockColor = Math.floor(Math.random()*7)
            state.movingBlockShape = Math.floor(Math.random()*7)

            // 新しいピースのheightを調べて、ストアに格納
            const newMovingBlock = state.shapes[state.movingBlockShape]
            const heightArr = []
            for(let i = 0; i < newMovingBlock.length; i++){
                heightArr[i] = 0
                for(let n = 0; n < newMovingBlock.length; n++){
                    heightArr[i] += newMovingBlock[i][n]
                }
            }
            heightArr.forEach((item, index) => {
                if(item === 0) heightArr.splice(index, 1);
            });

            state.movingBlockHeight = heightArr.length
        }

        //movingBlockが途中のブロックに接地した場合//////////////////////
        //まずmovingBlockの下辺を取得
        let data = {}
        for(let n = 0; n < movingBlock.length; n++){
            data[n] = -1   
        }
        for(let i = 0; i < movingBlock.length; i++){
            for(let n = 0; n < movingBlock.length; n++){
                if(movingBlock[i][n] === 1) data[n] = i*1
            }
        }

        //連想配列から配列に変換
        const downArr = Object.keys(data).map(function (key) {return data[key]})
        
        //上記で取得したindexをfield配列内でのindexに変換
        let downIndex = []
        for(let i=0; i<downArr.length; i++){
            if(downArr[i] !== -1){
                downIndex.push(10 * downArr[i] + state.movingBlockX + i + state.movingBlockY*10)
            }
        }

        //fieldに転写、リセットし次のブロックを出す
        let flg = true
        for(let i = 0; i < downIndex.length; i++){
            if(field[downIndex[i] + 10] > 0){
                for(let i = 0; i < movingBlock.length; i++){
                    for(let n = 0; n < movingBlock[i].length; n++){
                        if(movingBlock[i][n] > 0){
                            field[index + n + (i * 10)] = movingBlock[i][n] + color
                        }
                    }
                }
                state.field = field
                state.movingBlockY = 0
                state.movingBlockX = 4
                state.movingBlockRotate = 0
                state.movingBlockColor = Math.floor(Math.random()*7)
                state.movingBlockShape = Math.floor(Math.random()*7)

                // 新しいピースのheightを調べて、ストアに格納
                const newMovingBlock = state.shapes[state.movingBlockShape]
                const heightArr = []
                for(let i = 0; i<newMovingBlock.length; i++){
                    heightArr[i] = 0
                    for(let n = 0; n < newMovingBlock.length; n++){
                        heightArr[i] += newMovingBlock[i][n]
                    }
                }
                heightArr.forEach((item, index) => {
                    if(item === 0) heightArr.splice(index, 1);
                });

                state.movingBlockHeight = heightArr.length
            }
        }
        state.movingBlockY += 1
    }, //moveDown閉じタグ

    rotate(state){
        const movingBlock = state.shapes[state.movingBlockShape]
        const width = movingBlock.length

        const shapes = [...state.shapes]
        if(width + state.movingBlockX > 10 || state.movingBlockX < 0) return
        if(state.movingBlockShape == 1) shapes[1] = stick[state.movingBlockRotate%4]
        if(state.movingBlockShape == 2) shapes[2] = tee[state.movingBlockRotate%4]
        if(state.movingBlockShape == 3) shapes[3] = el[state.movingBlockRotate%4]
        if(state.movingBlockShape == 4) shapes[4] = reverseEl[state.movingBlockRotate%4]
        if(state.movingBlockShape == 5) shapes[5] = zett[state.movingBlockRotate%4]
        if(state.movingBlockShape == 6) shapes[6] = reverseZett[state.movingBlockRotate%4]

        state.shapes = shapes

        // 新しいピースのheightを調べて、ストアに格納
        const newMovingBlock = state.shapes[state.movingBlockShape]
        const heightArr = []
        for(let i = 0; i<newMovingBlock.length; i++){
            heightArr[i] = 0
            for(let n = 0; n < newMovingBlock.length; n++){
                heightArr[i] += newMovingBlock[i][n]
            }
        }

        heightArr.forEach((item, index) => {
            if(item === 0) heightArr.splice(index);
        });

        state.movingBlockHeight = heightArr.length
    },

    clearBlocks(state, index){
        const newField = [...state.field]
        for(let i = 1; i <= index; i++){
            for(let n = 0; n < 10; n++){
                newField[(index - ( i - 1 ) ) * 10 + n] = newField[(index - i) * 10 + n]
            }
        }
        state.field = newField
        state.score += 100
    },
}

//計算、処理は全てここで行う、mutationsはstateを書き換えるだけ
export const actions = {
    setGame({ commit, state }){
        const number = {
            color: Math.floor(Math.random()*7),
            shape: Math.floor(Math.random()*7)
        }
        
        movement = setInterval(function(){
            commit('moveDown')
        },1000)

        commit('gameStart', number)
    },

    //以下、キーイベントの処理x4
    left({ commit, getters }){
        if(getters.checkDirection('left')) commit('move', 'left')
    },

    right({ commit, getters }){
        if(getters.checkDirection('right')) commit('move', 'right')
    },

    down({ commit, getters, state }){
        if(getters.checkDirection('down')) commit('move', 'down')
    },

}