const canvas = document.querySelector("canvas") as HTMLCanvasElement
let c = canvas.getContext("2d");
let ctx = c!
let boy = new Image();
boy.src = "../build/boy.png";
let home = new Image();
home.src = "../build/house.png";

let count=0;
let raf;
let current : Cell;

class Maze {
    size: number;
    rows: number;
    columns: number;
    grid: Cell[][];
    stack : Cell[];
    player : Player;
    constructor(size :number ,rows : number ,columns : number){
        this.size = size;
        this.rows = rows;
        this.columns = columns;
        this.grid = [];
        this.stack = [];
        this.player = new Player(size,rows);
    }
    setup(){
        for (let r = 0; r < this.rows; r++){
            let row : Cell[] = [];
            for (let c = 0; c < this.columns; c++){
                let cell = new Cell(this.size,this.grid,this.rows,this.columns,r,c);
                row.push(cell);
            }
            this.grid.push(row);
        }
        current = this.grid[0][0];
       //call DFS algo
       this.new_DFS();
       //call draw_maze function
       this.draw_maze();
        this.player.draw();

    }

    draw_maze(){
        canvas.width= this.size;
        canvas.height = this.size;
        canvas.style.backgroundColor = "black";

        this.grid.forEach((row: Cell[]) => {
            row.forEach((cell :Cell) => {
                cell.display_cell();
            });
        });

    }
    new_DFS(){
        current =  this.grid[0][0];
        current.visited = true;
        
        this.stack.push(current);

        while( this.stack.length != 0){
            let next = current.getRandomNeighbour();
            if ( next != undefined){
                next.visited =true;
                this.stack.push(current);
                current.removeWalls(current,next)
                current = next
            }
            else{
                //if neighbour is undefined, then backtrack
                if ( this.stack.length > 0){
                    current = this.stack.pop() as Cell
                }
                else if (this.stack.length == 0) {
                    return
                }
            }
           
        }
        let start_cell = this.grid[0][0];
        let end_cell = this.grid[this.rows-1][this.columns-1];
        start_cell.walls.topWall = false;
        end_cell.walls.rightWall = false;


    }

    moveDown(){
        let playerCellPos = this.grid[this.player.y][this.player.x];
        if ( playerCellPos.walls.bottomWall == false ){
            ctx.clearRect(0,0,500,500);
            this.draw_maze();
            this.player.move(1,0);
        }
    }
    moveUp(){
        let playerCellPos = this.grid[this.player.y][this.player.x];
        if ( playerCellPos.walls.topWall == false ){
            ctx.clearRect(0,0,500,500);
            this.draw_maze();
            this.player.move(-1,0);
        }
    }
    moveRight(){
        let playerCellPos = this.grid[this.player.y][this.player.x];
        if ( playerCellPos.walls.rightWall == false ){
            ctx.clearRect(0,0,500,500);
            this.draw_maze();
            this.player.move(0,1);
        }
    }
    moveLeft(){
        let playerCellPos = this.grid[this.player.y][this.player.x];
        if ( playerCellPos.walls.leftWall == false ){
            ctx.clearRect(0,0,500,500);
            this.draw_maze();
            this.player.move(0,-1);
        }
    }
    
}
class Cell {
    parentSize: number;
    parentGrid: Cell[][];
    rows:number;
    cols:number;
    rowNum :number;
    colNum: number;
    size: number;
    walls;
    visited: boolean;
    neighbours: Cell[];
    //color;
    constructor(parentSize: number,parentGrid:Cell[][],rows:number,cols:number,rowNum:number,colNum:number){
        this.parentSize = parentSize;
        this.parentGrid = parentGrid;
        this.rows = rows;
        this.cols = cols;
        this.rowNum = rowNum;
        this.colNum = colNum;
        this.size = parentSize/rows;
        this.walls ={
            topWall : true,
            bottomWall : true,
            leftWall : true,
            rightWall :true
        }
        this.visited = false
        this.neighbours = [];
        //this.color = "red";
    }
    
