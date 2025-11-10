const socket = io();
const canvas = document.getElementById('drawingBoard');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth - 40;
canvas.height = window.innerHeight - 150;

let drawing = false;
let brushColor = document.getElementById('colorPicker').value;
let brushSize = document.getElementById('brushSize').value;

canvas.addEventListener('mousedown', () => drawing = true);
canvas.addEventListener('mouseup', () => {
  drawing = false;
  ctx.beginPath();
});
canvas.addEventListener('mouseout', () => drawing = false);

canvas.addEventListener('mousemove', (e) => {
  if (!drawing) {
    socket.emit('cursor', { x: e.clientX, y: e.clientY });
    return;
  }

  const x = e.clientX;
  const y = e.clientY;

  ctx.lineWidth = brushSize;
  ctx.lineCap = 'round';
  ctx.strokeStyle = brushColor;

  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);

  socket.emit('draw', { x, y, color: brushColor, size: brushSize });
});

socket.on('draw', (data) => {
  ctx.lineWidth = data.size;
  ctx.lineCap = 'round';
  ctx.strokeStyle = data.color;
  ctx.lineTo(data.x, data.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(data.x, data.y);
});

document.getElementById('colorPicker').addEventListener('change', (e) => {
  brushColor = e.target.value;
});

document.getElementById('brushSize').addEventListener('change', (e) => {
  brushSize = e.target.value;
});

document.getElementById('clearBtn').addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

const cursors = {};
socket.on('cursor', (data) => {
  if (!cursors[data.id]) {
    const el = document.createElement('div');
    el.style.position = 'absolute';
    el.style.width = '10px';
    el.style.height = '10px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = data.color;
    el.style.pointerEvents = 'none';
    document.body.appendChild(el);
    cursors[data.id] = el;
  }
  cursors[data.id].style.left = data.x + 'px';
  cursors[data.id].style.top = data.y + 'px';
});

socket.on('user-list', (users) => {
  console.log('Active users:', Object.keys(users).length);
});
