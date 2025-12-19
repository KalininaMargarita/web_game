// Класс для управления фоном уровня
class LevelBackground {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        // Элементы фона
        this.stars = [];
        this.clouds = [];
        this.trees = [];
        this.moon = null;

        // Параметры анимации
        this.time = 0;
        this.moonPhase = 0.8;

        // Инициализация
        this.initStars();
        this.initMoon();
        this.initClouds();
        this.initTrees();

        console.log('Фон создан:', {
            stars: this.stars.length,
            clouds: this.clouds.length,
            trees: this.trees.length,
            moon: this.moon !== null
        });
    }

    // Инициализация звезд
    initStars() {
        // Создаем три слоя звезд
        for (let i = 0; i < 100; i++) {
            const layer = Math.floor(Math.random() * 3);
            const size = layer === 0 ? 1 : layer === 1 ? 2 : 3;

            this.stars.push({
                x: Math.random() * this.canvasWidth,
                y: Math.random() * (this.canvasHeight * 0.7),
                size: size,
                brightness: 0.5 + Math.random() * 0.5,
                layer: layer,
                twinkleOffset: Math.random() * Math.PI * 2
            });
        }
    }

    // Инициализация луны
    initMoon() {
        this.moon = {
            x: this.canvasWidth * 0.8,
            y: this.canvasHeight * 0.15,
            radius: 40,
            phase: 0.8,
            speed: 0.05
        };

        console.log('Луна создана:', this.moon);
    }

    // Инициализация облаков
    initClouds() {
        for (let i = 0; i < 10; i++) {
            const size = 40 + Math.random() * 40;
            const alpha = 0.3 + Math.random() * 0.4;

            this.clouds.push({
                x: Math.random() * this.canvasWidth * 1.5,
                y: 50 + Math.random() * (this.canvasHeight * 0.4),
                size: size,
                speed: 0.2 + Math.random() * 0.8,
                alpha: alpha
            });
        }
    }

    // Инициализация деревьев
    initTrees() {
        const groundY = this.canvasHeight - GROUND.HEIGHT;

        for (let i = 0; i < 20; i++) {
            const type = Math.random() > 0.5 ? 'spruce' : 'deciduous';
            const height = type === 'spruce' ? 100 + Math.random() * 80 : 120 + Math.random() * 100;
            const width = type === 'spruce' ? 40 + Math.random() * 30 : 60 + Math.random() * 40;
            const layer = Math.floor(Math.random() * 3);
            const speed = 0.5 + layer * 0.3;

            this.trees.push({
                x: Math.random() * this.canvasWidth * 2,
                y: groundY - height,
                width: width,
                height: height,
                type: type,
                layer: layer,
                speed: speed
            });
        }

        // Сортируем по слоям
        this.trees.sort((a, b) => a.layer - b.layer);
    }

    // Обновление фона
    update(deltaTime) {
        this.time += deltaTime;

        // Обновление луны
        if (this.moon) {
            this.moon.x -= this.moon.speed;
            if (this.moon.x < -this.moon.radius) {
                this.moon.x = this.canvasWidth + this.moon.radius;
            }
        }

        // Обновление облаков
        this.clouds.forEach(cloud => {
            cloud.x -= cloud.speed;
            if (cloud.x < -cloud.size * 2) {
                cloud.x = this.canvasWidth + cloud.size * 2;
                cloud.y = 50 + Math.random() * (this.canvasHeight * 0.4);
            }
        });

        // Обновление деревьев
        this.trees.forEach(tree => {
            tree.x -= tree.speed;
            if (tree.x < -tree.width * 2) {
                tree.x = this.canvasWidth + tree.width * 2;
            }
        });
    }

    // Отрисовка фона
    render(ctx) {
        // 1. Рисуем небо
        this.renderSky(ctx);

        // 2. Рисуем звезды
        this.renderStars(ctx);

        // 3. Рисуем луну
        this.renderMoon(ctx);

        // 4. Рисуем облака
        this.renderClouds(ctx);

        // 5. Рисуем деревья
        this.renderTrees(ctx);

        // 6. Легкая дымка у горизонта
        this.renderHorizonHaze(ctx);
    }

    // Отрисовка неба
    renderSky(ctx) {
        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
        gradient.addColorStop(0, '#0a0a2a');
        gradient.addColorStop(0.4, '#1a1a3a');
        gradient.addColorStop(0.7, '#2a2a4a');
        gradient.addColorStop(1, '#3a3a5a');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    }

    // Отрисовка звезд
    renderStars(ctx) {
        ctx.save();

        this.stars.forEach(star => {
            const twinkle = 0.7 + Math.sin(this.time * 0.001 + star.twinkleOffset) * 0.3;
            const alpha = star.brightness * twinkle;

            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#ffffff';

            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();

            // Для больших звезд добавляем лучи
            if (star.size > 2) {
                ctx.beginPath();
                for (let i = 0; i < 4; i++) {
                    const angle = (i * Math.PI) / 2;
                    ctx.moveTo(
                        star.x + Math.cos(angle) * star.size,
                        star.y + Math.sin(angle) * star.size
                    );
                    ctx.lineTo(
                        star.x + Math.cos(angle) * star.size * 2,
                        star.y + Math.sin(angle) * star.size * 2
                    );
                }
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        });

        ctx.restore();
    }

    // Отрисовка луны
    renderMoon(ctx) {
        if (!this.moon) return;

        const moon = this.moon;

        // Свечение
        ctx.save();
        const glowGradient = ctx.createRadialGradient(
            moon.x, moon.y, moon.radius,
            moon.x, moon.y, moon.radius * 1.5
        );
        glowGradient.addColorStop(0, 'rgba(255, 255, 200, 0.3)');
        glowGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(moon.x, moon.y, moon.radius * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Луна
        ctx.fillStyle = '#f5f5dc';
        ctx.beginPath();
        ctx.arc(moon.x, moon.y, moon.radius, 0, Math.PI * 2);
        ctx.fill();

        // Фаза луны
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
        ctx.fillStyle = '#d4c9a8';
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const distance = moon.radius * 0.4;
            const size = 2 + Math.random() * 4;

            ctx.beginPath();
            ctx.arc(
                moon.x + Math.cos(angle) * distance,
                moon.y + Math.sin(angle) * distance,
                size,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }

        ctx.restore();
    }

    // Отрисовка облаков
    renderClouds(ctx) {
        ctx.save();

        this.clouds.forEach(cloud => {
            ctx.globalAlpha = cloud.alpha;
            ctx.fillStyle = 'rgba(40, 40, 70, 0.8)';

            // Рисуем облако из нескольких кругов
            ctx.beginPath();
            ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
            ctx.arc(cloud.x + cloud.size * 0.6, cloud.y - cloud.size * 0.3, cloud.size * 0.7, 0, Math.PI * 2);
            ctx.arc(cloud.x + cloud.size * 1.2, cloud.y, cloud.size * 0.8, 0, Math.PI * 2);
            ctx.arc(cloud.x - cloud.size * 0.4, cloud.y + cloud.size * 0.2, cloud.size * 0.6, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }

    // Отрисовка деревьев
    renderTrees(ctx) {
        this.trees.forEach(tree => {
            ctx.save();

            // Прозрачность по слоям
            const alpha = tree.layer === 0 ? 0.6 : tree.layer === 1 ? 0.8 : 1.0;
            ctx.globalAlpha = alpha;

            const treeX = tree.x;
            const treeBottom = this.canvasHeight - GROUND.HEIGHT;
            const treeTop = tree.y;
            const trunkHeight = tree.height * 0.2;

            // Ствол
            ctx.fillStyle = '#2c1810';
            ctx.fillRect(
                treeX - tree.width * 0.07,
                treeBottom - trunkHeight,
                tree.width * 0.14,
                trunkHeight
            );

            if (tree.type === 'spruce') {
                // Ель
                this.renderSpruceTree(ctx, treeX, treeTop, tree.width, tree.height);
            } else {
                // Лиственное дерево
                this.renderDeciduousTree(ctx, treeX, treeTop, tree.width, tree.height);
            }

            ctx.restore();
        });
    }

    // Отрисовка ели
    renderSpruceTree(ctx, x, top, width, height) {
        const layers = 4;
        const layerHeight = height / layers;

        for (let i = 0; i < layers; i++) {
            const layerY = top + i * layerHeight;
            const layerWidth = width * (1 - i * 0.2);
            const layerHeightActual = layerHeight * 0.9;

            // Слой ветвей
            ctx.fillStyle = i % 2 === 0 ? '#1e3d1e' : '#2d5a2d';
            ctx.beginPath();
            ctx.moveTo(x - layerWidth / 2, layerY + layerHeightActual);
            ctx.lineTo(x, layerY);
            ctx.lineTo(x + layerWidth / 2, layerY + layerHeightActual);
            ctx.closePath();
            ctx.fill();

            // Иголки
            ctx.strokeStyle = '#143214';
            ctx.lineWidth = 1;
            for (let j = 0; j < 20; j++) {
                const needleX = x + (Math.random() - 0.5) * layerWidth * 0.8;
                const needleY = layerY + Math.random() * layerHeightActual;
                const angle = (Math.random() - 0.5) * Math.PI / 3;
                const length = 3 + Math.random() * 4;

                ctx.beginPath();
                ctx.moveTo(needleX, needleY);
                ctx.lineTo(
                    needleX + Math.cos(angle) * length,
                    needleY + Math.sin(angle) * length
                );
                ctx.stroke();
            }
        }
    }

    // Отрисовка лиственного дерева
    renderDeciduousTree(ctx, x, top, width, height) {
        // Крона
        ctx.fillStyle = '#2d5a2d';
        ctx.beginPath();
        ctx.ellipse(x, top + height * 0.5, width * 0.5, height * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Листья
        ctx.fillStyle = '#3d6a3d';
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * width * 0.4;
            const leafX = x + Math.cos(angle) * distance;
            const leafY = top + height * 0.5 + Math.sin(angle) * distance * 0.7;
            const size = 2 + Math.random() * 4;
            const rotation = Math.random() * Math.PI * 2;

            ctx.save();
            ctx.translate(leafX, leafY);
            ctx.rotate(rotation);

            if (Math.random() > 0.5) {
                // Круглый лист
                ctx.beginPath();
                ctx.ellipse(0, 0, size, size * 0.8, 0, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Заостренный лист
                ctx.beginPath();
                ctx.moveTo(0, -size);
                ctx.lineTo(size * 0.8, 0);
                ctx.lineTo(0, size);
                ctx.lineTo(-size * 0.8, 0);
                ctx.closePath();
                ctx.fill();
            }

            ctx.restore();
        }
    }

    // Дымка у горизонта
    renderHorizonHaze(ctx) {
        const hazeGradient = ctx.createLinearGradient(
            0, this.canvasHeight * 0.7,
            0, this.canvasHeight
        );
        hazeGradient.addColorStop(0, 'rgba(50, 50, 80, 0.3)');
        hazeGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = hazeGradient;
        ctx.fillRect(0, this.canvasHeight * 0.7, this.canvasWidth, this.canvasHeight * 0.3);
    }

    // Сброс
    reset() {
        this.stars = [];
        this.clouds = [];
        this.trees = [];
        this.time = 0;

        this.initStars();
        this.initMoon();
        this.initClouds();
        this.initTrees();
    }
}