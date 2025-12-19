class Level {
    constructor(game) {
        this.game = game;
        this.backgroundLayers = [];
        this.platforms = [];
        this.enemies = [];
        this.collectibles = [];

        // Фон уровня
        this.background = null;

        this.init();
    }

    init() {
        // Будет переопределяться в дочерних классах
    }

    // НОВЫЙ метод для установки фона
    setBackground(background) {
        this.background = background;
    }

    update(deltaTime) {
        // Обновляем фон если он есть
        if (this.background) {
            this.background.update(deltaTime);
        }

        this.updateBackground(deltaTime);
        this.enemies.forEach(enemy => enemy.update(deltaTime));
        this.collectibles.forEach(item => item.update(deltaTime));
    }

    updateBackground(deltaTime) {
        // Старая логика для обратной совместимости
        // Облака
        this.backgroundLayers[1]?.elements?.forEach(cloud => {
            cloud.x -= cloud.speed;
            if (cloud.x < -cloud.width) {
                cloud.x = this.game.canvas.width + Math.random() * 100;
                cloud.y = Math.random() * this.game.canvas.height * 0.3;
            }
        });

        // Деревья
        this.backgroundLayers[2]?.elements?.forEach(tree => {
            tree.x -= 1.5;
            if (tree.x < -tree.width) {
                tree.x = this.game.canvas.width + Math.random() * 200;
                tree.y = GROUND.Y - 150 - Math.random() * 100;
            }
        });
    }

    renderBackground(ctx) {
        // Если есть специальный фон - используем его
        if (this.background) {
            this.background.render(ctx);
            return;
        }

        // Иначе используем старый фон
        const gradient = ctx.createLinearGradient(0, 0, 0, this.game.canvas.height);
        gradient.addColorStop(0, '#1a2980');
        gradient.addColorStop(0.5, '#26d0ce');
        gradient.addColorStop(1, '#87CEEB');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);

        // Облака
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.backgroundLayers[1]?.elements?.forEach(cloud => {
            ctx.beginPath();
            ctx.arc(cloud.x, cloud.y, cloud.width/3, 0, Math.PI * 2);
            ctx.arc(cloud.x + cloud.width/3, cloud.y - 10, cloud.width/4, 0, Math.PI * 2);
            ctx.arc(cloud.x + cloud.width/2, cloud.y, cloud.width/3, 0, Math.PI * 2);
            ctx.arc(cloud.x - cloud.width/4, cloud.y + 5, cloud.width/4, 0, Math.PI * 2);
            ctx.fill();
        });

        // Деревья
        this.backgroundLayers[2]?.elements?.forEach(tree => {
            ctx.fillStyle = '#654321';
            ctx.fillRect(tree.x, tree.y, tree.width * 0.3, tree.height);

            ctx.fillStyle = tree.color;
            ctx.beginPath();
            ctx.arc(tree.x + tree.width * 0.15, tree.y, tree.width * 0.8, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    renderPlatforms(ctx) {
        this.platforms.forEach(platform => {
            ctx.fillStyle = COLORS.GROUND;
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

            ctx.fillStyle = '#3a7d34';
            ctx.fillRect(platform.x, platform.y, platform.width, 10);
        });
    }

    render(ctx) {
        this.renderBackground(ctx);
        this.renderPlatforms(ctx);
        this.enemies.forEach(enemy => enemy.render(ctx));
        this.collectibles.forEach(item => item.render(ctx));
    }

    checkCollisions(player) {
        this.enemies.forEach(enemy => {
            if (this.isColliding(player, enemy)) {
                this.onEnemyCollision(player, enemy);
            }
        });

        this.collectibles.forEach((item, index) => {
            if (this.isColliding(player, item)) {
                this.onCollectibleCollision(player, item, index);
            }
        });
    }

    isColliding(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }

    onEnemyCollision(player, enemy) {
        console.log('Столкновение с врагом!');
    }

    onCollectibleCollision(player, item, index) {
        console.log('Предмет собран !');
    }
}