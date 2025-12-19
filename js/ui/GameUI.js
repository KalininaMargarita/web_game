// Класс для управления пользовательским интерфейсом игры
class GameUI {
    constructor(game) {
        this.game = game;
        this.ctx = game.ctx;
        this.canvas = game.canvas;

        // Состояния UI
        this.showDebugInfo = true;
        this.showInstructions = true;

        // Цвета
        this.colors = {
            text: 'white',
            highlight: 'cyan',
            warning: 'orange',
            danger: '#e74c3c',
            success: '#2ecc71',
            info: 'rgba(255, 255, 255, 0.7)'
        };

        // Шрифты
        this.fonts = {
            large: '36px "Press Start 2P"',
            medium: '24px "Press Start 2P"',
            small: '20px "Press Start 2P"',
            xsmall: '14px "Press Start 2P"',
            debug: '12px "Press Start 2P"'
        };
    }

    // Отрисовка всего интерфейса
    render() {
        if (this.game.state === GAME_STATES.PLAYING) {
            this.renderGameUI();
        } else if (this.game.state === GAME_STATES.GAME_OVER) {
            this.renderGameOverScreen();
        } else if (this.game.state === GAME_STATES.WIN) {
            this.renderWinScreen();
        } else if (this.game.state === GAME_STATES.MENU) {
            this.renderMenu();
        }
    }

    // Интерфейс во время игры
    renderGameUI() {
        this.renderScore();
        this.renderLevelInfo();
        this.renderMiceStats();
        this.renderPlayerStats();
        this.renderInstructions();
        this.renderTacticalHints();

        if (this.showDebugInfo) {
            this.renderDebugInfo();
        }
    }

    // Отображение счета
    renderScore() {
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = this.fonts.small;
        this.ctx.fillText(`Очки: ${this.game.score}`, 20, 40);
    }

    // Информация об уровне
    renderLevelInfo() {
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = this.fonts.small;
        this.ctx.fillText(`Уровень: ${this.game.level}`, 20, 70);

        // Прогресс
        const targetScore = LEVELS.LEVEL_1.TARGET_SCORE;
        const progress = Math.min(100, Math.floor((this.game.score / targetScore) * 100));
        this.ctx.fillText(`Цель: ${progress}%`, 20, 100);
    }

    // Статистика по мышам
    renderMiceStats() {
        if (!this.game.currentLevel || !this.game.currentLevel.mice) return;

        const mice = this.game.currentLevel.mice;
        let hidingMice = 0;
        let scaredMice = 0;

        mice.forEach(mouse => {
            if (mouse.isHiding) hidingMice++;
            if (mouse.isScared) scaredMice++;
        });

        // Общее количество мышей
        this.ctx.fillText(`Мышей: ${mice.length}`, 20, 130);

        // Статистика состояний
        this.ctx.font = this.fonts.debug;
        this.ctx.fillStyle = this.colors.highlight;
        this.ctx.fillText(`Спрятано: ${hidingMice}`, 20, 160);
        this.ctx.fillStyle = this.colors.warning;
        this.ctx.fillText(`Испугано: ${scaredMice}`, 20, 180);
    }

    // Статистика игрока
    renderPlayerStats() {
        if (!this.game.player) return;

        const player = this.game.player;
        const airspeed = player.airspeed ? player.airspeed.toFixed(1) : "0.0";
        const height = Math.floor(player.y);

        this.ctx.font = this.fonts.xsmall;
        this.ctx.fillStyle = this.colors.text;
        this.ctx.fillText(`Скорость: ${airspeed} м/с`, this.canvas.width - 250, 40);
        this.ctx.fillText(`Высота: ${height}`, this.canvas.width - 250, 70);

        // Режим полета
        let mode = "";
        if (player.isFlapping) mode = "ВЗМАХ";
        else if (player.isDiving) mode = "ПИКИРОВАНИЕ";
        else if (player.isGliding) mode = "ПЛАНИРОВАНИЕ";
        else if (player.isWalking) mode = "ХОДЬБА";
        else mode = "ПАДЕНИЕ";

        this.ctx.fillText(`Режим: ${mode}`, this.canvas.width - 250, 100);

        // Подсказка о защите мышей
        this.ctx.fillStyle = this.colors.highlight;
        this.ctx.fillText('Спрятавшиеся мыши', this.canvas.width - 250, 140);
        this.ctx.fillText('неуязвимы!', this.canvas.width - 250, 160);

        // Индикатор эффективности атаки
        if (player.isDiving) {
            this.ctx.fillStyle = 'rgba(255, 50, 50, 0.8)';
            this.ctx.fillText('АКТИВНАЯ АТАКА', this.canvas.width - 250, 190);
        } else if (player.velocityY > 10) {
            this.ctx.fillStyle = 'rgba(255, 150, 50, 0.8)';
            this.ctx.fillText('ПАССИВНАЯ АТАКА', this.canvas.width - 250, 190);
        }
    }