    setNeighbours(){
        this.neighbours = [];
        let x = this.colNum;
        let y = this.rowNum;
        let left =  (x !== 0) ? this.parentGrid[y][x-1] : undefined;
        let right = (x !== (this.cols-1)) ? this.parentGrid[y][x+1] : undefined;
        let top = (y !== 0) ? this.parentGrid[y-1][x] : undefined;
        let bottom = (y !== (this.rows-1)) ? this.parentGrid[y+1][x] : undefined;

        if ( left && (left.visited == false) )
            { this.neighbours.push(left); }
        if ( right && (right.visited == false) )
            { this.neighbours.push(right); }
        if ( top && (top.visited == false ) )
            { this.neighbours.push(top); }
        if ( bottom && (bottom.visited == false ) )
            { this.neighbours.push(bottom); }
        
    }

    getRandomNeighbour(){
        this.setNeighbours();
        if (this.neighbours.length == 0) {
            return undefined
        };
        let rand = Math.floor(Math.random()*this.neighbours.length);
        return this.neighbours[rand];
    }
    drawLine( fromX : number, fromY : number, toX : number, toY : number){
        ctx.lineWidth = 2;
        ctx.strokeStyle = "white";
        ctx.beginPath();
        ctx.moveTo(fromX,fromY);
        ctx.lineTo(toX, toY)
        ctx.stroke();
    }

        
    drawWalls(){
        //draw top wall
        // let x = this.colNum*this.size;
        // let y = this.rowNum*this.size;
        let fromX = 0;
        let fromY = 0;
        let toX = 0;
        let toY = 0;
     
        if (this.walls.topWall){
            fromX = this.colNum * this.size;
            fromY = this.rowNum * this.size;
            toX = fromX + this.size;
            toY = fromY;
            this.drawLine(fromX,fromY,toX,toY);
        }
        if (this.walls.bottomWall){
            fromX = this.colNum * this.size;
            fromY = (this.rowNum * this.size) + this.size;
            toX = fromX + this.size;
            toY = fromY;
            this.drawLine(fromX,fromY,toX,toY);
        }
        if (this.walls.leftWall){
            fromX = this.colNum * this.size;
            fromY = this.rowNum * this.size;
            toX = fromX;
            toY = fromY + this.size;
            this.drawLine(fromX,fromY,toX,toY);
        }
        if (this.walls.rightWall){
            fromX = (this.colNum*this.size) + this.size;
            fromY = this.rowNum * this.size;
            toX = fromX;
            toY = fromY + this.size;
            this.drawLine(fromX,fromY,toX,toY);
        }
    }
    // highlight(){
    //     ctx.fillStyle = "red";
    //     ctx.fillRect((this.colNum*this.size)+1,(this.rowNum*this.size)+1,this.size-2,this.size-2);  
    // }
    display_cell(){
        this.drawWalls();
        //ctx.fillStyle = this.color;
        ctx.fillRect((this.colNum*this.size)+1,(this.rowNum*this.size)+1,this.size-2,this.size-2);  
    }

    removeWalls(cell_1 : Cell, cell_2 : Cell){
        let XDiff = cell_2.colNum - cell_1.colNum;
        let YDiff = cell_2.rowNum - cell_1.rowNum;
        if (XDiff == 1){
            //remove cell1.rightWall cell2.leftWall
            cell_1.walls.rightWall = false;
            cell_2.walls.leftWall = false;
        } else if (XDiff == -1){
            //remove cell1.leftWall cell2.rightWall
            cell_1.walls.leftWall = false;
            cell_2.walls.rightWall = false;
        }

        if (YDiff == 1){
            
            cell_1.walls.bottomWall = false;
            cell_2.walls.topWall = false;
        } else if (YDiff == -1){
            cell_1.walls.topWall = false;
            cell_2.walls.bottomWall = false;
        }

    }
    
}

// let maze = new Maze(500,10,10);
// maze.setup();
// maze.draw();
let maze : Maze;
let start_time: number;
let end_time: number;
function initialiseMaze(size: number, r : number, c : number){
    maze = new Maze(size,r,c);
    start_time = Date.now();
    //maze.makeNullGrid();
    maze.setup();
    //maze.draw();
}


const btn = document.getElementById("submit_level") as HTMLButtonElement;
btn.addEventListener("click",selectLevel);


