class InputHandler {
    constructor(game) {
        this.game = game;
        this.keys = {};
        this.prevKeys = {};
        this.mouse = { x: 0, y: 0, pressed: false };

        this.setupEventListeners();
        console.log('InputHandler создан');
    }

    setupEventListeners() {
        // Клавиатура
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Мышь
        document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));

        // Сенсорный ввод
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e));

        // Предотвращаем контекстное меню на правый клик
        document.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    handleKeyDown(e) {
        console.log('KeyDown:', e.code, 'isWalking:', this.game.player?.isWalking);
        this.keys[e.code] = true;
        this.processInput();
    }

    handleKeyUp(e) {
        console.log('KeyUp:', e.code);
        this.keys[e.code] = false;
        this.processInput();
    }

    handleMouseDown(e) {
        console.log('MouseDown, isWalking:', this.game.player?.isWalking);
        this.mouse.pressed = true;
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        this.processInput();
    }

    handleMouseUp(e) {
        console.log('MouseUp');
        this.mouse.pressed = false;
        this.processInput();
    }

    handleMouseMove(e) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
    }

    handleTouchStart(e) {
        e.preventDefault();
        this.mouse.pressed = true;
        const touch = e.touches[0];
        this.mouse.x = touch.clientX;
        this.mouse.y = touch.clientY;
        this.processInput();
    }

    handleTouchEnd(e) {
        e.preventDefault();
        this.mouse.pressed = false;
        this.processInput();
    }

    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.mouse.x = touch.clientX;
        this.mouse.y = touch.clientY;
    }

    processInput() {
        if (!this.game.player || this.game.state !== GAME_STATES.PLAYING) {
            return;
        }

        const player = this.game.player;

        // Клавиши для взмаха
        const flapKeys = [KEYS.W, KEYS.SPACE, KEYS.ARROW_UP];

        // Проверяем, была ли нажата клавиша взмаха в этом кадре
        let flapTriggered = false;
        for (const key of flapKeys) {
            if (this.keys[key] && !this.prevKeys[key]) {
                flapTriggered = true;
                break;
            }
        }

        // Обновляем предыдущее состояние
        for (const key in this.keys) {
            this.prevKeys[key] = this.keys[key];
        }

        // ПИКИРОВАНИЕ (S, E, ArrowDown, клик мыши) - УДЕРЖИВАНИЕ
        const diveKeys = [KEYS.S, KEYS.E, KEYS.ARROW_DOWN];
        const isDivePressed = diveKeys.some(key => this.keys[key]) || this.mouse.pressed;

        // Обработка взмаха (однократное действие)
        if (flapTriggered) {
            console.log('flapTriggered! Вызываем player.flap()');
            player.flap();
        }

        // Обработка пикирования (удержание)
        if (isDivePressed && !player.isDiving) {
            player.dive();
        } else if (!isDivePressed && player.isDiving) {
            player.stopDive();
        }
    }

    isKeyPressed(keyCode) {
        return this.keys[keyCode] || false;
    }

    isMousePressed() {
        return this.mouse.pressed;
    }

    getMousePosition(canvas) {
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        return {
            x: this.mouse.x - rect.left,
            y: this.mouse.y - rect.top,
            inCanvas: this.mouse.x >= rect.left &&
                     this.mouse.x <= rect.right &&
                     this.mouse.y >= rect.top &&
                     this.mouse.y <= rect.bottom
        };
    }

    clear() {
        this.keys = {};
        this.prevKeys = {};
        this.mouse.pressed = false;
    }

    destroy() {
        // Удаляем все обработчики событий
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        document.removeEventListener('mousedown', this.handleMouseDown);
        document.removeEventListener('mouseup', this.handleMouseUp);
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('touchstart', this.handleTouchStart);
        document.removeEventListener('touchend', this.handleTouchEnd);
        document.removeEventListener('touchmove', this.handleTouchMove);
    }
}