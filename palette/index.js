const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const buttons = document.querySelectorAll('.options--list-item:not(.inactive):not(.colors)');
let currentColor = '#00ff00';
let previousColor = '#000000';
const inputColor = document.querySelector('#inputColor');
const previousColorElement = document.querySelector('#previous');
const allColors = document.querySelectorAll('.options--circle:not(#inputColor)');
const label = document.querySelector('#label');
let handle = true;
let firstPoint = [0, 0];
let secondPoint = [0, 0];

function changeColor(color) {
    let inter = currentColor;
    currentColor = color;
    previousColor = inter;
    previousColorElement.style.backgroundColor = previousColor;
    inputColor.value = currentColor;
    label.style.backgroundColor = currentColor;
    saveState();
}

function saveState() {
    let count = 0;
    for(let yCoordinate = 2; yCoordinate < 512; yCoordinate += 128) {
        for(let xCoordinate = 2; xCoordinate < 512; xCoordinate += 128) {
            localStorage.setItem('canvasState' + count, (findColor(xCoordinate, yCoordinate)));
            count++;
        }
    }
    localStorage.setItem('previousColor', previousColor);
    localStorage.setItem('currentColor', currentColor);
}

window.onload = () => {
    if(localStorage.getItem('currentColor')) currentColor = localStorage.getItem('currentColor');
    if(localStorage.getItem('previousColor')) previousColor = localStorage.getItem('previousColor');
    if(localStorage.getItem('canvasState1')) {
        let array = [];
        let arr = [];
        for(let i = 0; i < 16; i++) {
            array.push(localStorage.getItem('canvasState' + i));
        }
        for(let j = 0; j < 15; j+= 4) {
            arr.push(array.slice(j, j + 5));
        }
        drawFromArr(arr, 1);
    } else prefillCanvas();
    inputColor.value = currentColor;
    label.style.backgroundColor = currentColor;
    previousColorElement.style.backgroundColor = previousColor;
    allColors.forEach((color) => {
        color.addEventListener('click', () => {
            if(color.getAttribute('id') === 'red') changeColor('#F74141');
            if(color.getAttribute('id') === 'blue') changeColor('#41B6F7');
            if(color.getAttribute('id') === 'previous') changeColor(previousColor);
        });
    });
    inputColor.addEventListener('change', (e) => {
        changeColor(e.target.value);
    });
    inputColor.select();
}

function drawFromArr(arr, type) {
    if (canvas && canvas.getContext) {
        arr.forEach((row, rowIdx) => {
            row.forEach((column, colIdx) => {
                if(type === 0) {
                    if(column.length === 6) {
                        ctx.fillStyle = "#" + column;
                    } else {
                        ctx.fillStyle = "rgba(" + column + ")";
                    }
                } else ctx.fillStyle = column;
                ctx.fillRect(colIdx * 512 / arr.length, rowIdx * 512 / arr.length, (colIdx + 1) * 512 / arr.length, (rowIdx + 1) * 512 / arr.length);
            })
        })
    } else throw new Error('Canvas Error');
}

function prefillCanvas() {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://raw.githubusercontent.com/rolling-scopes-school/tasks/master/tasks/stage-2/codejam-canvas/data/4x4.json');
    xhr.responseType = 'json';
    xhr.send();
    xhr.onload = () => {
        let arr = [];
        arr = xhr.response;
        drawFromArr(arr, 0);
    }
    xhr.onerror = () => {
        throw new Error('Data Error');
    }
}

function draw(x, y) {
    let startX = 0;
    let startY = 0;
    for(; startX <= 512, startY <= 512; startX += 128, startY += 128) {
        if((startX - x >= -128) && (startY - y >= -128)) break;
        if(startX - x >= -128) startX -= 128;
        if(startY - y >= -128) startY -= 128;
    }
    if(canvas && canvas.getContext) {
        ctx.fillStyle = currentColor;
        ctx.fillRect(startX, startY, 128, 128);
    } else throw new Error('Canvas Error');
    return [startX, startX + 129, startY, startY + 129];
}