function selectLevel(){
    const sel = document.querySelector("#level") as HTMLSelectElement;
    
    if (sel.value == "easy"){
        initialiseMaze(500,10,10);
        
    }
    else if (sel.value == "medium"){
        initialiseMaze(500,20,20);
        
    }
    else if (sel.value == "hard"){
        initialiseMaze(600,30,30);
    }
    
}

class Player {
    x : number;
    y : number;
    size : number;
    parentSize : number;
    hasWon : boolean;
    rows: number;
    cols: number;
    lastCell :number;
    boyIcon;
    homeIcon;
    steps: number;
    constructor(parentSize : number, rows : number){
        this.x = 0;
        this.y = 0;
        this.parentSize = parentSize;
        this.rows = rows;
        this.cols = rows; //since its a square maze
        this.size = parentSize/rows;
        this.hasWon =false;
        this.lastCell = rows-1;
        this.boyIcon = new Image();
        
        this.boyIcon.src = "../build/boy.png";
        this.homeIcon = new Image();
        this.homeIcon.src = "../build/house.png";
        this.steps = 0;
    }
    move(row : number,col : number){
        this.y +=row
        this.x +=col;
        this.steps++;
        this.draw();
    }
    IsWon(){
        if ( (this.x == this.lastCell) && (this.y == this.lastCell)){
            this.hasWon = true;
            displaySteps(this.steps);
            toggleVisibility();
        }
    }
     
    draw(){
        // this.boyIcon.src = "boy.png";
        // this.homeIcon.src = "house.png";
        ctx.beginPath();
        
        ctx.drawImage(this.boyIcon,this.x*this.size,this.y*this.size,this.size,this.size);
        ctx.drawImage(this.homeIcon,this.lastCell*this.size,this.lastCell*this.size,this.size,this.size);
        // ctx.fillStyle=  "blue";
        // ctx.fillRect(this.x*this.size,this.y*this.size,this.size-2,this.size-2);
        // ctx.fill();
        ctx.stroke();
        ctx.closePath();
        this.IsWon();

    }
}

document.onkeydown = function(event){

    switch (event.code){
        case "ArrowDown"://40       
            maze.moveDown();
            break;
        case "ArrowUp"://38
            maze.moveUp();
            break;
        case "ArrowLeft"://37
            maze.moveLeft();
            break;
        case "ArrowRight"://39
            maze.moveRight();
            break;
    }
}

const playAgainbtn = document.querySelector(".btn") as HTMLButtonElement;
playAgainbtn.addEventListener("click",reload);

const buttonClose1 = document.querySelector("#close1") as HTMLButtonElement;
buttonClose1.addEventListener("click",toggleVisibility);
const buttonClose2 = document.querySelector("#close2") as HTMLButtonElement;
buttonClose2.addEventListener("click",toggleInstrModal);
const okbtn = document.querySelector("#okbtn") as HTMLButtonElement;
okbtn.addEventListener("click",toggleInstrModal);

function displaySteps(steps: number){
    const p_steps = document.getElementById("p_steps") as HTMLParagraphElement;
    let time_taken = TimeElapsed();
    let str = `You have taken ${steps} steps to complete the game<br> Time taken: ${time_taken} seconds`
    p_steps.innerHTML = str;
    // "You have taken "+ steps + " steps to complete the game."
}
function toggleVisibility(){
    const modal = document.querySelector(".winDiv") as HTMLDivElement;
    const overlay = document.querySelector(".overlay") as HTMLDivElement;
    modal.classList.toggle("hidden");
    overlay.classList.toggle("hidden");
}
function toggleInstrModal(){
    const modal_instr = document.querySelector(".instr") as HTMLDivElement;
    const overlay_instr = document.querySelector(".overlay") as HTMLDivElement;
    modal_instr.classList.toggle("hidden");
    overlay_instr.classList.toggle("hidden");
}
function TimeElapsed(){
    end_time = Date.now();
    let timeTaken = Math.floor((end_time-start_time)/1000);
    return timeTaken;
}
window.onload = ()=>{
    initialiseMaze(500,10,10);
    toggleInstrModal();
    // const canvas = document.querySelector("canvas") as HTMLCanvasElement
    // let c = canvas.getContext("2d");
}
function reload(){
    location.reload();
}