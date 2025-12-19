class Player {
    constructor(game) {
        this.game = game;

        // Инициализация спрайта и анимации
        this.sprite = new OwlSprite();
        this.animation = new OwlAnimation();

        // Размеры из спрайта
        this.width = this.sprite.dimensions.bodyWidth;
        this.height = this.sprite.dimensions.bodyHeight;
        this.x = PHYSICS.PLAYER_FIXED_X;
        this.y = PLAYER.START_Y;

        // Физические параметры
        this.velocityY = PLAYER.START_VELOCITY_Y;
        this.velocityX = 0;
        this.airspeed = 0;

        // НОВАЯ ПЕРЕМЕННАЯ: скорость при последнем касании земли
        this.lastLandingSpeed = 0;
        this.wasInAir = false; // Флаг для отслеживания состояния в воздухе

        // Углы
        this.pitchAngle = 0;
        this.angleOfAttack = 0;

        // Состояния полета
        this.isFlapping = false;
        this.isDiving = false;
        this.isGliding = true;
        this.isOnGround = false;
        this.isStalled = false;
        this.isWalking = false;
        this.canWalk = false;

        // Таймеры для резкого управления
        this.flapTimer = 0;
        this.diveTimer = 0;

        // Земля
        this.groundY = undefined;
        this.walkSpeed = 2;

        // Инициализация систем
        this.physics = new PhysicsEngine();

        console.log('Player создан с улучшенной физикой приземления');
    }

    update(deltaTime) {
        // Сохраняем скорость до обновления для определения приземления
        const speedBeforeUpdate = Math.abs(this.velocityY);

        // Сохраняем предыдущее состояние для определения приземления
        const wasOnGround = this.isOnGround;

        // Обновляем физику через PhysicsEngine
        this.physics.updatePlayerPhysics(this, deltaTime);

        // Проверяем коллизии с землей
        if (this.game.currentLevel) {
            this.physics.checkGroundCollision(this, this.game.currentLevel.platforms);
        }

        // Определяем приземление (если были в воздухе, а теперь на земле)
        if (!wasOnGround && this.isOnGround) {
            this.lastLandingSpeed = speedBeforeUpdate;
            this.wasInAir = false;

            // Отображение информации о посадке
            if (this.lastLandingSpeed > PHYSICS.SOFT_LANDING_MAX) {
                console.log(`Посадка со скоростью: ${this.lastLandingSpeed.toFixed(1)}`);

                // Показ сообщения в UI при жесткой посадке
                if (this.lastLandingSpeed > PHYSICS.HARD_LANDING_MIN && this.game.ui) {
                    this.game.ui.showMessage(
                        `ЖЕСТКАЯ ПОСАДКА! ${this.lastLandingSpeed.toFixed(0)}`,
                        1500,
                        '#e74c3c'
                    );
                }
            }
        }

        // Отслеживаем состояние в воздухе
        if (!this.isOnGround) {
            this.wasInAir = true;
        }

        // Простая логика ходьбы
        if (this.isOnGround && this.canWalk) {
            if (!this.isWalking) {
                this.startWalking();
            }
        } else {
            if (this.isWalking) {
                this.stopWalking();
            }
        }

        // Обновляем анимации
        this.updateAnimations(deltaTime);

        // Обновляем угол атаки для отображения
        if (Math.abs(this.velocityY) > 0.1) {
            this.angleOfAttack = Math.atan2(this.velocityY, Math.max(0.1, 1)) * 180 / Math.PI;
        }
    }

    updateAnimations(deltaTime) {
        // Анимации обновляются в методе render
    }

    // УПРАВЛЕНИЕ с резкими эффектами

    flap() {
        if (!this.isFlapping) {
            this.isFlapping = true;
            this.isGliding = false;
            this.isDiving = false;
            this.flapTimer = 0;
            this.diveTimer = 0;

            // При взмахе выходим с земли
            if (this.isOnGround || this.isWalking) {
                this.isOnGround = false;
                this.canWalk = false;
                this.groundY = undefined;
                this.stopWalking();
                this.wasInAir = true;

                // ОЧЕНЬ сильный подъем при взмахе с земли
                const flapPower = PHYSICS.FLAP_POWER * PHYSICS.PIXELS_PER_METER;
                this.velocityY = -flapPower * 1.2;
            } else {
                // ОЧЕНЬ сильный подъем в воздухе
                const flapPower = PHYSICS.FLAP_POWER * PHYSICS.PIXELS_PER_METER;
                this.velocityY = -flapPower * 1.5;
            }

            console.log('РЕЗКИЙ взмах!');
        }
    }

    stopFlap() {
        this.isFlapping = false;
        this.flapTimer = 0;
        if (!this.isDiving && !this.isOnGround) {
            this.isGliding = true;
        }
    }

    dive() {
        if (!this.isDiving) {
            this.isDiving = true;
            this.isGliding = false;
            this.isFlapping = false;
            this.diveTimer = 0;
            this.flapTimer = 0;

            // При пикировании выходим из режима ходьбы
            if (this.isWalking) {
                this.stopWalking();
            }

            // ОЧЕНЬ резкое начало пикирования
            const diveForce = PHYSICS.DIVE_FORCE * PHYSICS.PIXELS_PER_METER;
            this.velocityY = diveForce * 0.8;

            console.log('РЕЗКОЕ пикирование!');
        }
    }

    stopDive() {
        this.isDiving = false;
        this.diveTimer = 0;
        if (!this.isFlapping && !this.isOnGround) {
            this.isGliding = true;
        }
    }

    // Управление ходьбой
    startWalking() {
        if (this.isOnGround && this.canWalk) {
            this.isWalking = true;
            this.velocityX = this.walkSpeed;
            this.velocityY = 0;
            this.pitchAngle = 0;
            this.isDiving = false;
            this.diveTimer = 0;
        }
    }

    stopWalking() {
        this.isWalking = false;
        this.velocityX = 0;
        this.velocityY = 0;
    }

    // РЕНДЕРИНГ (без UI, но с отладочной информацией о посадке)
    render(ctx) {
        ctx.save();

        // Получаем параметры анимации
        const flightState = {
            isFlapping: this.isFlapping,
            isDiving: this.isDiving,
            isGliding: this.isGliding,
            isOnGround: this.isOnGround || this.isWalking
        };

        const walkAnim = this.animation.updateWalkAnimation(0, this.isWalking, this.velocityY);
        const wingAnim = this.animation.updateWingAnimation(0, flightState);

        const walkOffset = walkAnim.walkOffset;
        const bodyBob = walkAnim.bodyBob;
        const wingPhase = wingAnim.wingPhase;
        const flapPhase = wingAnim.flapPhase;

        // Определяем состояние для цвета
        let state = 'normal';
        if (this.isStalled) state = 'stalled';
        else if (this.isFlapping) state = 'flapping';
        else if (this.isDiving) state = 'diving';
        else if (this.velocityY > 30) state = 'falling'; // Новое состояние для падения

        // Рисуем тело
        this.sprite.renderBody(ctx, this.x, this.y + bodyBob, this.pitchAngle,
                              this.sprite.getBodyColor(state));

        // Рисуем голову
        this.sprite.renderHead(ctx, this.x, this.y + bodyBob, this.pitchAngle * 0.7);

        // Рисуем ноги если на земле или ходим
        if (this.isWalking) {
            this.sprite.renderLegs(ctx, this.x, this.y + bodyBob, walkOffset);
        }

        // Получаем параметры крыльев
        const wingParams = this.animation.getWingParams(
            flightState,
            wingPhase,
            flapPhase,
            this.airspeed,
            PHYSICS.MAX_AIRSPEED
        );

        // Рисуем крылья
        this.sprite.renderWings(ctx, this.x, this.y + bodyBob, wingParams);

        // Получаем параметры глаз
        const eyeParams = this.animation.getEyeParams(flightState, this.velocityY);

        // Рисуем глаза
        this.sprite.renderEyes(ctx, this.x, this.y + bodyBob, eyeParams.tilt, eyeParams.pupilOffset);

        // Рисуем клюв
        this.sprite.renderBeak(ctx, this.x, this.y + bodyBob);

        // Отладочная информация о скорости падения
        if (this.game.state === GAME_STATES.PLAYING && !this.isOnGround && this.velocityY > 0) {
            ctx.font = '12px Arial';

            // Цвет в зависимости от скорости падения
            if (this.velocityY > PHYSICS.HARD_LANDING_MIN) {
                ctx.fillStyle = '#e74c12'; // Оранжевый для опасной скорости
                ctx.fillText(`ОПАСНО! ${Math.abs(this.velocityY).toFixed(1)}`, this.x + 70, this.y - 60);
            } else if (this.velocityY > PHYSICS.SOFT_LANDING_MAX) {
                ctx.fillStyle = '#f39c12'; // Оранжевый для средней скорости
                ctx.fillText(`Внимание: ${Math.abs(this.velocityY).toFixed(1)}`, this.x + 70, this.y - 60);
            }

            // Информация о режиме полета
            ctx.fillStyle = 'white';
            ctx.fillText(`Режим: ${this.isFlapping ? 'ВЗМАХ' : this.isDiving ? 'ПИКИРОВАНИЕ' : this.isGliding ? 'ПЛАНИРОВАНИЕ' : 'ПАДЕНИЕ'}`, this.x + 70, this.y - 45);

            // Индикатор резкости
            if (this.isFlapping) {
                ctx.fillStyle = 'yellow';
                ctx.fillText('↑↑↑ РЕЗКИЙ ПОДЪЕМ ↑↑↑', this.x + 70, this.y - 30);
            } else if (this.isDiving) {
                ctx.fillStyle = 'red';
                ctx.fillText('↓↓↓ РЕЗКОЕ ПИКИРОВАНИЕ ↓↓↓', this.x + 70, this.y - 30);
            }
        }

        ctx.restore();
    }
}