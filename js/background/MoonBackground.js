class MoonBackground {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.moon = null;
        this.time = 0;
        this.initMoon();
    }

    initMoon() {
        this.moon = {
            x: this.canvasWidth * 0.8,
            y: this.canvasHeight * 0.15,
            radius: 40,
            phase: 0.8,
            glowRadius: 60,
            glowIntensity: 0.3,
            speed: 0.1,
            craters: []
        };

        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * this.moon.radius * 0.7;
            const size = 2 + Math.random() * 8;

            this.moon.craters.push({
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
                size: size,
                depth: 0.2 + Math.random() * 0.3
            });
        }
    }

    update(deltaTime) {
        this.time += deltaTime;
        this.moon.x -= this.moon.speed;
        if (this.moon.x < -this.moon.radius) {
            this.moon.x = this.canvasWidth + this.moon.radius;
        }
    }

    render(ctx) {
        const moon = this.moon;

        // Свечение луны
        const glowGradient = ctx.createRadialGradient(
            moon.x, moon.y, moon.radius,
            moon.x, moon.y, moon.glowRadius
        );
        glowGradient.addColorStop(0, `rgba(255, 255, 200, ${moon.glowIntensity})`);
        glowGradient.addColorStop(1, 'transparent');

        ctx.save();
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(moon.x, moon.y, moon.glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Тело луны
        ctx.fillStyle = '#f5f5dc';
        ctx.beginPath();
        ctx.arc(moon.x, moon.y, moon.radius, 0, Math.PI * 2);
        ctx.fill();

        // Тени на луне (фаза)
        if (moon.phase < 1) {
            ctx.fillStyle = '#0a0a2a';
            ctx.beginPath();
            ctx.arc(
                moon.x + moon.radius * (1 - moon.phase) * 2,
                moon.y,
                moon.radius,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }

        // Кратеры
        moon.craters.forEach(crater => {
            const craterX = moon.x + crater.x;
            const craterY = moon.y + crater.y;

            ctx.fillStyle = '#d4c9a8';
            ctx.beginPath();
            ctx.arc(craterX, craterY, crater.size, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#b8a987';
            ctx.beginPath();
            ctx.arc(craterX, craterY, crater.size * crater.depth, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }

    reset() {
        this.initMoon();
    }
}