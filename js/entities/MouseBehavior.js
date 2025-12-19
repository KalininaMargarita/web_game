class MouseBehavior {
    constructor(mouse) {
        this.mouse = mouse;
    }

    // Мышь поймана
    catch() {
        if (!this.mouse.isAlive) return false;

        // Если мышь спрятана - она неуязвима!
        if (this.mouse.isHiding) {
            console.log('Мышь спрятана - неуязвима!');
            return false;
        }

        // Если мышь готовится спрятаться - у нее есть шанс увернуться
        if (this.mouse.wantsToHide) {
            const dodgeChance = this.mouse.hideDelayTimer / this.mouse.hideDelay;
            if (Math.random() < dodgeChance * 0.8) {
                console.log('Мышь увернулась в последний момент! Шанс:', (dodgeChance * 0.8).toFixed(2));
                return false;
            }
        }

        this.mouse.isAlive = false;
        return true;
    }

    // Испугать мышь
    scare() {
        this.mouse.isScared = true;
        this.mouse.isRunning = true;
        this.mouse.scareTimer = 0;
        this.mouse.currentSpeed = this.mouse.runSpeed;
        this.mouse.wantsToHide = false;
        this.mouse.hideDelayTimer = 0;

        if (this.mouse.isOnGround) {
            this.mouse.velocityY = this.mouse.jumpForce;
            this.mouse.isOnGround = false;
            this.mouse.lastJumpTime = Date.now();
        }
    }
}