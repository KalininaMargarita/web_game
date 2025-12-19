class MouseRenderer {
    constructor(mouse) {
        this.mouse = mouse;
    }

    render(ctx) {
        if (!this.mouse.isAlive) return;

        if (this.mouse.screenX < -this.mouse.width || this.mouse.screenX > CANVAS_WIDTH + this.mouse.width) {
            return;
        }

        ctx.save();

        // Прозрачность
        if (this.mouse.isHiding) {
            ctx.globalAlpha = this.mouse.hideAlpha;

            // Добавляем эффект неуязвимости для спрятавшихся мышей
            if (Date.now() % 400 < 200) {
                ctx.filter = 'brightness(1.5)';
            }
        } else if (this.mouse.wantsToHide) {
            ctx.globalAlpha = 0.85;
        }

        // Параметры анимации
        let animParams;
        let state = 'normal';

        if (this.mouse.isHiding) {
            state = 'hiding';
            animParams = this.mouse.animation.updateHideAnimation(0);

            // Добавляем индикатор защиты
            this.drawProtectionIndicator(ctx, this.mouse.screenX, this.mouse.y);
        } else if (this.mouse.wantsToHide) {
            state = 'preparing_to_hide';
            animParams = this.mouse.animation.updateHidePreparationAnimation(0);
        } else if (this.mouse.isScared) {
            state = 'scared';
            animParams = this.mouse.animation.updateScaredAnimation(0);
        } else if (this.mouse.isRunning) {
            state = 'running';
            animParams = this.mouse.animation.updateWalkAnimation(0, true);
        } else {
            animParams = this.mouse.animation.updateWalkAnimation(0, false);
        }

        // Цвет
        const bodyColor = this.mouse.sprite.getBodyColor(state);

        // Рисуем
        const drawX = this.mouse.screenX;
        const drawY = this.mouse.y;

        // Индикатор подготовки к прятанию
        if (this.mouse.wantsToHide && !this.mouse.isHiding) {
            this.drawHideIndicator(ctx, drawX, drawY);
        }

        // Куст при прятании
        if (this.mouse.isHiding) {
            this.drawHidingBush(ctx, drawX, drawY);
            this.drawHideProtection(ctx, drawX, drawY);
        }

        // Тело
        this.mouse.sprite.renderBody(ctx, drawX, drawY, 0, bodyColor);

        // Голова
        if (!this.mouse.isHiding || this.mouse.hideAlpha > 0.5) {
            this.mouse.sprite.renderHead(ctx, drawX, drawY, 0);
        }

        // Глаза
        if (!this.mouse.isHiding || this.mouse.hideAlpha > 0.6) {
            this.mouse.sprite.renderEyes(ctx, drawX, drawY, this.mouse.isScared);
        }

        // Хвост
        this.mouse.sprite.renderTail(ctx, drawX, drawY,
            animParams.tailCurve || 0, animParams.tailWiggle || 0);

        // Лапы
        if (this.mouse.isOnGround && (!this.mouse.isHiding || this.mouse.hideAlpha > 0.7)) {
            this.mouse.sprite.renderFeet(ctx, drawX, drawY, animParams.walkOffset || 0);
        }

        // Усы
        if (!this.mouse.isHiding || this.mouse.hideAlpha > 0.8) {
            this.mouse.sprite.renderWhiskers(ctx, drawX, drawY, animParams.whiskerPhase || 0);
        }

        ctx.restore();

        // Отладочная информация о защите
        if (this.mouse.game.state === GAME_STATES.PLAYING && this.mouse.isHiding) {
            ctx.font = '10px Arial';
            ctx.fillStyle = 'cyan';
            ctx.textAlign = 'center';
            ctx.fillText('ЗАЩИЩЕНА', this.mouse.screenX + this.mouse.width/2, this.mouse.y - 10);
            ctx.textAlign = 'left';
        }
    }

    drawHideIndicator(ctx, x, y) {
        ctx.save();

        const indicatorX = x + this.mouse.width / 2;
        const indicatorY = y - 20;
        const progress = this.mouse.hideDelayTimer / this.mouse.hideDelay;

        // Вопросительный знак
        ctx.font = '12px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.textAlign = 'center';
        ctx.fillText('?', indicatorX, indicatorY);

        // Прогресс-бар
        const barWidth = 25;
        const barHeight = 2;
        const barX = indicatorX - barWidth / 2;
        const barY = indicatorY + 5;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        ctx.fillStyle = progress > 0.7 ? 'rgba(255, 100, 100, 0.8)' :
                        progress > 0.4 ? 'rgba(255, 200, 100, 0.8)' :
                        'rgba(100, 255, 100, 0.8)';
        ctx.fillRect(barX, barY, barWidth * progress, barHeight);

        ctx.restore();
    }

    drawHidingBush(ctx, x, y) {
        ctx.save();

        const bushWidth = 35;
        const bushHeight = 15;
        const bushX = x + this.mouse.width / 2 - bushWidth / 2;
        const bushY = y + this.mouse.height - 5;

        // Основание куста
        ctx.fillStyle = '#2d5016';
        ctx.beginPath();
        ctx.ellipse(bushX + bushWidth/2, bushY, bushWidth/2, bushHeight/2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Верхняя часть куста
        ctx.fillStyle = '#3a7d34';
        for (let i = 0; i < 6; i++) {
            const bladeX = bushX + (i * bushWidth/5);
            const bladeHeight = 10 + Math.random() * 10;
            const bladeWidth = 3;

            ctx.beginPath();
            ctx.moveTo(bladeX, bushY);
            ctx.quadraticCurveTo(
                bladeX + bladeWidth/2,
                bushY - bladeHeight/2,
                bladeX + bladeWidth,
                bushY - bladeHeight
            );
            ctx.quadraticCurveTo(
                bladeX + bladeWidth/2,
                bushY - bladeHeight/3,
                bladeX,
                bushY
            );
            ctx.fill();
        }

        ctx.restore();
    }

    drawProtectionIndicator(ctx, x, y) {
        ctx.save();

        const centerX = x + this.mouse.width / 2;
        const centerY = y - 30;

        // Анимированный щит
        const pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;

        ctx.strokeStyle = `rgba(100, 200, 255, ${pulse})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
        ctx.stroke();

        // Символ щита внутри
        ctx.fillStyle = `rgba(100, 200, 255, ${pulse})`;
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⛨', centerX, centerY);

        ctx.restore();
    }

    drawHideProtection(ctx, x, y) {
        ctx.save();

        // Полупрозрачный защитный круг вокруг мыши
        const pulse = Math.sin(Date.now() * 0.003) * 0.2 + 0.3;

        ctx.strokeStyle = `rgba(0, 255, 255, ${pulse})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 3]);

        const radius = Math.max(this.mouse.width, this.mouse.height) + 5;
        const centerX = x + this.mouse.width / 2;
        const centerY = y + this.mouse.height / 2;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }
}