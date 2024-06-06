make2DArray = (col,row) => {
    let arr = new Array(col)
    for(let i = 0; i < col; i++){
        arr[i] = new Array(row)
        for(let j = 0; j < row; j++) arr[i][j] = Math.round(Math.random())
    }
    return arr
}

let grid
let squareSize = 30;
// let borderSize = 0.1;
const x = 30;
const y = 30;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const nextBtn = document.getElementById('next')
const resetBtn = document.getElementById('reset')
const genP = document.getElementById('generation')
const popP = document.getElementById('population')
let currentGeneration = 0

document.addEventListener('keydown', (event) => {
    if (event.key === 'r' || event.key === 'R') {
        setup()
    }
    else if (event.key === ' ') {
        update(grid)
    }
})

resetBtn.addEventListener('click', () => {
    setup()
})

nextBtn.addEventListener('click', () => {
    update(grid)
})
document.addEventListener('wheel', () => {
    update(grid)
})

update = (arr) => {
    grid = nextGen(arr)
    draw(grid)
}

nextGen = (arr) => {
    let res = make2DArray(x,y)
    for(let i = 0; i < x; i++){
        for(let j = 0; j < y; j++){
            if(arr[i][j] == 1){
                if(getValue(arr,i,j) == 2 || getValue(arr,i,j) == 3) res[i][j] = 1
                else res[i][j] = 0
            } else{
                if(getValue(arr,i,j) == 3) res[i][j] = 1
                else res[i][j] = 0
            }
        }
    }
    return res
}

const dx = [-1, 0, 1,-1, 1,-1, 0, 1]
const dy = [-1,-1,-1, 0, 0, 1, 1, 1]
getValue = (arr,i,j) => {
    let cnt = 0
    // console.log(arr);
    for(let k = 0; k < 8; k++){
        nx = i+dx[k]
        ny = j+dy[k]
        if(nx >= 0 && ny >= 0 && nx < x && ny < y){
            // console.log(nx,ny,arr[nx][ny]);
            cnt += arr[nx][ny]
        }
    }
    // console.log(cnt);
    return cnt
}

setup = () => {
    
    grid = make2DArray(x,y)

    const numRows = x;
    const numCols = y;
    // const canvasWidth = numCols * (squareSize + borderSize) + borderSize;
    // const canvasHeight = numRows * (squareSize + borderSize) + borderSize;
    const canvasWidth = numCols * squareSize;
    const canvasHeight = numRows * squareSize;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    currentGeneration = 0
    draw(grid)
}

getColor = (value) => {
    if(value == 0) return "black"
    return "white"
}

draw = (arr) => {
    let cnt = 0
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[i].length; j++) {
            const value = arr[i][j];
            cnt += value
            const color = getColor(value);
            ctx.fillStyle = color;
            ctx.fillRect(j * squareSize, i * squareSize, squareSize, squareSize);
        
            // ctx.strokeStyle = 'black'; // Border color
            // ctx.lineWidth = borderSize;
            // ctx.strokeRect(j * (squareSize + borderSize), i * (squareSize + borderSize), squareSize, squareSize);
        }
    }
    currentGeneration++
    genP.innerHTML = `Generation: ${currentGeneration}`
    popP.innerHTML = `Population: ${cnt}`
}

setup()