const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const buttons = document.querySelectorAll('.options--list-item:not(.inactive):not(.colors)');

function drawFromArr(arr) {
    if (canvas && canvas.getContext) {
        arr.forEach((row, rowIdx) => {
            row.forEach((column, colIdx) => {
                if(column.length === 6) {
                    ctx.fillStyle = "#" + column;
                } else {
                    ctx.fillStyle = "rgba(" + column + ")";
                }
                ctx.fillRect(colIdx * 512 / arr.length, rowIdx * 512 / arr.length, (colIdx + 1) * 512 / arr.length, (rowIdx + 1) * 512 / arr.length);
            })
        })
    } else throw new Error('Canvas Error');
}

/*function prefillCanvas() {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://raw.githubusercontent.com/rolling-scopes-school/tasks/master/tasks/stage-2/codejam-canvas/data/4x4.json');
    xhr.responseType = 'json';
    xhr.send();
    xhr.onload = () => {
        let arr = [];
        arr = xhr.response;
        drawFromArr(arr);
    }
    xhr.onerror = () => {
        throw new Error('Data Error');
    }
}

prefillCanvas();*/

function draw(x, y) {
    let startX = 0;
    let startY = 0;
    for(; startX <= 512, startY <= 512; startX += 128, startY += 128) {
        if((startX - x >= -128) && (startY - y >= -128)) break;
        if(startX - x >= -128) startX -= 128;
        if(startY - y >= -128) startY -= 128;
    }
    console.log(startX, startY);
    let finX = startX + 128;
    let finY = startY + 128;
    console.log(finX, finY);
    if(canvas && canvas.getContext) {
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(startX, startY, finX, finY);
        console.log(startX, startY);
        console.log(finX, finY);
    } else throw new Error('Canvas Error');
}

canvas.addEventListener('mouseup', (e) => {
    let activeButtonId;
    buttons.forEach((button) => {
        if(button.classList.contains('active')) activeButtonId = button.getAttribute('id');
    });
    console.log(activeButtonId);

    if(activeButtonId === 'bucket') {
        drawBucket('000000');
    }

    if(activeButtonId === 'pencil') {
        pencilDraw(e);
    }
})

function pencilDraw(e) {
    let x = e.clientX - canvas.offsetLeft;
    let y = e.clientY - canvas.offsetTop;
    console.log(x, y);
    draw(x, y);
}

function drawBucket(color) {
    if (canvas && canvas.getContext) {
        if(color.length === 6) {
            ctx.fillStyle = "#" + color;
        } else {
            ctx.fillStyle = "rgba(" + color + ")";
        }
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
