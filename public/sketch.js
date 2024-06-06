make2DArray = (col,row) => {
    let arr = new Array(col)
    for(let i = 0; i < col; i++){
        arr[i] = new Array(row)
        for(let j = 0; j < row; j++) arr[i][j] = 0
    }
    return arr
}

let grid

setup = () => {
    x = 10;
    y = 10;
    grid = make2DArray(x,y)
}

draw = () => {
    for(let i = 0; i < col; i++){
        for(let j = 0; j < row; j++){
            
        }
    }
}

setup()