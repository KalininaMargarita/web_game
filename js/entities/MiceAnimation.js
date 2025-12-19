class MiceAnimation {
    constructor() {
        // Состояния анимации
        this.walkFrame = 0;
        this.walkTimer = 0;
        this.tailCurve = 0;
        this.tailWiggle = 0;
        this.whiskerPhase = 0;
        this.hideFrame = 0;
        this.hideTimer = 0;
        this.hidePreparationFrame = 0;
        this.hidePreparationTimer = 0;

        // Константы анимации
        this.ANIMATION = {
            WALK_FRAME_DURATION: 150,
            TAIL_WIGGLE_SPEED: 0.02, // Увеличено для более быстрой реакции
            WHISKER_SPEED: 0.03, // Увеличено
            RUN_FRAME_DURATION: 100,
            HIDE_FRAME_DURATION: 250, // Уменьшено с 300
            HIDE_BLINK_DURATION: 400, // Уменьшено с 500
            HIDE_PREPARATION_DURATION: 150 // Уменьшено с 200
        };

        // Цикл ходьбы
        this.walkCycle = [0, 1, 2, 1];
        // Цикл подготовки к прятанию (настороженная поза)
        this.hidePreparationCycle = [0, 1, 0, 2];
    }

    // Обновление анимации ходьбы
    updateWalkAnimation(deltaTime, isRunning) {
        const frameDuration = isRunning ?
            this.ANIMATION.RUN_FRAME_DURATION :
            this.ANIMATION.WALK_FRAME_DURATION;

        this.walkTimer += deltaTime;
        if (this.walkTimer >= frameDuration) {
            this.walkTimer = 0;
            this.walkFrame = (this.walkFrame + 1) % this.walkCycle.length;
        }

        // Обновление хвоста
        this.tailWiggle += this.ANIMATION.TAIL_WIGGLE_SPEED * deltaTime;
        this.tailCurve = Math.sin(Date.now() * 0.003) * 0.5; // Увеличена частота

        // Обновление усов
        this.whiskerPhase += this.ANIMATION.WHISKER_SPEED * deltaTime;

        return {
            walkOffset: this.walkCycle[this.walkFrame] * 2,
            tailCurve: this.tailCurve,
            tailWiggle: this.tailWiggle,
            whiskerPhase: this.whiskerPhase,
            isRunning: isRunning
        };
    }

    // Обновление анимации испуга
    updateScaredAnimation(deltaTime) {
        this.tailWiggle += this.ANIMATION.TAIL_WIGGLE_SPEED * 3 * deltaTime;
        this.whiskerPhase += this.ANIMATION.WHISKER_SPEED * 4 * deltaTime;

        return {
            tailWiggle: this.tailWiggle,
            whiskerPhase: this.whiskerPhase,
            scaredIntensity: Math.sin(Date.now() * 0.015) * 0.5 + 0.5 // Увеличена частота
        };
    }

    // Обновление анимации подготовки к прятанию
    updateHidePreparationAnimation(deltaTime) {
        this.hidePreparationTimer += deltaTime;

        // Более быстрое переминание с ноги на ногу
        if (this.hidePreparationTimer >= this.ANIMATION.HIDE_PREPARATION_DURATION) {
            this.hidePreparationTimer = 0;
            this.hidePreparationFrame = (this.hidePreparationFrame + 1) % this.hidePreparationCycle.length;
        }

        // Более быстрое подергивание хвоста
        this.tailWiggle += this.ANIMATION.TAIL_WIGGLE_SPEED * 2 * deltaTime;
        this.tailCurve = Math.sin(Date.now() * 0.005) * 0.7; // Увеличена частота

        // Более быстрое движение усов
        this.whiskerPhase += this.ANIMATION.WHISKER_SPEED * 3 * deltaTime;

        return {
            walkOffset: this.hidePreparationCycle[this.hidePreparationFrame] * 1.5,
            tailCurve: this.tailCurve,
            tailWiggle: this.tailWiggle,
            whiskerPhase: this.whiskerPhase,
            isPreparingToHide: true
        };
    }

    // Обновление анимации прятания
    updateHideAnimation(deltaTime) {
        this.hideTimer += deltaTime;

        // Более быстрое мерцание при прятании
        if (this.hideTimer >= this.ANIMATION.HIDE_BLINK_DURATION) {
            this.hideTimer = 0;
            this.hideFrame = (this.hideFrame + 1) % 2;
        }

        // Медленное покачивание хвоста при прятании
        this.tailWiggle += this.ANIMATION.TAIL_WIGGLE_SPEED * 0.4 * deltaTime; // Увеличено с 0.3
        this.tailCurve = Math.sin(Date.now() * 0.002) * 0.3; // Увеличена частота

        // Усы почти не двигаются при прятании
        this.whiskerPhase += this.ANIMATION.WHISKER_SPEED * 0.2 * deltaTime; // Увеличено с 0.1

        return {
            hideFrame: this.hideFrame,
            hideAlpha: 0.5 + Math.sin(Date.now() * 0.008) * 0.3, // Увеличена частота
            tailCurve: this.tailCurve,
            tailWiggle: this.tailWiggle,
            whiskerPhase: this.whiskerPhase,
            isHiding: true
        };
    }

    // Сброс анимации
    reset() {
        this.walkFrame = 0;
        this.walkTimer = 0;
        this.tailCurve = 0;
        this.tailWiggle = 0;
        this.whiskerPhase = 0;
        this.hideFrame = 0;
        this.hideTimer = 0;
        this.hidePreparationFrame = 0;
        this.hidePreparationTimer = 0;
    }
}