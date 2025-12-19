// Система ИИ для мышей
class MiceAi {
    constructor() {
        console.log('MiceAi система создана');
    }

    // Обновление ИИ для одной мыши
    updateMouseAi(mouse, deltaTime, player) {
        if (!mouse.isAlive || !player) return;

        const dt = Math.min(deltaTime, 100) / 1000;

        // 1. Проверка состояния испуга
        if (mouse.isScared) {
            mouse.scareTimer += deltaTime;
            if (mouse.scareTimer > 1800) {
                mouse.isScared = false;
                mouse.isRunning = false;
                mouse.scareTimer = 0;
                mouse.currentSpeed = mouse.baseSpeed;
            }
        }

        // 2. Проверка расстояния до игрока
        if (!mouse.isScared && !mouse.isHiding) {
            const dx = player.x - mouse.screenX;
            const dy = player.y - mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.scareDistance && dy < 50) {
                this.scareMouse(mouse);
            }
        }

        // 3. Проверка условия прятания - УПРОЩЕННАЯ ЛОГИКА
        const now = Date.now();
        if (now - mouse.lastHideCheck > mouse.hideCheckCooldown) {
            mouse.lastHideCheck = now;

            // Мыши чаще пытаются спрятаться
            if (!mouse.isScared && !mouse.isHiding && !mouse.wantsToHide) {
                // Случайная проверка: 30% шанс начать прятаться
                if (Math.random() < 0.3) {
                    this.startHideIntent(mouse);
                }
            }

            // Если игрок близко и выше мыши - с большей вероятностью прячемся
            if (player && player.y < mouse.y + 100) {
                if (!mouse.isHiding && !mouse.wantsToHide && !mouse.isScared) {
                    if (Math.random() < 0.5) {
                        this.startHideIntent(mouse);
                    }
                }
            }
        }

        // 4. Обновление таймеров прятания
        if (mouse.wantsToHide && !mouse.isHiding && !mouse.isScared) {
            mouse.hideDelayTimer += deltaTime;
            if (mouse.hideDelayTimer >= mouse.hideDelay) {
                this.startHiding(mouse);
            }
        }

        if (!mouse.wantsToHide && mouse.isHiding) {
            mouse.hideCooldownTimer += deltaTime;
            if (mouse.hideCooldownTimer >= mouse.hideCooldown) {
                this.stopHiding(mouse);
            }
        }

        // 5. Обновление прозрачности
        if (mouse.isHiding) {
            mouse.hideAlpha = 0.3 + Math.sin(Date.now() * 0.005) * 0.2;
        } else if (mouse.hideAlpha < 1.0) {
            mouse.hideAlpha = Math.min(1.0, mouse.hideAlpha + dt * 3);
        }

        // 6. Обновление скорости
        if (mouse.isHiding) {
            mouse.currentSpeed = mouse.baseSpeed * 0.3;
        } else if (mouse.wantsToHide && !mouse.isScared) {
            mouse.currentSpeed = mouse.baseSpeed * 0.8;
        } else if (mouse.isScared) {
            mouse.currentSpeed = mouse.runSpeed;
        } else {
            mouse.currentSpeed = mouse.baseSpeed;
        }
    }

    // Напугать мышь
    scareMouse(mouse) {
        mouse.isScared = true;
        mouse.isRunning = true;
        mouse.scareTimer = 0;
        mouse.currentSpeed = mouse.runSpeed;
        mouse.wantsToHide = false;
        mouse.hideDelayTimer = 0;

        if (mouse.isOnGround) {
            mouse.velocityY = mouse.jumpForce;
            mouse.isOnGround = false;
            mouse.lastJumpTime = Date.now();
        }
    }

    // Начать намерение спрятаться
    startHideIntent(mouse) {
        mouse.wantsToHide = true;
        mouse.hideDelayTimer = 0;
        mouse.hideDelay = 300 + Math.random() * 500; // Быстрее прячутся
    }

    // Отменить намерение спрятаться
    cancelHideIntent(mouse) {
        mouse.wantsToHide = false;
        mouse.hideDelayTimer = 0;
    }

    // Начать прятаться
    startHiding(mouse) {
        mouse.isHiding = true;
        mouse.wantsToHide = false;
        mouse.hideTimer = 0;
        mouse.hideDelayTimer = 0;
        mouse.hideAlpha = 0.5;
        mouse.hideProtection = true; // Включаем защиту
        console.log('Мышь спряталась - теперь неуязвима!');
    }

    // Перестать прятаться
    stopHiding(mouse) {
        mouse.isHiding = false;
        mouse.wantsToHide = false;
        mouse.hideCooldownTimer = 0;
        mouse.hideCooldown = 1000 + Math.random() * 1000; // Дольше остаются видимыми
        mouse.hideProtection = false; // Выключаем защиту
        console.log('Мышь вышла из укрытия - снова уязвима');
    }

    // Проверить возможность случайного прыжка
    checkRandomJump(mouse) {
        if (mouse.isOnGround &&
            !mouse.isScared &&
            !mouse.isHiding &&
            !mouse.wantsToHide &&
            Date.now() - mouse.lastJumpTime > mouse.jumpCooldown &&
            Math.random() < 0.001) {

            mouse.velocityY = mouse.jumpForce;
            mouse.isOnGround = false;
            mouse.lastJumpTime = Date.now();
        }
    }

    // Сброс состояния ИИ при респауне
    resetAiState(mouse) {
        mouse.isScared = false;
        mouse.isRunning = false;
        mouse.isHiding = false;
        mouse.wantsToHide = false;
        mouse.hideAlpha = 1.0;
        mouse.scareTimer = 0;
        mouse.hideTimer = 0;
        mouse.hideDelayTimer = 0;
        mouse.hideCooldownTimer = 0;
        mouse.currentSpeed = mouse.baseSpeed;
        mouse.hideDelay = 300 + Math.random() * 500;
        mouse.hideCooldown = 1000 + Math.random() * 1000;
        mouse.hideProtection = false;
    }
}