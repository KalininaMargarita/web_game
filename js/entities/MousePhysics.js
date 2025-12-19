class MousePhysics {
    constructor(mouse) {
        this.mouse = mouse;
    }

    update(deltaTime) {
        // Безопасное значение deltaTime
        const safeDeltaTime = Math.min(deltaTime, 100);

        // Движение
        this.mouse.screenX -= this.mouse.currentSpeed;

        // Вертикальное движение
        if (!this.mouse.isOnGround) {
            this.mouse.velocityY += 0.4 * (safeDeltaTime / 1000) * PHYSICS.PIXELS_PER_METER;
        }

        this.mouse.y += this.mouse.velocityY * (safeDeltaTime / 1000);

        // Проверяем коллизии с землей
        this.checkGroundCollision();

        // Проверка выхода за пределы экрана
        if (this.mouse.screenX < -this.mouse.width * 2 || this.mouse.screenX > CANVAS_WIDTH + this.mouse.width * 2) {
            this.mouse.respawn();
        }

        // Ограничиваем вертикальное движение
        if (this.mouse.y < 50) {
            this.mouse.y = 50;
            this.mouse.velocityY = Math.abs(this.mouse.velocityY) * 0.3;
        }
    }

    checkGroundCollision() {
        this.mouse.isOnGround = false;

        if (this.mouse.y + this.mouse.height >= this.mouse.groundY && this.mouse.velocityY >= 0) {
            this.mouse.y = this.mouse.groundY - this.mouse.height;
            this.mouse.velocityY = 0;
            this.mouse.isOnGround = true;
        }

        if (this.mouse.y + this.mouse.height > GROUND.Y && this.mouse.velocityY >= 0) {
            this.mouse.y = GROUND.Y - this.mouse.height;
            this.mouse.velocityY = 0;
            this.mouse.isOnGround = true;
        }
    }

    respawn() {
        this.mouse.screenX = CANVAS_WIDTH + 50 + Math.random() * 100;
        this.mouse.y = this.mouse.groundY - 15 - Math.random() * 10;
        this.mouse.velocityY = 0;
        this.mouse.isAlive = true;
        this.mouse.isScared = false;
        this.mouse.isRunning = false;
        this.mouse.isOnGround = true;
        this.mouse.isHiding = false;
        this.mouse.wantsToHide = false;
        this.mouse.hideAlpha = 1.0;
        this.mouse.scareTimer = 0;
        this.mouse.hideTimer = 0;
        this.mouse.hideDelayTimer = 0;
        this.mouse.hideCooldownTimer = 0;
        this.mouse.currentSpeed = this.mouse.baseSpeed;
        this.mouse.hideProtection = true;
    }
}