const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width = window.innerWidth;
let height = window.innerHeight;

let stars = [];
let shockwave = null;

const starColors = ['#ffffff', '#e0f2fe', '#bae6fd', '#fef08a', '#f472b6', '#a78bfa'];

function getRandomStarColor() {
    let randomIndex = Math.floor(Math.random() * starColors.length);
    return starColors[randomIndex];
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initStars();
}

function Star() {
    this.baseX = Math.random() * width;
    this.baseY = Math.random() * height;
    this.x = this.baseX;
    this.y = this.baseY;
    this.vx = 0;
    this.vy = 0;
    this.size = Math.random() * 1.5 + 0.5;
    this.color = getRandomStarColor();
    this.springK = 0.03;
    this.friction = 0.88;
}

Star.prototype.update = function() {
    let dx = this.baseX - this.x;
    let dy = this.baseY - this.y;

    this.vx += dx * this.springK;
    this.vy += dy * this.springK;

    this.vx *= this.friction;
    this.vy *= this.friction;

    this.x += this.vx;
    this.y += this.vy;
};

Star.prototype.draw = function() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
};

function initStars() {
    stars = [];
    const count = Math.floor((width * height) / 3000);
    for (let i = 0; i < count; i++) {
        stars.push(new Star());
    }
}

function Shockwave(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 0;
    this.maxRadius = Math.max(width, height) * 0.7;
    this.speed = 8;
    this.thickness = 40;
}

Shockwave.prototype.update = function() {
    this.radius += this.speed;
};

Shockwave.prototype.draw = function() {
    let alpha = 1 - (this.radius / this.maxRadius);
    if (alpha <= 0) return;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0, 223, 216, ${alpha * 0.6})`;
    ctx.lineWidth = 2;
    ctx.stroke();
};

function animate() {
    ctx.fillStyle = '#0c0707';
    ctx.fillRect(0, 0, width, height);

    if (shockwave) {
        shockwave.update();
        shockwave.draw();
        if (shockwave.radius >= shockwave.maxRadius) {
            shockwave = null;
        }
    }

    for (let i = 0; i < stars.length; i++) {
        stars[i].update();
        stars[i].draw();
    }

    requestAnimationFrame(animate);
}

window.addEventListener('resize', resize);

window.addEventListener('click', function(e) {
    shockwave = new Shockwave(e.clientX, e.clientY);
});

resize();
animate();