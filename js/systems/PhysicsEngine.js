class PhysicsEngine {
    constructor() {
        this.landingEffects = new LandingEffects(); // Новая система эффектов
        console.log('PhysicsEngine создан с эффектами приземления');
    }

    // Основной метод обновления физики игрока
    updatePlayerPhysics(player, deltaTime) {
        if (!player) return;

        const dt = deltaTime / 1000; // Конвертируем в секунды

        // 1. Определяем режим полета
        this.determineFlightMode(player);

        // 2. Применяем гравитацию с ускорением при падении
        this.applyGravity(player, dt);

        // 3. Применяем управление
        this.applyControlForces(player, dt);

        // 4. Применяем аэродинамические силы
        this.applyAerodynamics(player, dt);

        // 5. Интегрируем движение
        this.integrateMotion(player, dt);

        // 6. Проверяем ограничения
        this.applyLimits(player);
    }

    determineFlightMode(player) {
        if (player.isOnGround) {
            player.isFlapping = false;
            player.isDiving = false;
            player.isGliding = false;
            player.isStalled = false;
            return;
        }

        // Проверяем сваливание
        const airspeed = Math.abs(player.velocityY);
        player.isStalled = airspeed < PHYSICS.STALL_SPEED &&
                          !player.isFlapping &&
                          !player.isDiving;

        // Определяем режим
        if (player.isStalled) {
            player.isGliding = false;
        } else if (!player.isFlapping && !player.isDiving && airspeed > PHYSICS.STALL_SPEED) {
            player.isGliding = true;
        } else if (!player.isFlapping && !player.isDiving) {
            player.isGliding = false;
        }
    }

    applyGravity(player, dt) {
        if (!player.isOnGround && !player.isWalking) {
            // УСИЛЕННАЯ ГРАВИТАЦИЯ при падении вниз
            if (player.velocityY > 0) { // Падаем вниз
                // Ускорение гравитации при падении
                const fallMultiplier = 1.5 + Math.min(1.0, player.velocityY / 100);
                player.velocityY += PHYSICS.GRAVITY * dt * PHYSICS.PIXELS_PER_METER * fallMultiplier;
            } else { // Поднимаемся вверх
                // Нормальная гравитация при подъеме
                player.velocityY += PHYSICS.GRAVITY * dt * PHYSICS.PIXELS_PER_METER;
            }
        } else {
            // На земле или при ходьбе - нет гравитации
            player.velocityY = 0;
        }
    }

    applyControlForces(player, dt) {
        // ОЧЕНЬ РЕЗКИЙ ВЗМАХ КРЫЛЬЯМИ (W/Space)
        if (player.isFlapping && !player.isOnGround && !player.isWalking) {
            // ОЧЕНЬ МОЩНЫЙ подъем при взмахе
            const flapPower = PHYSICS.FLAP_POWER * PHYSICS.PIXELS_PER_METER;

            // СУПЕР интенсивный подъем
            if (player.flapTimer < 0.1) { // Первые 100мс - МАКСИМАЛЬНЫЙ подъем
                player.velocityY -= flapPower * 5.0 * dt; // УВЕЛИЧЕНО с 3.5 до 5.0
            } else if (player.flapTimer < 0.2) { // Следующие 100мс - сильный подъем
                player.velocityY -= flapPower * 3.0 * dt; // УВЕЛИЧЕНО с 1.8 до 3.0
            } else if (player.flapTimer < 0.3) { // Последние 100мс - ослабевающий подъем
                player.velocityY -= flapPower * 1.2 * dt; // УВЕЛИЧЕНО с 0.7 до 1.2
            }

            // Обновляем таймер взмаха
            player.flapTimer += dt;

            // Более короткий взмах для резкости
            if (player.flapTimer > 0.3) { // Взмах длится 300мс (быстрее)
                player.stopFlap();
            }

            // МИНИМАЛЬНОЕ сопротивление воздуха при активном взмахе
            player.velocityY *= (1 - PHYSICS.AIR_RESISTANCE * 0.1 * dt);

            // Резкий наклон назад при взмахе
            player.pitchAngle = Math.max(-0.5, player.pitchAngle - 0.08);

        } else if (player.isDiving && !player.isOnGround && !player.isWalking) {
            // ОЧЕНЬ РЕЗКОЕ ПИКИРОВАНИЕ (S/Клик)
            const diveForce = PHYSICS.DIVE_FORCE * PHYSICS.PIXELS_PER_METER;

            // СУПЕР резкое ускоренное падение
            player.velocityY += diveForce * 2.0 * dt; // УВЕЛИЧЕНО с 1.5 до 2.0

            // МИНИМАЛЬНОЕ сопротивление воздуха для ощущения скорости
            player.velocityY *= (1 - PHYSICS.AIR_RESISTANCE * 0.05 * dt); // ЕЩЕ меньше сопротивление

            // ОЧЕНЬ резкий наклон вперед при пикировании
            player.pitchAngle = Math.min(1.2, player.pitchAngle + 0.15); // УВЕЛИЧЕНО с 0.1 до 0.15

            // Мгновенный эффект пикирования - дополнительный импульс
            if (player.diveTimer < 0.1) {
                player.velocityY += diveForce * 0.5 * dt; // Дополнительный импульс в начале
            }

            player.diveTimer += dt;

        } else if (player.isGliding && !player.isOnGround && !player.isWalking) {
            // ПЛАНИРОВАНИЕ (отпущены все клавиши)
            // Медленное снижение с подъемной силой
            const glideLift = PHYSICS.GLIDE_LIFT * PHYSICS.PIXELS_PER_METER;

            // Подъемная сила зависит от скорости
            const speedFactor = Math.min(1, Math.abs(player.velocityY) / (PHYSICS.MAX_AIRSPEED * PHYSICS.PIXELS_PER_METER));
            player.velocityY -= glideLift * speedFactor * dt;

            // Нормальное сопротивление воздуха
            player.velocityY *= (1 - PHYSICS.AIR_RESISTANCE * dt);

            // Постепенное выравнивание
            if (player.pitchAngle > 0) {
                player.pitchAngle = Math.max(0, player.pitchAngle - 0.03);
            } else if (player.pitchAngle < 0) {
                player.pitchAngle = Math.min(0, player.pitchAngle + 0.03);
            }

        } else if (!player.isOnGround && !player.isWalking) {
            // СВОБОДНОЕ ПАДЕНИЕ (без взмаха и не планирование)
            // Только гравитация и сопротивление воздуха
            player.velocityY *= (1 - PHYSICS.AIR_RESISTANCE * dt);

            // Наклон вперед при падении
            if (player.velocityY > 0) {
                player.pitchAngle = Math.min(0.5, player.pitchAngle + 0.02);
            }
        }
    }

    applyAerodynamics(player, dt) {
        if (player.isOnGround || player.isWalking) return;

        // Расчет воздушной скорости для отображения
        player.airspeed = Math.abs(player.velocityY) / PHYSICS.PIXELS_PER_METER;

        // Автоматическое планирование при достаточной скорости
        if (!player.isFlapping && !player.isDiving &&
            player.airspeed > PHYSICS.STALL_SPEED &&
            !player.isGliding) {
            player.isGliding = true;
        }

        // Сваливание при слишком малой скорости
        if (player.airspeed < PHYSICS.STALL_SPEED &&
            !player.isFlapping && !player.isDiving) {
            player.isStalled = true;
            player.isGliding = false;
        }
    }

    integrateMotion(player, dt) {
        // Обновляем позицию по Y
        player.y += player.velocityY * dt;

        // Всегда фиксируем X-позицию на PHYSICS.PLAYER_FIXED_X
        player.x = PHYSICS.PLAYER_FIXED_X;
    }

    applyLimits(player) {
        // Если ходим - не ограничиваем вертикальную скорость (она и так 0)
        if (player.isWalking) {
            player.velocityY = 0;
            player.pitchAngle = 0;
            player.velocityX = 0;
            return;
        }

        // Ограничиваем вертикальную скорость только в полете
        if (player.isDiving) {
            // ОЧЕНЬ ВЫСОКАЯ максимальная скорость при пикировании
            player.velocityY = Math.min(
                PHYSICS.MAX_DIVE_RATE * PHYSICS.PIXELS_PER_METER * 1.5,
                player.velocityY
            );
        } else if (player.isFlapping) {
            // ОЧЕНЬ ВЫСОКИЙ МАКСИМАЛЬНЫЙ ПОДЪЕМ при взмахе
            player.velocityY = Math.max(
                -PHYSICS.MAX_CLIMB_RATE * PHYSICS.PIXELS_PER_METER * 3.5,
                player.velocityY
            );
        } else {
            // Стандартные ограничения
            player.velocityY = Math.max(
                -PHYSICS.MAX_CLIMB_RATE * PHYSICS.PIXELS_PER_METER,
                Math.min(
                    PHYSICS.MAX_DIVE_RATE * PHYSICS.PIXELS_PER_METER * 0.7,
                    player.velocityY
                )
            );
        }

        // Ограничиваем угол тангажа
        player.pitchAngle = Math.max(-1.2, Math.min(1.2, player.pitchAngle));

        // Ограничиваем воздушную скорость для отображения
        player.airspeed = Math.max(0, Math.min(PHYSICS.MAX_AIRSPEED, player.airspeed));
    }

    // Методы для расчета столкновений с землей (ИЗМЕНЕНО)
    checkGroundCollision(player, platforms) {
        if (!platforms || platforms.length === 0) {
            player.isOnGround = false;
            player.groundY = undefined;
            player.canWalk = false;
            return;
        }

        // Сбрасываем состояние земли
        player.isOnGround = false;
        player.canWalk = false;
        player.groundY = undefined;

        // Проверяем только землю (первая платформа)
        const ground = platforms[0];
        if (!ground) return;

        // Проверяем коллизию с землей
        const playerBottom = player.y + player.height;
        const groundTop = ground.y;
        const landingX = player.x + player.width / 2; // Центр игрока для эффектов

        // Если игрок касается земли или уже немного в ней
        if (playerBottom >= groundTop - 5 && playerBottom <= groundTop + 15 && player.velocityY >= 0) {
            const landingSpeed = player.velocityY;
            const absoluteSpeed = Math.abs(landingSpeed);

            // УСЛОВИЯ ОТСКОКА ТОЛЬКО ПРИ ВЫСОКОЙ СКОРОСТИ
            const bounceThreshold = PHYSICS.BOUNCE_THRESHOLD || 25;

            // Мягкая посадка (нет отскока)
            if (absoluteSpeed < bounceThreshold) {
                player.isOnGround = true;
                player.canWalk = true;
                player.groundY = groundTop;

                // Фиксируем точно на земле
                player.y = groundTop - player.height;
                player.velocityY = 0;
                player.pitchAngle = 0;
                player.isDiving = false;
                player.diveTimer = 0;

                // Легкий эффект пыли при мягкой посадке
                if (this.landingEffects && absoluteSpeed > 5) {
                    this.landingEffects.addSoftLandingEffect(landingX, groundTop);
                }

                // Сообщение о мягкой посадке
                console.log(`Мягкая посадка: скорость ${absoluteSpeed.toFixed(1)}`);
            }
            // Средняя посадка - небольшой отскок
            else if (absoluteSpeed < PHYSICS.HARD_LANDING_MIN || 40) {
                const bounceFactor = PHYSICS.BOUNCE_FACTOR_MIN * (absoluteSpeed / (PHYSICS.HARD_LANDING_MIN || 40));
                player.y = groundTop - player.height;
                player.velocityY = -landingSpeed * bounceFactor;
                player.isDiving = false;
                player.diveTimer = 0;
                player.isOnGround = false; // Не на земле после отскока

                // Эффект приземления
                if (this.landingEffects) {
                    this.landingEffects.addLandingEffect(landingX, groundTop,
                        absoluteSpeed / bounceThreshold);
                }

                console.log(`Средняя посадка: скорость ${absoluteSpeed.toFixed(1)}, отскок ${bounceFactor.toFixed(2)}`);
            }
            // Жесткая посадка - сильный отскок
            else {
                const bounceFactor = PHYSICS.BOUNCE_FACTOR_MAX * Math.min(1, absoluteSpeed / 60);
                player.y = groundTop - player.height;
                player.velocityY = -landingSpeed * bounceFactor;
                player.isDiving = false;
                player.diveTimer = 0;
                player.isOnGround = false;

                // Эффект жесткой посадки
                if (this.landingEffects) {
                    this.landingEffects.addHardLandingEffect(landingX, groundTop);
                }

                // Также эффекты крови если очень высокая скорость
                if (player.game && player.game.bloodSystem && absoluteSpeed > 50) {
                    player.game.bloodSystem.addGroundImpactEffect(landingX, groundTop);
                }

                console.log(`Жесткая посадка: скорость ${absoluteSpeed.toFixed(1)}, отскок ${bounceFactor.toFixed(2)}`);
            }
        }

        // Коллизия с верхом экрана
        if (player.y < 0) {
            player.y = 0;
            player.velocityY = Math.max(0, player.velocityY);
        }

        // Коллизия с низом экрана
        if (player.y + player.height > CANVAS_HEIGHT) {
            player.y = CANVAS_HEIGHT - player.height;
            player.velocityY = 0;
            player.isOnGround = true;
            player.canWalk = true;
            player.groundY = CANVAS_HEIGHT;
            player.isDiving = false;
            player.diveTimer = 0;

            // Эффект приземления на дно экрана
            if (this.landingEffects) {
                this.landingEffects.addHardLandingEffect(player.x + player.width/2, CANVAS_HEIGHT);
            }

            // Эффект удара о дно экрана
            if (player.game && player.game.bloodSystem) {
                player.game.bloodSystem.addGroundImpactEffect(player.x + player.width/2, CANVAS_HEIGHT);
            }
        }
    }

    // Метод для обновления эффектов
    updateEffects(deltaTime) {
        if (this.landingEffects) {
            this.landingEffects.update(deltaTime);
        }
    }

    // Метод для отрисовки эффектов
    renderEffects(ctx) {
        if (this.landingEffects) {
            this.landingEffects.render(ctx);
        }
    }

    // Метод для очистки эффектов
    clearEffects() {
        if (this.landingEffects) {
            this.landingEffects.clear();
        }
    }
}