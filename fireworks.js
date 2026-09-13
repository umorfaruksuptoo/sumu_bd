/**
 * Fireworks & Celebration Particle Engine
 * High-performance Canvas animation for fireworks, confetti, and starry background
 */
class CelebrationEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.fireworks = [];
        this.particles = [];
        this.confettiPieces = [];
        this.stars = [];
        this.shootingStars = [];
        this.isRunning = false;
        this.isCelebrationMode = false;
        this.autoFireworkInterval = null;

        this.colors = [
            '#ff4d79', '#ff758c', '#ff8eb4', // Pinks / Rose
            '#ffd166', '#ffb703', '#fb8500', // Warm Golds / Sunsets
            '#06d6a0', '#4cc9f0', '#7209b7', // Cyan, Purples
            '#ffffff', '#f72585', '#b5179e'  // Starlight & Magenta
        ];

        this.initResize();
        this.initStars();
        this.bindEvents();
        this.startLoop();
    }

    initResize() {
        const resize = () => {
            this.width = this.canvas.width = window.innerWidth;
            this.height = this.canvas.height = window.innerHeight;
            this.initStars();
        };
        window.addEventListener('resize', resize);
        resize();
    }

    initStars() {
        this.stars = [];
        const starCount = Math.floor((this.width * this.height) / 4000);
        for (let i = 0; i < starCount; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: Math.random() * 1.6 + 0.4,
                alpha: Math.random() * 0.8 + 0.2,
                twinkleSpeed: (Math.random() * 0.02 + 0.005) * (Math.random() > 0.5 ? 1 : -1)
            });
        }
    }

    bindEvents() {
        window.addEventListener('click', (e) => {
            // Launch firework to clicked point if in celebration mode and not clicking interactive UI
            if (this.isCelebrationMode && !e.target.closest('button, a, input, textarea, .polaroid-card, .envelope, .balloon, .candle')) {
                this.launchFirework(e.clientX, e.clientY);
                if (window.soundEngine) {
                    window.soundEngine.playFireworkPop();
                }
            }
        });
    }

    launchFirework(targetX, targetY) {
        const startX = targetX + (Math.random() - 0.5) * 100;
        const startY = this.height;
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        const isHeart = Math.random() > 0.65;

        this.fireworks.push({
            x: startX,
            y: startY,
            targetX: targetX,
            targetY: targetY,
            speed: 12 + Math.random() * 4,
            angle: Math.atan2(targetY - startY, targetX - startX),
            color: color,
            isHeart: isHeart,
            trail: [],
            arrived: false
        });
    }

    explode(x, y, color, isHeart = false) {
        const particleCount = isHeart ? 70 : 90 + Math.floor(Math.random() * 40);

        if (isHeart) {
            // Heart-shaped explosion
            for (let i = 0; i < particleCount; i++) {
                const angle = (i / particleCount) * Math.PI * 2;
                // Parametric heart formula
                const hx = 16 * Math.pow(Math.sin(angle), 3);
                const hy = -(13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle));
                const speed = 0.2 + Math.random() * 0.1;

                this.particles.push({
                    x: x,
                    y: y,
                    vx: hx * speed,
                    vy: hy * speed,
                    alpha: 1,
                    decay: 0.012 + Math.random() * 0.01,
                    color: '#ff4d79',
                    size: Math.random() * 2.5 + 1.5,
                    flicker: true
                });
            }
        } else {
            // Radial burst with sparks
            for (let i = 0; i < particleCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 6 + 1.5;
                const pColor = Math.random() > 0.2 ? color : '#ffffff';

                this.particles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    alpha: 1,
                    decay: 0.012 + Math.random() * 0.016,
                    color: pColor,
                    size: Math.random() * 2.5 + 1,
                    gravity: 0.08,
                    resistance: 0.96
                });
            }
        }
    }

    addConfettiBurst() {
        const confettiCount = 120;
        const shapes = ['rect', 'circle', 'ribbon'];
        for (let i = 0; i < confettiCount; i++) {
            this.confettiPieces.push({
                x: Math.random() * this.width,
                y: -20 - Math.random() * 100,
                w: Math.random() * 10 + 6,
                h: Math.random() * 6 + 4,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                shape: shapes[Math.floor(Math.random() * shapes.length)],
                vx: (Math.random() - 0.5) * 3,
                vy: Math.random() * 3 + 2,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 8,
                swing: Math.random() * 0.05,
                swingAngle: Math.random() * Math.PI * 2,
                alpha: 1,
                decay: 0.002
            });
        }
    }

    triggerCelebrationExplosion() {
        this.isCelebrationMode = true;
        this.addConfettiBurst();

        // Launch multiple staggered fireworks
        let count = 0;
        const launchBatch = () => {
            const numRockets = 3 + Math.floor(Math.random() * 3);
            for (let i = 0; i < numRockets; i++) {
                const targetX = this.width * 0.15 + Math.random() * (this.width * 0.7);
                const targetY = this.height * 0.12 + Math.random() * (this.height * 0.45);
                setTimeout(() => {
                    this.launchFirework(targetX, targetY);
                    if (window.soundEngine && count % 2 === 0) {
                        window.soundEngine.playFireworkPop();
                    }
                }, i * 220);
            }
            count++;
            if (count < 8) {
                setTimeout(launchBatch, 900);
            } else {
                // Settle into continuous ambient celebration fireworks
                this.startContinuousCelebration();
            }
        };

        launchBatch();
    }

    startContinuousCelebration() {
        if (this.autoFireworkInterval) clearInterval(this.autoFireworkInterval);
        this.autoFireworkInterval = setInterval(() => {
            if (!this.isCelebrationMode) return;
            const targetX = this.width * 0.1 + Math.random() * (this.width * 0.8);
            const targetY = this.height * 0.1 + Math.random() * (this.height * 0.45);
            this.launchFirework(targetX, targetY);
            if (Math.random() > 0.5 && window.soundEngine) {
                window.soundEngine.playFireworkPop();
            }
            if (this.confettiPieces.length < 50) {
                this.addConfettiBurst();
            }
        }, 1800);
    }

    stopCelebration() {
        this.isCelebrationMode = false;
        if (this.autoFireworkInterval) {
            clearInterval(this.autoFireworkInterval);
            this.autoFireworkInterval = null;
        }
        this.fireworks = [];
        this.particles = [];
        this.confettiPieces = [];
    }

    update() {
        // Twinkling stars
        this.stars.forEach(star => {
            star.alpha += star.twinkleSpeed;
            if (star.alpha > 0.95 || star.alpha < 0.2) {
                star.twinkleSpeed = -star.twinkleSpeed;
            }
        });

        // Shooting stars occasional spawn
        if (Math.random() < 0.008 && this.shootingStars.length < 2) {
            this.shootingStars.push({
                x: Math.random() * this.width,
                y: Math.random() * (this.height * 0.4),
                length: Math.random() * 80 + 40,
                speed: Math.random() * 10 + 8,
                angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
                alpha: 1
            });
        }

        // Update shooting stars
        for (let i = this.shootingStars.length - 1; i >= 0; i--) {
            const ss = this.shootingStars[i];
            ss.x += Math.cos(ss.angle) * ss.speed;
            ss.y += Math.sin(ss.angle) * ss.speed;
            ss.alpha -= 0.025;
            if (ss.alpha <= 0 || ss.x > this.width || ss.y > this.height) {
                this.shootingStars.splice(i, 1);
            }
        }

        // Update rising fireworks
        for (let i = this.fireworks.length - 1; i >= 0; i--) {
            const fw = this.fireworks[i];
            const dist = Math.hypot(fw.targetX - fw.x, fw.targetY - fw.y);

            fw.trail.push({ x: fw.x, y: fw.y });
            if (fw.trail.length > 7) fw.trail.shift();

            if (dist < fw.speed || fw.y <= fw.targetY) {
                this.explode(fw.targetX, fw.targetY, fw.color, fw.isHeart);
                this.fireworks.splice(i, 1);
            } else {
                fw.x += Math.cos(fw.angle) * fw.speed;
                fw.y += Math.sin(fw.angle) * fw.speed;
            }
        }

        // Update explosion particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            if (p.resistance) {
                p.vx *= p.resistance;
                p.vy *= p.resistance;
            }
            if (p.gravity) {
                p.vy += p.gravity;
            }
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Update confetti pieces
        for (let i = this.confettiPieces.length - 1; i >= 0; i--) {
            const c = this.confettiPieces[i];
            c.swingAngle += c.swing;
            c.x += c.vx + Math.sin(c.swingAngle) * 1.5;
            c.y += c.vy;
            c.rotation += c.rotationSpeed;

            if (c.y > this.height + 20) {
                if (this.isCelebrationMode) {
                    c.y = -20;
                    c.x = Math.random() * this.width;
                } else {
                    this.confettiPieces.splice(i, 1);
                }
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw Background Stars
        this.stars.forEach(star => {
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
            this.ctx.fill();
        });

        // Draw Shooting Stars
        this.shootingStars.forEach(ss => {
            this.ctx.save();
            this.ctx.beginPath();
            const tailX = ss.x - Math.cos(ss.angle) * ss.length;
            const tailY = ss.y - Math.sin(ss.angle) * ss.length;
            const grad = this.ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
            grad.addColorStop(1, `rgba(255, 255, 255, ${ss.alpha})`);
            this.ctx.strokeStyle = grad;
            this.ctx.lineWidth = 2;
            this.ctx.moveTo(tailX, tailY);
            this.ctx.lineTo(ss.x, ss.y);
            this.ctx.stroke();
            this.ctx.restore();
        });

        // Draw Fireworks Trails & Rockets
        this.fireworks.forEach(fw => {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.strokeStyle = fw.color;
            this.ctx.lineWidth = 2.5;
            if (fw.trail.length > 1) {
                this.ctx.moveTo(fw.trail[0].x, fw.trail[0].y);
                for (let j = 1; j < fw.trail.length; j++) {
                    this.ctx.lineTo(fw.trail[j].x, fw.trail[j].y);
                }
            }
            this.ctx.stroke();

            // Rocket head
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(fw.x, fw.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });

        // Draw Explosion Particles
        this.particles.forEach(p => {
            this.ctx.save();
            this.ctx.globalAlpha = Math.max(0, p.alpha);
            this.ctx.fillStyle = p.color;
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });

        // Draw Confetti Pieces
        this.confettiPieces.forEach(c => {
            this.ctx.save();
            this.ctx.translate(c.x, c.y);
            this.ctx.rotate((c.rotation * Math.PI) / 180);
            this.ctx.fillStyle = c.color;
            this.ctx.globalAlpha = c.alpha;

            if (c.shape === 'circle') {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, c.w / 2, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (c.shape === 'ribbon') {
                this.ctx.fillRect(-c.w / 2, -c.h / 2, c.w * 1.5, c.h * 0.6);
            } else {
                this.ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
            }
            this.ctx.restore();
        });
    }

    startLoop() {
        const loop = () => {
            this.update();
            this.draw();
            requestAnimationFrame(loop);
        };
        loop();
    }
}

window.CelebrationEngine = CelebrationEngine;
