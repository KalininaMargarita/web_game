// Размеры игры
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

// Состояния игры
const GAME_STATES = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over',
    WIN: 'win'
};

// РЕАЛИСТИЧНАЯ ФИЗИКА ПОЛЕТА СОВЫ С УСКОРЕНИЕМ ПРИ ПАДЕНИИ
const PHYSICS = {
    // Основные физические константы
    GRAVITY: 9.8,
    AIR_DENSITY: 1.225,

    // Характеристики совы
    MASS: 0.8,
    WINGSPAN: 1.2,
    WING_AREA: 0.15,
    BODY_AREA: 0.02,

    // Аэродинамические коэффициенты
    LIFT_COEFFICIENT_MAX: 1.5,
    DRAG_COEFFICIENT_BODY: 0.8,
    LIFT_TO_DRAG_RATIO: 8,

    // ОЧЕНЬ РЕЗКИЙ ВЗМАХ КРЫЛЬЯМИ
    FLAP_POWER: 80,
    FLAP_EFFICIENCY: 0.9,
    FLAP_DURATION: 0.3,

    // ОЧЕНЬ РЕЗКОЕ ПИКИРОВАНИЕ
    DIVE_FORCE: 40,
    DIVE_ANGLE_MAX: 75,
    DIVE_DRAG_REDUCTION: 0.3,

    // Динамика полета
    ANGULAR_DAMPING: 0.9,
    STABILITY_DERIVATIVE: 0.3,

    // ПАРАМЕТРЫ ПРИЗЕМЛЕНИЯ (НОВЫЕ)
    BOUNCE_THRESHOLD: 25, // Минимальная скорость для отскока
    BOUNCE_FACTOR_MIN: 0.4, // Минимальный коэффициент отскока
    BOUNCE_FACTOR_MAX: 0.6, // Максимальный коэффициент отскока
    SOFT_LANDING_MAX: 25, // Максимальная скорость для мягкой посадки
    HARD_LANDING_MIN: 40, // Минимальная скорость для жесткой посадки

    // Ограничения для РЕЗКОГО управления
    MAX_AIRSPEED: 25,
    MAX_CLIMB_RATE: 12,
    MAX_DIVE_RATE: 35,
    STALL_SPEED: 2,
    MIN_FLIGHT_SPEED: 1,

    // ПАРАМЕТРЫ УСКОРЕНИЯ ПРИ ПАДЕНИИ (НОВЫЕ)
    FALL_ACCELERATION: 1.5, // Множитель ускорения при падении
    TERMINAL_VELOCITY: 50, // Максимальная скорость падения

    // Масштаб
    PIXELS_PER_METER: 10,

    // Игрок
    PLAYER_FIXED_X: 200,

    // Управление
    FLAP_FORCE: 30,
    GLIDE_LIFT: 6,
    AIR_RESISTANCE: 0.1,
    GROUND_FRICTION: 0.8
};

// Игрок
const PLAYER = {
    START_Y: 300,
    START_VELOCITY_Y: 0
};

// Платформы
const GROUND = {
    HEIGHT: 60,
    Y: CANVAS_HEIGHT - 60
};

// Управление
const KEYS = {
    SPACE: 'Space',
    W: 'KeyW',
    S: 'KeyS',
    E: 'KeyE',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    MOUSE_CLICK: 0
};

// Цвета
const COLORS = {
    PLAYER: '#8B4513',
    GROUND: '#2d5016',
    BRANCH: '#654321',
    MOUSE: '#A9A9A9',
    BACKGROUND: ['#87CEEB', '#98D8E8', '#B0E0E6'],
    BLOOD: '#8B0000'
};

// Анимация
const ANIMATION = {
    WALK_FRAME_DURATION: 200,
    FLAP_FRAME_DURATION: 40
};

// Уровни
const LEVELS = {
    LEVEL_1: {
        NAME: 'Лесной полет',
        TARGET_SCORE: 1000,
        DURATION: 120,
        MOUSE_COUNT: 10,
        BRANCH_COUNT: 15
    }
};

// Частицы
const PARTICLES = {
    BLOOD: {
        COUNT: 20,
        LIFETIME: 1000,
        SIZE: 3,
        SPEED: 2
    }
};

// Препятствия
const OBSTACLES = {
    BRANCH: {
        WIDTH: 30,
        HEIGHT: 200,
        SPEED: 2,
        SPAWN_INTERVAL: 2000
    }
};

// Добыча
const PREY = {
    MOUSE: {
        WIDTH: 20,
        HEIGHT: 15,
        ESCAPE_TIME: 3000,
        VALUE: 100,
        HIDE_SPEED_MULTIPLIER: 0.3,
        HIDE_CHECK_INTERVAL: 200
    }
};