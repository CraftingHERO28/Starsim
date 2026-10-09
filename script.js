const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width = window.innerWidth;
let height = window.innerHeight;

let stars = [];
let shockwave = null;

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
    this.color = '#aaaaaa';
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
    this.force = 50;
    this.thickness = 40;
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
    ctx.strokeStyle = `rgba(180, 180, 180, ${alpha * 0.4})`;
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
