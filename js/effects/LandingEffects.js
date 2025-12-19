// Система эффектов приземления
class LandingEffects {
    constructor() {
        this.dustParticles = [];
        this.leafParticles = [];
        this.impactCircles = [];

        console.log('LandingEffects система создана');
    }

    // Добавить эффект приземления
    addLandingEffect(x, y, intensity = 1) {
        // Параметры в зависимости от интенсивности
        const dustCount = 15 + Math.floor(15 * intensity);
        const leafCount = 5 + Math.floor(10 * intensity);

        // 1. Круги удара (расходящиеся волны)
        for (let i = 0; i < 2 + Math.floor(2 * intensity); i++) {
            const delay = i * 100;
            setTimeout(() => {
                this.impactCircles.push({
                    x: x,
                    y: y,
                    radius: 10,
                    maxRadius: 30 + i * 20,
                    thickness: 2,
                    life: 400,
                    maxLife: 400,
                    color: 'rgba(40, 40, 40, 0.5)'
                });
            }, delay);
        }

        // 2. Частицы пыли
        for (let i = 0; i < dustCount; i++) {
            const angle = (Math.random() - 0.5) * Math.PI; // В основном вверх
            const speed = 1 + Math.random() * 3 * intensity;
            const size = 1 + Math.random() * 3;
            const life = 300 + Math.random() * 400;

            this.dustParticles.push({
                x: x + (Math.random() - 0.5) * 20,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: size,
                startSize: size,
                life: life,
                maxLife: life,
                color: this.getDustColor(),
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.1,
                gravity: 0.2,
                wind: (Math.random() - 0.5) * 0.1
            });
        }

        // 3. Частицы листьев (летят назад - влево)
        for (let i = 0; i < leafCount; i++) {
            const speed = 1 + Math.random() * 2 * intensity;
            const size = 3 + Math.random() * 6;
            const life = 500 + Math.random() * 500;
            const type = Math.random() > 0.5 ? 'round' : 'pointed';

            this.leafParticles.push({
                x: x + (Math.random() - 0.5) * 10,
                y: y,
                vx: -speed * (0.8 + Math.random() * 0.4), // Всегда влево
                vy: -Math.random() * speed * 0.5, // Немного вверх
                size: size,
                life: life,
                maxLife: life,
                type: type,
                color: this.getLeafColor(),
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.05,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.05 + Math.random() * 0.05,
                gravity: 0.1
            });
        }

        console.log(`Эффект приземления: пыль=${dustCount}, листья=${leafCount}`);
    }

