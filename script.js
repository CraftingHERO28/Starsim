const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width = window.innerWidth;
let height = window.innerHeight;

let stars = [];
let shockwave = null;
let colorMode = 'white';

const starColors = ['#e0f2fe', '#bae6fd', '#fef08a', '#f472b6', '#a78bfa'];

function getStarColor() {
    if (colorMode === 'white') return '#ffffff';
    if (colorMode === 'black') return '#222222';
    return starColors[Math.floor(Math.random() * starColors.length)];
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
    this.size = Math.random() * 1.8 + 0.6;
    this.color = getStarColor();
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
    this.maxRadius = Math.max(width, height) * 1.2; // Größerer Ring
    this.speed = 9;
    this.force = 70;
    this.thickness = 60;
}

Shockwave.prototype.update = function() {
    this.radius += this.speed;
    let waveStart = this.radius - this.thickness;
    let waveEnd = this.radius + this.thickness;

    for (let i = 0; i < stars.length; i++) {
        let star = stars[i];
        let dx = star.x - this.x;
        let dy = star.y - this.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist >= waveStart && dist <= waveEnd) {
            let angle = Math.atan2(dy, dx);
            let impact = (this.force * 0.1) * (1 - (this.radius / this.maxRadius));
            star.vx += Math.cos(angle) * impact;
            star.vy += Math.sin(angle) * impact;
        }
    }
};

Shockwave.prototype.draw = function() {
    let alpha = 1 - (this.radius / this.maxRadius);
    if (alpha <= 0) return;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0, 223, 216, ${alpha * 0.6})`;
    ctx.lineWidth = 3;
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
    if (e.target.closest('.controls')) return;
    shockwave = new Shockwave(e.clientX, e.clientY);
});

document.querySelectorAll('input[name="colorMode"]').forEach(input => {
    input.addEventListener('change', (e) => {
        colorMode = e.target.value;
        for (let i = 0; i < stars.length; i++) {
            stars[i].color = getStarColor();
        }
    });
});

resize();
animate();