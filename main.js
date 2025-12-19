class OwlAdventure {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        console.log('Canvas найден:', this.canvas);

        this.game = new Game(this.canvas);
        this.lastTime = 0;

        // Элементы UI
        this.startScreen = document.getElementById('gameStart');
        this.gameOverScreen = document.getElementById('gameOver');
        this.gameWinScreen = document.getElementById('gameWin');
        this.startButton = document.getElementById('startButton');
        this.restartButton = document.getElementById('restartButton');
        this.nextLevelButton = document.getElementById('nextLevelButton');
        this.scoreElement = document.getElementById('score');

        console.log('OwlAdventure создан');

        this.init();
    }

    init() {
        console.log('Инициализируем игру...');

        this.game.init();
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;

        console.log('Размер канваса установлен:', CANVAS_WIDTH, 'x', CANVAS_HEIGHT);

        // Настройка кнопок
        this.setupButtons();

        // Запуск игрового цикла
        console.log('Запускаем игровой цикл...');
        this.gameLoop(0);
    }

    setupButtons() {
        this.startButton.addEventListener('click', () => this.startGame());
        this.restartButton.addEventListener('click', () => this.restartGame());
        this.nextLevelButton.addEventListener('click', () => this.nextLevel());
    }

    startGame() {
        console.log('Начинаем игру...');
        this.game.start();
        this.startScreen.classList.add('hidden');
        this.scoreElement.classList.remove('hidden');
        console.log('Игра запущена!');
    }

    restartGame() {
        console.log('Перезапускаем игру...');
        this.game = new Game(this.canvas);
        this.game.init();
        this.game.start();

        this.gameOverScreen.classList.add('hidden');
        this.gameWinScreen.classList.add('hidden');
        this.startScreen.classList.add('hidden');
        this.scoreElement.classList.remove('hidden');
    }

    nextLevel() {
        this.restartGame();
    }

    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime || 16;
        this.lastTime = timestamp;

        // Ограничиваем максимальный deltaTime для стабильности
        const safeDeltaTime = Math.min(deltaTime, 100);

        try {
            this.game.update(safeDeltaTime);
            this.game.render();
            this.updateUI();
        } catch (error) {
            console.error('Критическая ошибка в игровом цикле:', error);
        }

        requestAnimationFrame((time) => this.gameLoop(time));
    }

    updateUI() {
        this.scoreElement.textContent = `Очки: ${this.game.score}`;
        document.getElementById('scoreText').textContent = `Очки: ${this.game.score}`;
        document.getElementById('winScoreText').textContent = `Очки: ${this.game.score}`;

        if (this.game.state === GAME_STATES.GAME_OVER) {
            this.gameOverScreen.classList.remove('hidden');
            this.scoreElement.classList.add('hidden');
        } else if (this.game.state === GAME_STATES.WIN) {
            this.gameWinScreen.classList.remove('hidden');
            this.scoreElement.classList.add('hidden');
        }
    }
}

// Запуск игры после загрузки страницы
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM загружен, создаем OwlAdventure...');
    new OwlAdventure();
});