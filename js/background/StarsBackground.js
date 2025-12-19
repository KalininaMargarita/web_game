class StarsBackground {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.stars = [];
        this.time = 0;
        this.initStars();
    }

    initStars() {
        for (let i = 0; i < 150; i++) {
            const layer = Math.floor(Math.random() * 3);
            const size = layer === 0 ? 1 : layer === 1 ? 2 : 3;
            const brightness = 0.3 + Math.random() * 0.7;
            const speed = layer * 0.1 + Math.random() * 0.1;
            const twinkleSpeed = 1 + Math.random() * 3;

            this.stars.push({
                x: Math.random() * this.canvasWidth,
                y: Math.random() * (this.canvasHeight * 0.7),
                size: size,
                brightness: brightness,
                speed: speed,
                twinkleSpeed: twinkleSpeed,
                twinkleOffset: Math.random() * Math.PI * 2,
                layer: layer
            });
        }
    }

    update(deltaTime) {
        this.time += deltaTime;
        this.stars.forEach(star => {
            star.twinkleOffset += star.twinkleSpeed * deltaTime * 0.001;
            star.x -= star.speed;
            if (star.x < -10) {
                star.x = this.canvasWidth + 10;
                star.y = Math.random() * (this.canvasHeight * 0.7);
            }
        });
    }

    render(ctx) {
        // Градиентное ночное небо
        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
        gradient.addColorStop(0, '#0a0a2a');
        gradient.addColorStop(0.4, '#1a1a3a');
        gradient.addColorStop(0.7, '#2a2a4a');
        gradient.addColorStop(1, '#3a3a5a');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Легкая дымка у горизонта
        const horizonGradient = ctx.createLinearGradient(0, this.canvasHeight * 0.7, 0, this.canvasHeight);
        horizonGradient.addColorStop(0, 'rgba(50, 50, 80, 0.3)');
        horizonGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = horizonGradient;
        ctx.fillRect(0, this.canvasHeight * 0.7, this.canvasWidth, this.canvasHeight * 0.3);

        // Звезды
        this.stars.forEach(star => {
            const twinkle = 0.7 + Math.sin(star.twinkleOffset) * 0.3;
            const alpha = star.brightness * twinkle;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#ffffff';

            if (star.layer === 2) {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                for (let i = 0; i < 4; i++) {
                    const angle = (i * Math.PI) / 2;
                    ctx.moveTo(
                        star.x + Math.cos(angle) * star.size,
                        star.y + Math.sin(angle) * star.size
                    );
                    ctx.lineTo(
                        star.x + Math.cos(angle) * star.size * 3,
                        star.y + Math.sin(angle) * star.size * 3
                    );
                }
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        });
    }

    reset() {
        this.stars = [];
        this.initStars();
    }
}