class Level1 extends Level {
    constructor(game) {
        super(game);
        this.miceSpawnTimer = 0;
        this.miceSpawnInterval = 800;
        this.maxMice = 12;
        this.miceSpeed = 6;
    }

    init() {
        this.initBackground();
        this.initPlatforms();
        this.initEnemies();
        this.initCollectibles();
        this.initMice();
        console.log('Уровень 1 инициализирован с новым фоном');
    }

    initBackground() {
        // Создаем красивый фон с ночным небом
        const background = new LevelBackground(CANVAS_WIDTH, CANVAS_HEIGHT);
        this.setBackground(background); // Устанавливаем фон через метод родителя

        // Удаляем старые фоновые слои
        this.backgroundLayers = [];
    }

    initPlatforms() {
        this.platforms = [{
            x: 0,
            y: GROUND.Y - 10,
            width: CANVAS_WIDTH,
            height: GROUND.HEIGHT,
            isGround: true
        }];
    }

    initEnemies() {
        this.enemies = [];
    }

    initCollectibles() {
        this.collectibles = [];
    }

    initMice() {
        this.mice = [];

        const initialMiceCount = 6;
        for (let i = 0; i < initialMiceCount; i++) {
            this.spawnMouse();
        }

        console.log(`Создано ${initialMiceCount} начальных мышей`);
    }

    spawnMouse() {
        if (this.mice.length >= this.maxMice) {
            return;
        }

        const screenX = CANVAS_WIDTH + 50 + Math.random() * 100;
        const unifiedGroundY = GROUND.Y - 10;
        const y = unifiedGroundY - 15 - Math.random() * 10;

        const mouse = new Mouse(this.game, screenX, y);
        mouse.baseSpeed = this.miceSpeed + Math.random() * 2 - 1;
        mouse.currentSpeed = mouse.baseSpeed;
        mouse.groundY = unifiedGroundY;

        this.mice.push(mouse);
    }

    update(deltaTime) {
        super.update(deltaTime);

        // Ограничиваем deltaTime
        const safeDeltaTime = Math.min(deltaTime, 100);

        // Спавн мышей
        this.miceSpawnTimer += safeDeltaTime;
        if (this.miceSpawnTimer >= this.miceSpawnInterval) {
            this.miceSpawnTimer = 0;
            this.spawnMouse();
        }

        // Обновление мышей
        if (this.mice) {
            for (let i = this.mice.length - 1; i >= 0; i--) {
                const mouse = this.mice[i];

                mouse.update(safeDeltaTime);

                // Удаление пойманных мышей
                if (!mouse.isAlive) {
                    this.mice.splice(i, 1);
                    this.game.score += mouse.value;
                }
            }
        }
    }

    render(ctx) {
        // Рендеринг будет вызван через родительский класс Level
        super.render(ctx);

        // Рисуем мышей
        if (this.mice) {
            this.mice.forEach(mouse => mouse.render(ctx));
        }

        // Отладка - земля (опционально)
        if (false) { // Поставьте true для отладки
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, GROUND.Y - 10);
            ctx.lineTo(CANVAS_WIDTH, GROUND.Y - 10);
            ctx.stroke();
        }
    }

    // УДАЛЯЮ старый метод renderBackground - теперь используется фон из LevelBackground
    // УДАЛЯЮ метод renderPlatforms - используется родительский

    checkCollisions(player) {
        super.checkCollisions(player);

        if (this.mice && player) {
            for (let i = this.mice.length - 1; i >= 0; i--) {
                const mouse = this.mice[i];

                // Если мышь спрятана - пропускаем проверку столкновений
                if (mouse.isHiding) {
                    continue;
                }

                if (this.isCollidingWithMouse(player, mouse) && mouse.isAlive) {
                    const isDivingAttack = player.isDiving || (player.velocityY > 15);
                    const heightDifference = player.y + player.height - mouse.y;
                    const isAboveMouse = heightDifference > 0 && heightDifference < 40;

                    if (isDivingAttack && isAboveMouse) {
                        if (mouse.wantsToHide && Math.random() > 0.7) {
                            console.log('Мышь успела увернуться в последний момент!');
                            mouse.isScared = true;
                            mouse.isRunning = true;
                            mouse.wantsToHide = false;

                            if (mouse.isOnGround) {
                                mouse.velocityY = -15;
                                mouse.isOnGround = false;
                            }
                        } else if (mouse.catch()) {
                            this.mice.splice(i, 1);
                            this.game.score += mouse.value;
                            console.log('Мышь поймана!');

                            if (this.game.bloodSystem) {
                                if (player.isDiving) {
                                    this.game.bloodSystem.addCriticalBloodEffect(mouse.screenX, mouse.y);
                                } else {
                                    this.game.bloodSystem.addBloodEffect(mouse.screenX, mouse.y);
                                }
                            }
                        }
                    } else if (!mouse.isScared) {
                        mouse.isScared = true;
                        mouse.isRunning = true;
                        mouse.scareTimer = 0;
                        mouse.currentSpeed = mouse.runSpeed;
                        mouse.wantsToHide = false;

                        if (mouse.isOnGround) {
                            mouse.velocityY = -15;
                            mouse.isOnGround = false;
                        }
                    }
                }
            }
        }
    }

    isCollidingWithMouse(player, mouse) {
        return player.x < mouse.screenX + mouse.width &&
               player.x + player.width > mouse.screenX &&
               player.y < mouse.y + mouse.height &&
               player.y + player.height > mouse.y;
    }

    onEnemyCollision(player, enemy) {
        this.game.gameOver();
    }

    onCollectibleCollision(player, item, index) {
        this.collectibles.splice(index, 1);
        this.game.score += 100;
    }
}