    // Получить цвет пыли
    getDustColor() {
        const colors = [
            'rgba(30, 30, 30, 0.8)',  // Темно-серая
            'rgba(40, 40, 40, 0.7)',  // Серая
            'rgba(50, 50, 50, 0.6)',  // Светло-серая
            'rgba(60, 60, 60, 0.5)'   // Очень светлая
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Получить цвет листа
    getLeafColor() {
        const colors = [
            'rgba(139, 69, 19, 0.9)',    // Коричневый (осенний)
            'rgba(107, 142, 35, 0.9)',   // Оливковый
            'rgba(85, 107, 47, 0.9)',    // Темно-оливковый
            'rgba(154, 205, 50, 0.9)',   // Желто-зеленый
            'rgba(160, 82, 45, 0.9)',    // Сиена
            'rgba(210, 105, 30, 0.9)'    // Шоколадный
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Обновить эффекты
    update(deltaTime) {
        const dt = deltaTime / 1000;

        // Обновление кругов удара
        for (let i = this.impactCircles.length - 1; i >= 0; i--) {
            const circle = this.impactCircles[i];
            circle.life -= deltaTime;
            circle.radius += (circle.maxRadius - circle.radius) * 0.05;

            if (circle.life <= 0) {
                this.impactCircles.splice(i, 1);
            }
        }

        // Обновление частиц пыли
        for (let i = this.dustParticles.length - 1; i >= 0; i--) {
            const particle = this.dustParticles[i];

            // Физика
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += particle.gravity;
            particle.vx += particle.wind;

            // Замедление
            particle.vx *= 0.98;
            particle.vy *= 0.98;

            // Вращение
            particle.rotation += particle.rotationSpeed;

            // Уменьшение размера
            particle.size = particle.startSize * (particle.life / particle.maxLife);

            // Уменьшение жизни
            particle.life -= deltaTime;

            if (particle.life <= 0) {
                this.dustParticles.splice(i, 1);
            }
        }

        // Обновление частиц листьев
        for (let i = this.leafParticles.length - 1; i >= 0; i--) {
            const leaf = this.leafParticles[i];

            // Физика
            leaf.x += leaf.vx;
            leaf.y += leaf.vy;
            leaf.vy += leaf.gravity;

            // Покачивание (leaf wobble)
            leaf.wobble += leaf.wobbleSpeed;
            leaf.vx += Math.sin(leaf.wobble) * 0.05;

            // Вращение
            leaf.rotation += leaf.rotationSpeed;

            // Замедление
            leaf.vx *= 0.99;
            leaf.vy *= 0.99;

            // Уменьшение жизни
            leaf.life -= deltaTime;

            // Медленное падение
            if (leaf.y > CANVAS_HEIGHT - GROUND.HEIGHT) {
                leaf.vy = -Math.abs(leaf.vy) * 0.3;
                leaf.vx *= 0.5;
            }

            if (leaf.life <= 0) {
                this.leafParticles.splice(i, 1);
            }
        }
    }

    // Отрисовка эффектов
    render(ctx) {
        this.renderImpactCircles(ctx);
        this.renderDustParticles(ctx);
        this.renderLeafParticles(ctx);
    }

    // Отрисовка кругов удара
    renderImpactCircles(ctx) {
        this.impactCircles.forEach(circle => {
            const alpha = (circle.life / circle.maxLife) * 0.5;

            ctx.save();
            ctx.strokeStyle = circle.color.replace('0.5', alpha.toFixed(2));
            ctx.lineWidth = circle.thickness;
            ctx.globalAlpha = alpha;

            ctx.beginPath();
            ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
            ctx.stroke();

            // Внутренний круг
            if (circle.life > circle.maxLife * 0.5) {
                ctx.strokeStyle = circle.color.replace('0.5', (alpha * 0.7).toFixed(2));
                ctx.beginPath();
                ctx.arc(circle.x, circle.y, circle.radius * 0.6, 0, Math.PI * 2);
                ctx.stroke();
            }

            ctx.restore();
        });
    }

    // Отрисовка частиц пыли
    renderDustParticles(ctx) {
        this.dustParticles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = particle.color;
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.rotation);

            // Рисуем частицу пыли (неправильная форма)
            ctx.beginPath();
            ctx.ellipse(0, 0, particle.size, particle.size * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();

            // Легкая тень для объема
            ctx.fillStyle = particle.color.replace('0.8', '0.4');
            ctx.beginPath();
            ctx.ellipse(particle.size * 0.2, particle.size * 0.2,
                       particle.size * 0.8, particle.size * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        });
    }

    // Отрисовка частиц листьев
    renderLeafParticles(ctx) {
        this.leafParticles.forEach(leaf => {
            const alpha = leaf.life / leaf.maxLife;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = leaf.color;
            ctx.translate(leaf.x, leaf.y);
            ctx.rotate(leaf.rotation);

            if (leaf.type === 'round') {
                // Круглый лист
                ctx.beginPath();
                ctx.ellipse(0, 0, leaf.size, leaf.size * 0.7, 0, 0, Math.PI * 2);
                ctx.fill();

                // Прожилки
                ctx.strokeStyle = leaf.color.replace('0.9', '0.6');
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(0, -leaf.size * 0.7);
                ctx.lineTo(0, leaf.size * 0.7);
                ctx.stroke();

                // Боковые прожилки
                ctx.beginPath();
                ctx.moveTo(-leaf.size * 0.3, -leaf.size * 0.3);
                ctx.lineTo(-leaf.size * 0.6, 0);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(leaf.size * 0.3, -leaf.size * 0.3);
                ctx.lineTo(leaf.size * 0.6, 0);
                ctx.stroke();
            } else {
                // Заостренный лист
                ctx.beginPath();
                ctx.moveTo(0, -leaf.size);
                ctx.lineTo(leaf.size * 0.8, 0);
                ctx.lineTo(0, leaf.size);
                ctx.lineTo(-leaf.size * 0.8, 0);
                ctx.closePath();
                ctx.fill();

                // Прожилки
                ctx.strokeStyle = leaf.color.replace('0.9', '0.6');
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(0, -leaf.size);
                ctx.lineTo(0, leaf.size);
                ctx.stroke();
            }

            ctx.restore();
        });
    }

    // Очистить все эффекты
    clear() {
        this.dustParticles = [];
        this.leafParticles = [];
        this.impactCircles = [];
    }

    // Добавить эффект мягкого приземления
    addSoftLandingEffect(x, y) {
        this.addLandingEffect(x, y, 0.5);
    }

    // Добавить эффект жесткого приземления
    addHardLandingEffect(x, y) {
        this.addLandingEffect(x, y, 1.5);

        // Дополнительные эффекты для жесткой посадки
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                // Волна удара
                this.impactCircles.push({
                    x: x,
                    y: y,
                    radius: 5,
                    maxRadius: 50 + i * 15,
                    thickness: 3,
                    life: 600,
                    maxLife: 600,
                    color: 'rgba(20, 20, 20, 0.7)'
                });

                // Дополнительные листья
                const leafCount = 3;
                for (let j = 0; j < leafCount; j++) {
                    const speed = 2 + Math.random() * 3;
                    const size = 5 + Math.random() * 8;

                    this.leafParticles.push({
                        x: x + (Math.random() - 0.5) * 30,
                        y: y,
                        vx: -speed * (1 + Math.random() * 0.5),
                        vy: -Math.random() * speed,
                        size: size,
                        life: 800 + Math.random() * 400,
                        maxLife: 800 + Math.random() * 400,
                        type: Math.random() > 0.5 ? 'round' : 'pointed',
                        color: this.getLeafColor(),
                        rotation: Math.random() * Math.PI * 2,
                        rotationSpeed: (Math.random() - 0.5) * 0.08,
                        wobble: Math.random() * Math.PI * 2,
                        wobbleSpeed: 0.08 + Math.random() * 0.08,
                        gravity: 0.08
                    });
                }
            }, i * 100);
        }
    }
}