    // Инструкции управления
    renderInstructions() {
        if (!this.showInstructions) return;

        this.ctx.font = this.fonts.debug;
        this.ctx.fillStyle = this.colors.info;

        const instructions = [
            'W/ПРОБЕЛ - взмах',
            'S/E/КЛИК - пикирование',
            'Пикируйте на мышей для поимки!'
        ];

        let yPos = this.canvas.height - 80;
        for (let i = 0; i < instructions.length; i++) {
            this.ctx.fillText(instructions[i], 20, yPos + (i * 25));
        }
    }

    // Тактические подсказки
    renderTacticalHints() {
        this.ctx.font = this.fonts.debug;

        // Подсказка о спрятавшихся мышах
        this.ctx.fillStyle = 'rgba(0, 255, 255, 0.7)';
        this.ctx.fillText('Спрятавшиеся мыши защищены!', 20, this.canvas.height - 140);
        this.ctx.fillText('Ждите, когда выйдут из укрытия', 20, this.canvas.height - 125);

        // Подсказка о тактике
        this.ctx.fillStyle = 'rgba(255, 255, 100, 0.7)';
        this.ctx.fillText('Испугайте мышей чтобы они вышли', 20, this.canvas.height - 170);
        this.ctx.fillText('из укрытия!', 20, this.canvas.height - 155);
    }

    // Отладочная информация
    renderDebugInfo() {
        if (!this.game.player) return;

        const player = this.game.player;
        this.ctx.font = '12px Arial';
        this.ctx.fillStyle = 'white';

        // Отображение состояния игрока
        this.ctx.fillText(`Режим: ${player.isFlapping ? 'ВЗМАХ' : player.isDiving ? 'ПИКИРОВАНИЕ' : player.isGliding ? 'ПЛАНИРОВАНИЕ' : 'ЗЕМЛЯ'}`, player.x + 70, player.y - 60);
        this.ctx.fillText(`Скорость: ${Math.abs(player.velocityY).toFixed(1)}`, player.x + 70, player.y - 45);
        this.ctx.fillText(`Угол: ${(player.pitchAngle * 180 / Math.PI).toFixed(1)}°`, player.x + 70, player.y - 30);

        // Индикатор резкости
        if (player.isFlapping) {
            this.ctx.fillStyle = 'yellow';
            this.ctx.fillText('↑↑↑ РЕЗКИЙ ПОДЪЕМ ↑↑↑', player.x + 70, player.y - 15);
        } else if (player.isDiving) {
            this.ctx.fillStyle = 'red';
            this.ctx.fillText('↓↓↓ РЕЗКОЕ ПИКИРОВАНИЕ ↓↓↓', player.x + 70, player.y - 15);
        }

        // Информация о мышах
        if (this.game.currentLevel && this.game.currentLevel.mice) {
            const mouse = this.game.currentLevel.mice[0];
            if (mouse) {
                this.ctx.fillText(`Мышь: ${mouse.isHiding ? 'спрятана' : mouse.isScared ? 'испугана' : 'норм'}`, 300, 40);
            }
        }
    }

    // Экран окончания игры
    renderGameOverScreen() {
        // Затемнение фона
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Заголовок
        this.ctx.fillStyle = this.colors.danger;
        this.ctx.font = this.fonts.large;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('ИГРА ОКОНЧЕНА', this.canvas.width / 2, this.canvas.height / 2 - 50);

        // Счет
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = this.fonts.medium;
        this.ctx.fillText(`Счет: ${this.game.score}`, this.canvas.width / 2, this.canvas.height / 2);

        // Статистика игры
        this.ctx.font = this.fonts.xsmall;
        this.ctx.fillText(`Уровень: ${this.game.level}`, this.canvas.width / 2, this.canvas.height / 2 + 30);

        // Инструкция
        this.ctx.font = this.fonts.medium;
        this.ctx.fillText('Нажмите R для рестарта', this.canvas.width / 2, this.canvas.height / 2 + 80);

        // Подсказки для улучшения игры
        this.ctx.font = this.fonts.debug;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.fillText('Совет: Атакуйте мышей, когда они не спрятаны', this.canvas.width / 2, this.canvas.height / 2 + 120);
        this.ctx.fillText('Используйте пикирование для максимального урона', this.canvas.width / 2, this.canvas.height / 2 + 145);

        this.ctx.textAlign = 'left';
    }

