const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const buttons = document.querySelectorAll('.options__list_item:not(.inactive):not(.colors)');
let currentColor = '#00ff00';
let previousColor = '#000000';
const inputColor = document.querySelector('#inputColor');
const previousColorElement = document.querySelector('#previous');
const allColors = document.querySelectorAll('.options__circle:not(#inputColor)');
const label = document.querySelector('#label');
let handle = true;
let firstPoint = [0, 0];
let secondPoint = [0, 0];

function findColor(...args) {
  let x;
  let y;
  if (args[2]) {
    x = args[2].clientX - canvas.offsetLeft;
    y = args[2].clientY - canvas.offsetTop;
  } else {
    [x, y] = args;
  }
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  const pixelRedIndex = ((y - 1) * (imageData.width * 4)) + ((x - 1) * 4);
  const pixelColor = `rgba(${pixels[pixelRedIndex]}, ${pixels[pixelRedIndex + 1]}, ${pixels[pixelRedIndex + 2]}, ${pixels[pixelRedIndex + 3] / 255})`;
  return pixelColor;
}

function saveState() {
  try {
    localStorage.setItem('previousColor', previousColor);
    localStorage.setItem('currentColor', currentColor);
    const currentImage = canvas.toDataURL();
    localStorage.setItem('canvasImage', currentImage);
  } catch (e) { console.log('LocalStorage error'); }
}

function changeColor(color) {
  const inter = currentColor;
  currentColor = color;
  previousColor = inter;
  previousColorElement.style.backgroundColor = previousColor;
  inputColor.value = currentColor;
  label.style.backgroundColor = currentColor;
  saveState();
}

function drawFromArr(arr, type) {
  if (canvas && canvas.getContext) {
    arr.forEach((row, rowIdx) => {
      row.forEach((column, colIdx) => {
        if (type === 0) {
          if (column.length === 6) {
            ctx.fillStyle = `#${column}`;
          } else {
            ctx.fillStyle = `rgba(${column})`;
          }
        } else ctx.fillStyle = column;
        ctx.fillRect(colIdx * (512 / arr.length), rowIdx * (512 / arr.length),
          (colIdx + 1) * (512 / arr.length), (rowIdx + 1) * (512 / arr.length));
      });
    });
  } else throw new Error('Canvas Error');
}

function prefillCanvas() {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://raw.githubusercontent.com/rolling-scopes-school/tasks/master/tasks/stage-2/codejam-canvas/data/4x4.json');
  xhr.responseType = 'json';
  xhr.send();
  xhr.onload = () => {
    drawFromArr(xhr.response, 0);
  };
  xhr.onerror = () => {
    throw new Error('Data Error');
  };
}

window.onload = () => {
  try {
    if (localStorage.getItem('currentColor')) currentColor = localStorage.getItem('currentColor');
    if (localStorage.getItem('previousColor')) previousColor = localStorage.getItem('previousColor');
    if (localStorage.getItem('canvasImage')) {
      const canvasImg = new Image();
      const dataUrl = localStorage.getItem('canvasImage');
      canvasImg.src = dataUrl;
      canvasImg.onload = () => {
        ctx.drawImage(canvasImg, 0, 0);
      };
    } else prefillCanvas();
  } catch (e) { console.log('LocalStorage errors'); }
  inputColor.value = currentColor;
  label.style.backgroundColor = currentColor;
  previousColorElement.style.backgroundColor = previousColor;
  allColors.forEach((color) => {
    color.addEventListener('click', () => {
      switch (color.getAttribute('id')) {
        case 'red': changeColor('#F74141'); break;
        case 'blue': changeColor('#41B6F7'); break;
        case 'previous': changeColor(previousColor); break;
        default: break;
      }
    });
  });
  inputColor.addEventListener('change', (e) => {
    changeColor(e.target.value);
  });
  inputColor.select();
};

function draw(x, y) {
  let startX = 0;
  let startY = 0;
  for (; (startX <= 512) && (startY <= 512); startX += 128, startY += 128) {
    if ((startX - x >= -128) && (startY - y >= -128)) break;
    if (startX - x >= -128) startX -= 128;
    if (startY - y >= -128) startY -= 128;
  }
  if (canvas && canvas.getContext) {
    ctx.fillStyle = currentColor;
    ctx.fillRect(startX, startY, 128, 128);
  } else throw new Error('Canvas Error');
  return [startX, startX + 129, startY, startY + 129];
}

function BrezAlg(x1, x2, y1, y2) {
  let x = x1;
  let y = y1;
  const deltaX = Math.abs(x2 - x);
  const deltaY = Math.abs(y2 - y);
  const signX = x < x2 ? 1 : -1;
  const signY = y < y2 ? 1 : -1;
  let error = deltaX - deltaY;
  draw(x2, y2);
  while (x !== x2 || y !== y2) {
    draw(x, y);
    const error2 = error * 2;
    if (error2 > -deltaY) {
      error -= deltaY;
      x += signX;
    }
    if (error2 < deltaX) {
      error += deltaX;
      y += signY;
    }
  }
}

function pencilDraw(e) {
  const x = e.clientX - canvas.offsetLeft;
  const y = e.clientY - canvas.offsetTop;
  return draw(x, y);
}

function drawBucket(color) {
  if (canvas && canvas.getContext) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 512, 512);
  } else throw new Error('Canvas Error');
}

canvas.addEventListener('mousedown', (e) => {
  let activeButtonId;
  buttons.forEach((button) => {
    if (button.classList.contains('active')) activeButtonId = button.getAttribute('id');
  });
  if (activeButtonId === 'bucket') {
    drawBucket(currentColor);
    saveState();
  }

  if (activeButtonId === 'pencil') {
    handle = true;
    pencilDraw(e);
    saveState();
    canvas.addEventListener('mouseup', () => {
      handle = false;
      firstPoint = [0, 0];
      secondPoint = [0, 0];
      saveState();
    });
    canvas.addEventListener('mousemove', (event) => {
      if (handle === true) {
        [firstPoint[0], firstPoint[1]] = secondPoint;
        const inter = pencilDraw(event);
        [secondPoint[0], , secondPoint[1]] = inter;
        if ((Math.abs(firstPoint[0] - secondPoint[0]) > 130
        || Math.abs(firstPoint[1] - secondPoint[1]) > 130) && firstPoint[0] > 0) {
          BrezAlg(firstPoint[0], secondPoint[0], firstPoint[1], secondPoint[1]);
        }
      }
    });
  }

  if (activeButtonId === 'picker') {
    changeColor(findColor(0, 0, e));
  }
});

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    for (let i = 0; i < buttons.length; i += 1) {
      if (buttons[i].classList.contains('active')) buttons[i].classList.remove('active');
    }
    button.classList.add('active');
  });
});

document.addEventListener('keydown', (e) => {
  const keys = ['KeyB', 'KeyC', 'KeyP'];
  if (keys.includes(e.code)) {
    buttons.forEach((button) => button.classList.remove('active'));
  }
  keys.forEach((key, keyIdx) => e.code === key && buttons[keyIdx].classList.add('active'));
});
