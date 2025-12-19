// Класс для управления эффектами крови и частицами
class BloodSystem {
    constructor() {
        this.bloodEffects = [];
        this.particles = [];
    }

    // Добавить эффект крови
    addBloodEffect(x, y, intensity = 1) {
        // Основное пятно крови
        this.bloodEffects.push({
            x: x,
            y: y,
            radius: 20 * intensity,
            lifetime: 1000,
            intensity: intensity
        });

        // Частицы крови
        const particleCount = 15 * intensity;
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            const life = 500 + Math.random() * 1000;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                size: 2 + Math.random() * 4,
                lifetime: life,
                intensity: intensity
            });
        }

        console.log('Эффект крови с интенсивностью:', intensity);
    }

    // Обновить эффекты
    update(deltaTime) {
        // Обновляем эффекты крови
        for (let i = this.bloodEffects.length - 1; i >= 0; i--) {
            const effect = this.bloodEffects[i];
            effect.lifetime -= deltaTime;
            effect.radius *= 0.99;

            if (effect.lifetime <= 0) {
                this.bloodEffects.splice(i, 1);
            }
        }

        // Обновляем частицы
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx * (deltaTime / 1000);
            particle.y += particle.vy * (deltaTime / 1000);
            particle.vy += 0.5 * (deltaTime / 1000);
            particle.lifetime -= deltaTime;

            if (particle.lifetime <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    // Отрисовать эффекты
    render(ctx) {
        this.renderBloodEffects(ctx);
        this.renderParticles(ctx);
    }

    // Отрисовать эффекты крови
    renderBloodEffects(ctx) {
        this.bloodEffects.forEach(effect => {
            const alpha = Math.min(1, effect.lifetime / 500);
            ctx.save();
            ctx.fillStyle = `rgba(139, 0, 0, ${alpha})`;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
            ctx.fill();

            // Небольшие брызги вокруг
            for (let i = 0; i < 3; i++) {
                const angle = Math.random() * Math.PI * 2;
                const distance = effect.radius * 0.5 + Math.random() * effect.radius * 0.5;
                const splashX = effect.x + Math.cos(angle) * distance;
                const splashY = effect.y + Math.sin(angle) * distance;
                const splashSize = effect.radius * 0.3;

                ctx.beginPath();
                ctx.arc(splashX, splashY, splashSize, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        });
    }

    // Отрисовать частицы
    renderParticles(ctx) {
        this.particles.forEach(particle => {
            const alpha = Math.min(1, particle.lifetime / 1000);
            ctx.save();
            ctx.fillStyle = `rgba(139, 0, 0, ${alpha})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    // Очистить все эффекты
    clear() {
        this.bloodEffects = [];
        this.particles = [];
    }

    // Добавить особый эффект
    addCriticalBloodEffect(x, y) {
        // Основное пятно крови больше
        this.bloodEffects.push({
            x: x,
            y: y,
            radius: 30,
            lifetime: 1500,
            intensity: 2
        });

        // Больше частиц
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            const life = 800 + Math.random() * 1200;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 3,
                size: 3 + Math.random() * 6,
                lifetime: life,
                intensity: 2
            });
        }

        // Эффект разбрызгивания в разные стороны
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const distance = 40;
            const splashX = x + Math.cos(angle) * distance;
            const splashY = y + Math.sin(angle) * distance;

            this.bloodEffects.push({
                x: splashX,
                y: splashY,
                radius: 8 + Math.random() * 8,
                lifetime: 800 + Math.random() * 400,
                intensity: 1
            });
        }

        console.log('Критический эффект крови!');
    }

    // Добавить эффект от удара о землю
    addGroundImpactEffect(x, y) {
        // Пятно крови расплывающееся
        for (let i = 0; i < 5; i++) {
            const offsetX = (Math.random() - 0.5) * 30;
            const offsetY = (Math.random() - 0.5) * 15;

            this.bloodEffects.push({
                x: x + offsetX,
                y: y + offsetY,
                radius: 15 + Math.random() * 10,
                lifetime: 1200 + Math.random() * 600,
                intensity: 0.7
            });
        }

        // Частицы разлетаются в стороны
        for (let i = 0; i < 20; i++) {
            const angle = (Math.random() - 0.5) * Math.PI;
            const speed = 1 + Math.random() * 3;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1,
                size: 2 + Math.random() * 4,
                lifetime: 600 + Math.random() * 900,
                intensity: 0.8
            });
        }

        console.log('Эффект удара о землю');
    }
}