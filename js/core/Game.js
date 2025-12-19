class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.state = GAME_STATES.MENU;
        this.score = 0;
        this.level = 1;

        this.player = null;
        this.currentLevel = null;

        // Эффекты крови через отдельную систему
        this.bloodSystem = new BloodSystem();

        // Пользовательский интерфейс
        this.ui = new GameUI(this);

        // Инициализация систем
        this.inputHandler = new InputHandler(this);
        this.physicsEngine = new PhysicsEngine(); // Содержит LandingEffects
        this.collisionSystem = new CollisionSystem();
        this.miceAi = new MiceAi();

        this.lastTime = 0;
        this.deltaTime = 0;

        // Обработчики для перезапуска
        this.restartHandler = null;
        this.nextLevelHandler = null;

        console.log('Game создан с системой эффектов приземления');
    }

    init() {
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;

        // Создаем игрока
        this.player = new Player(this);

        // Загружаем уровень
        this.loadLevel(1);

        console.log('Игра инициализирована с системой эффектов!');
    }

    loadLevel(levelNumber) {
        this.level = levelNumber;

        switch(levelNumber) {
            case 1:
                this.currentLevel = new Level1(this);
                break;
            default:
                this.currentLevel = new Level1(this);
        }

        console.log(`Загружен уровень ${levelNumber}`);
    }

    start() {
        this.state = GAME_STATES.PLAYING;
        this.score = 0;
        this.bloodSystem.clear();
        // Эффекты приземления очищаются в PhysicsEngine

        // Сбрасываем позицию игрока
        if (this.player) {
            this.player.x = PHYSICS.PLAYER_FIXED_X;
            this.player.y = PLAYER.START_Y;
            this.player.velocityY = PLAYER.START_VELOCITY_Y;
            this.player.isOnGround = false;
            this.player.isGliding = true;
            this.player.isWalking = false;
        }

        console.log('Игра началась!');
    }

    update(deltaTime) {
        if (this.state !== GAME_STATES.PLAYING) return;

        this.deltaTime = deltaTime;

        // Обрабатываем ввод
        this.inputHandler.processInput();

        // Обновление игрока
        if (this.player) {
            this.player.update(deltaTime);
        }

        // Обновление уровня
        if (this.currentLevel) {
            this.currentLevel.update(deltaTime);

            // Проверка столкновений
            if (this.player) {
                this.currentLevel.checkCollisions(this.player);
            }
        }

        // Обновление эффектов
        this.bloodSystem.update(deltaTime);
        this.physicsEngine.updateEffects(deltaTime); // Обновляем эффекты приземления

        // Проверка условий победы/поражения
        this.checkGameConditions();
    }

    checkGameConditions() {
        // Проверка поражения (падение за экран)
        if (this.player && this.player.y > CANVAS_HEIGHT + 100) {
            this.gameOver();
            return;
        }

        // Проверка победы (долететь до конца уровня)
        if (this.score >= LEVELS.LEVEL_1.TARGET_SCORE) {
            this.win();
            return;
        }
    }

    render() {
        // Очищаем канвас
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Рендерим уровень
        if (this.currentLevel) {
            this.currentLevel.render(this.ctx);
        }

        // Рендерим эффекты приземления (под уровнем)
        this.physicsEngine.renderEffects(this.ctx);

        // Рендерим эффекты крови
        this.bloodSystem.render(this.ctx);

        // Рендерим игрока
        if (this.player) {
            this.player.render(this.ctx);
        }

        // Рендерим UI поверх всего
        this.ui.render();
    }

    addBloodEffect(x, y) {
        this.bloodSystem.addBloodEffect(x, y, 1);
    }

    addCriticalBloodEffect(x, y) {
        this.bloodSystem.addCriticalBloodEffect(x, y);
    }

    gameOver() {
        this.state = GAME_STATES.GAME_OVER;
        console.log('Игра окончена! Счет:', this.score);

        // Удаляем старый обработчик если он есть
        if (this.restartHandler) {
            document.removeEventListener('keydown', this.restartHandler);
        }

        // Добавляем обработчик для рестарта по R
        this.restartHandler = (e) => {
            if (e.code === 'KeyR') {
                this.restart();
                document.removeEventListener('keydown', this.restartHandler);
                this.restartHandler = null;
            }
        };
        document.addEventListener('keydown', this.restartHandler);
    }

    win() {
        this.state = GAME_STATES.WIN;
        console.log('Победа! Счет:', this.score);

        // Удаляем старый обработчик если он есть
        if (this.nextLevelHandler) {
            document.removeEventListener('keydown', this.nextLevelHandler);
        }

        // Добавляем обработчик для перехода на следующий уровень по R
        this.nextLevelHandler = (e) => {
            if (e.code === 'KeyR') {
                this.nextLevel();
                document.removeEventListener('keydown', this.nextLevelHandler);
                this.nextLevelHandler = null;
            }
        };
        document.addEventListener('keydown', this.nextLevelHandler);
    }

    restart() {
        this.state = GAME_STATES.PLAYING;
        this.score = 0;
        this.bloodSystem.clear();
        // Эффекты приземления очищаются в PhysicsEngine

        // Пересоздаем игрока
        this.player = new Player(this);

        // Перезагружаем уровень
        this.loadLevel(this.level);

        console.log('Игра перезапущена');
    }

    nextLevel() {
        this.level++;
        this.score = 0;
        this.bloodSystem.clear();

        // Пересоздаем игрока
        this.player = new Player(this);

        // Загружаем следующий уровень
        this.loadLevel(this.level);

        console.log(`Переход на уровень ${this.level}`);
    }

    cleanup() {
        // Удаляем обработчики событий
        if (this.restartHandler) {
            document.removeEventListener('keydown', this.restartHandler);
            this.restartHandler = null;
        }

        if (this.nextLevelHandler) {
            document.removeEventListener('keydown', this.nextLevelHandler);
            this.nextLevelHandler = null;
        }

        if (this.inputHandler) {
            this.inputHandler.destroy();
        }

        // Очищаем эффекты
        this.bloodSystem.clear();
    }
}