function BrezAlg(x1, x2, y1, y2) {
    let deltaX = Math.abs(x2 - x1);
    let deltaY = Math.abs(y2 - y1);
    let signX = x1 < x2 ? 1 : -1;
    let signY = y1 < y2 ? 1 : -1;
    let error = deltaX - deltaY;
    draw(x2, y2);
    while(x1 !== x2 || y1 !== y2) 
    {
        draw(x1, y1);
        let error2 = error * 2;
        if(error2 > -deltaY) 
        {
            error -= deltaY;
            x1 += signX;
        }
        if(error2 < deltaX) 
        {
            error += deltaX;
            y1 += signY;
        }
    }
}

canvas.addEventListener('mousedown', (e) => {
    let activeButtonId;
    buttons.forEach((button) => {
        if(button.classList.contains('active')) activeButtonId = button.getAttribute('id');
    });
    if(activeButtonId === 'bucket') {
        drawBucket(currentColor);
        saveState();
    }

    if(activeButtonId === 'pencil') {
        handle = true;
        pencilDraw(e);
        saveState();
        canvas.addEventListener('mouseup', () => {
            handle = false;
            firstPoint = [0, 0];
            secondPoint = [0, 0];
            saveState();
        });
        canvas.addEventListener('mousemove', (e) => {
            if(handle === true) {
                firstPoint[0] = secondPoint[0];
                firstPoint[1] = secondPoint[1];
                let inter = pencilDraw(e);
                console.log(inter);
                secondPoint[0] = inter[0];
                secondPoint[1] = inter[2];
                if((Math.abs(firstPoint[0] - secondPoint[0]) > 130 || Math.abs(firstPoint[1] - secondPoint[1]) > 130) && firstPoint[0] > 0)
                {
                    BrezAlg(firstPoint[0], secondPoint[0], firstPoint[1], secondPoint[1]);
                }
                saveState();
                console.log(firstPoint, secondPoint);
            }
        });
    }

    if(activeButtonId === 'picker') {
        changeColor(findColor(0, 0, e));
    }
});


function findColor(...args) {
    let x;
    let y;
    if(args[2]) {
        x = args[2].clientX - canvas.offsetLeft;
        y = args[2].clientY - canvas.offsetTop;
    } else {
        x = args[0];
        y = args[1];
    }
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let pixels = imageData.data;
    let pixelRedIndex = ((y - 1) * (imageData.width * 4)) + ((x - 1) * 4);
    let pixelColor = "rgba("+pixels[pixelRedIndex]+", "+pixels[pixelRedIndex+1]+", "+pixels[pixelRedIndex+2]+", "+(pixels[pixelRedIndex+3]/255)+")";
    return pixelColor;
}

function pencilDraw(e) {
    let x = e.clientX - canvas.offsetLeft;
    let y = e.clientY - canvas.offsetTop;
    let arr = draw(x, y);
    let result = [];
    arr.map((x,i) => {result[i] = x;});
    return result;
}

function drawBucket(color) {
    if (canvas && canvas.getContext) {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 512, 512);
    } else throw new Error('Canvas Error');
}

buttons.forEach((button) => {
    button.addEventListener('click', () => {
        for(let i = 0; i < buttons.length; i++) {
            if(buttons[i].classList.contains('active')) buttons[i].classList.remove('active') ;
        }       
        button.classList.add('active');
    });
});

document.addEventListener('keydown', (e) => {
    if((e.code === 'KeyB') || (e.code === 'KeyC') || e.code === 'KeyP')
    {
        for(let i = 0; i < buttons.length; i++) {
            if(buttons[i].classList.contains('active')) {
                buttons[i].classList.remove('active');
                break;
            }
        }
    }
    if(e.code === 'KeyB') buttons[0].classList.add('active');
    if(e.code === 'KeyC') buttons[1].classList.add('active');
    if(e.code === 'KeyP') buttons[2].classList.add('active');
})