    // Экран победы
    renderWinScreen() {
        // Затемнение фона
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Заголовок
        this.ctx.fillStyle = this.colors.success;
        this.ctx.font = this.fonts.large;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('ПОБЕДА!', this.canvas.width / 2, this.canvas.height / 2 - 50);

        // Счет
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = this.fonts.medium;
        this.ctx.fillText(`Счет: ${this.game.score}`, this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.fillText(`Уровень пройден: ${this.game.level}`, this.canvas.width / 2, this.canvas.height / 2 + 40);

        // Статистика уровня
        if (this.game.currentLevel && this.game.currentLevel.mice) {
            const totalMice = this.game.currentLevel.mice.length + Math.floor(this.game.score / PREY.MOUSE.VALUE);
            const caughtPercentage = totalMice > 0 ? Math.floor((this.game.score / PREY.MOUSE.VALUE) / totalMice * 100) : 0;
            this.ctx.font = this.fonts.xsmall;
            this.ctx.fillText(`Поймано мышей: ${Math.floor(this.game.score / PREY.MOUSE.VALUE)}`, this.canvas.width / 2, this.canvas.height / 2 + 80);
            this.ctx.fillText(`Эффективность: ${caughtPercentage}%`, this.canvas.width / 2, this.canvas.height / 2 + 110);
        }

        // Инструкция
        this.ctx.font = this.fonts.medium;
        this.ctx.fillText('Нажмите R для следующего уровня', this.canvas.width / 2, this.canvas.height / 2 + 160);

        // Поздравление
        this.ctx.font = this.fonts.debug;
        this.ctx.fillStyle = 'rgba(255, 255, 100, 0.8)';
        this.ctx.fillText('Отличная работа! Вы освоили тактику охоты!', this.canvas.width / 2, this.canvas.height / 2 + 200);

        this.ctx.textAlign = 'left';
    }

    // Главное меню
    renderMenu() {
        // Затемнение фона
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Заголовок
        this.ctx.fillStyle = '#f39c12';
        this.ctx.font = this.fonts.large;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('OWL ADVENTURE', this.canvas.width / 2, this.canvas.height / 2 - 100);

        // Описание
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = this.fonts.medium;
        this.ctx.fillText('Реалистичная физика полета совы', this.canvas.width / 2, this.canvas.height / 2 - 40);

        // Управление
        this.ctx.font = this.fonts.xsmall;
        const controls = [
            'Управление:',
            'W / ПРОБЕЛ - взмах крыльями',
            'S / E / КЛИК - пикирование',
            'Отпусти - планирование'
        ];

        for (let i = 0; i < controls.length; i++) {
            this.ctx.fillText(controls[i], this.canvas.width / 2, this.canvas.height / 2 + (i * 30));
        }

        // Подсказка для начала
        this.ctx.fillStyle = this.colors.highlight;
        this.ctx.font = this.fonts.small;
        this.ctx.fillText('Нажмите ПРОБЕЛ чтобы начать', this.canvas.width / 2, this.canvas.height / 2 + 150);

        this.ctx.textAlign = 'left';
    }

    // Отображение сообщения
    showMessage(text, duration = 2000, color = 'white') {
        this.tempMessage = {
            text: text,
            duration: duration,
            startTime: Date.now(),
            color: color
        };
    }

    // Отображение временного сообщения
    renderTempMessage() {
        if (!this.tempMessage) return;

        const elapsed = Date.now() - this.tempMessage.startTime;
        if (elapsed > this.tempMessage.duration) {
            this.tempMessage = null;
            return;
        }

        // Плавное появление и исчезновение
        const alpha = elapsed < 500 ? elapsed / 500 :
                     elapsed > this.tempMessage.duration - 500 ?
                     (this.tempMessage.duration - elapsed) / 500 : 1;

        this.ctx.save();
        this.ctx.fillStyle = `rgba(${this.hexToRgb(this.tempMessage.color)}, ${alpha})`;
        this.ctx.font = this.fonts.medium;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(this.tempMessage.text, this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.restore();
    }

    // Вспомогательный метод для преобразования hex в rgb
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ?
            `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` :
            '255, 255, 255';
    }

    // Переключение отладочной информации
    toggleDebugInfo() {
        this.showDebugInfo = !this.showDebugInfo;
    }

    // Переключение инструкций
    toggleInstructions() {
        this.showInstructions = !this.showInstructions;
    }
}