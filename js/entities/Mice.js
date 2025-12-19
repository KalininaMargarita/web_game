class Mouse {
    constructor(game, x, y) {
        this.game = game;

        // Инициализация компонентов
        this.sprite = new MiceSprite();
        this.animation = new MiceAnimation();
        this.physics = new MousePhysics(this);
        this.renderer = new MouseRenderer(this);
        this.behavior = new MouseBehavior(this);

        // Размеры из спрайта
        this.width = this.sprite.dimensions.bodyWidth;
        this.height = this.sprite.dimensions.bodyHeight + 5;

        // Позиция
        this.screenX = x;
        this.y = y;

        // Физические параметры
        this.baseSpeed = 6;
        this.currentSpeed = this.baseSpeed;
        this.velocityY = 0;

        // Состояния мыши
        this.isAlive = true;
        this.isScared = false;
        this.isRunning = false;
        this.isOnGround = false;
        this.isHiding = false;
        this.wantsToHide = false;
        this.hideAlpha = 1.0;

        // Таймеры
        this.scareTimer = 0;
        this.hideTimer = 0;
        this.hideDelayTimer = 0;
        this.hideCooldownTimer = 0;

        // Параметры поведения
        this.runSpeed = 9;
        this.scareDistance = 120;
        this.jumpForce = -15;
        this.jumpCooldown = 1500;
        this.lastJumpTime = 0;
        this.hideCheckCooldown = 200;
        this.lastHideCheck = 0;
        this.hideDelay = 400 + Math.random() * 600;
        this.hideCooldown = 500 + Math.random() * 500;

        // УНИФИЦИРОВАННАЯ ЗЕМЛЯ
        this.groundY = GROUND.Y - 10;

        // Бонусные очки
        this.value = PREY.MOUSE.VALUE;

        // Защита при прятании
        this.hideProtection = true;
    }

    update(deltaTime) {
        if (!this.isAlive) return;

        // Используем систему ИИ
        if (this.game.miceAi && this.game.player) {
            this.game.miceAi.updateMouseAi(this, deltaTime, this.game.player);
        }

        // Обновляем физику
        this.physics.update(deltaTime);
    }

    render(ctx) {
        this.renderer.render(ctx);
    }

    catch() {
        return this.behavior.catch();
    }

    respawn() {
        this.physics.respawn();
    }
}