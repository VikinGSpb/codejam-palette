const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');

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

function fillCanvas() {
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

fillCanvas();