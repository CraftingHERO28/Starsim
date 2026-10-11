const canvas = document.getElementById('canvas');
const ctx = canvas ? canvas.getContext('2d') : null;

let width = window.innerWidth;
let height = window.innerHeight;

let stars = [];
let shockwaves = [];
let colorMode = 'white';

const powerInput = document.querySelector('input[name="power"]');
const speedInput = document.querySelector('input[name="speed"]');
const starColors = ['#e0f2fe', '#bae6fd', '#fef08a', '#f472b6', '#a78bfa'];
const gpuCheckbox = document.querySelector('input[name="show GPU-Info"]');
const gpuDisplay = document.querySelector('.gpu-display');

if (gpuCheckbox && gpuDisplay) {
    gpuDisplay.style.display = gpuCheckbox.checked ? 'block' : 'none';

    gpuCheckbox.addEventListener('change', function() {
        if (this.checked) {
            gpuDisplay.style.display = 'block';
        } else {
            gpuDisplay.style.display = 'none';
        }
    });
}

const gpuTextElement = document.getElementById('gpu-text');
if (gpuTextElement) {
    try {
        const tempCanvas = document.createElement('canvas');
        const gl = tempCanvas.getContext('webgl') || tempCanvas.getContext('experimental-webgl');
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        
        if (debugInfo) {
            let renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            renderer = renderer.replace(/ANGLE \([^,]+,\s*([^,]+),\s*[^)]+\)/, '$1');
            
            gpuTextElement.textContent = renderer;
        } else {
            gpuTextElement.textContent = 'GPU-Info n/a';
        }
    } catch (e) {
        gpuTextElement.textContent = 'GPU-Info n/a';
    }
}

function getPower() {
    return Number(powerInput ? powerInput.value : 7) || 7;
}

function getSpeed() {
    return Number(speedInput ? speedInput.value : 7) || 7;
}

function getStarColor() {
    if (colorMode === 'white') return '#ffffff';
    if (colorMode === 'black') return '#222222';
    return starColors[Math.floor(Math.random() * starColors.length)];
}

function resize() {
    if (!canvas || !ctx) return;

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
    this.size = Math.random() * 2.8 + 0.6;
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
    if (!ctx) return;

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
    this.maxRadius = Math.max(width, height) * 1.2;
    this.speed = getSpeed() * 2.2;
    this.force = getPower() * 12;
    this.thickness = 18;
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
    if (!ctx) return;

    let alpha = 1 - (this.radius / this.maxRadius);
    if (alpha <= 0) return;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0, 223, 216, ${Math.max(0, alpha * 0.6)})`;
    ctx.lineWidth = 3;
    ctx.stroke();
};

function spawnShockwave(x, y) {
    shockwaves.push(new Shockwave(x, y));
}

function animate() {
    if (!ctx) return;

    ctx.fillStyle = '#0c0707';
    ctx.fillRect(0, 0, width, height);

    for (let i = shockwaves.length - 1; i >= 0; i--) {
        let wave = shockwaves[i];
        wave.update();
        wave.draw();

        if (wave.radius >= wave.maxRadius) {
            shockwaves.splice(i, 1);
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
    spawnShockwave(e.clientX, e.clientY);
});

if (powerInput) {
    powerInput.addEventListener('input', function() {
        for (let i = 0; i < shockwaves.length; i++) {
            shockwaves[i].force = getPower() * 12;
        }
    });
}

if (speedInput) {
    speedInput.addEventListener('input', function() {
        for (let i = 0; i < shockwaves.length; i++) {
            shockwaves[i].speed = getSpeed() * 2.2;
        }
    });
}

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