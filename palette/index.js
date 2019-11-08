const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const buttons = document.querySelectorAll('.options--list-item:not(.inactive):not(.colors)');

function draw(arr) {
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

function prefillCanvas() {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://raw.githubusercontent.com/rolling-scopes-school/tasks/master/tasks/stage-2/codejam-canvas/data/4x4.json');
    xhr.responseType = 'json';
    xhr.send();
    xhr.onload = () => {
        let arr = [];
        arr = xhr.response;
        draw(arr);
    }
    xhr.onerror = () => {
        throw new Error('Data Error');
    }
}

prefillCanvas();

canvas.addEventListener('click', () => {
    let activeButtonId;
    buttons.forEach((button) => {
        if(button.classList.contains('active')) activeButtonId = button.getAttribute('id');
    });
    console.log(activeButtonId);

    if(activeButtonId === 'bucket') {
        drawBucket('000000');
    }
})

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
