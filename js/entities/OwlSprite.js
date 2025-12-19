// Базовый класс спрайта совы (для будущей интеграции скинов)
class OwlSprite {
    constructor() {
        // Цвета по умолчанию
        this.colors = {
            body: '#8B4513',
            head: '#654321',
            wings: '#5D4037',
            legs: '#8B4513',
            eyes: 'yellow',
            pupils: 'black',
            beak: 'orange'
        };

        // Размеры частей тела
        this.dimensions = {
            bodyWidth: 60,
            bodyHeight: 40,
            headRadius: 25,
            eyeRadius: 6,
            pupilRadius: 3,
            wingWidth: 20,
            wingHeight: 30,
            legWidth: 8,
            legHeight: 15
        };
    }

    // Методы для отрисовки частей совы

    renderBody(ctx, x, y, rotation, color) {
        ctx.save();
        ctx.translate(x + this.dimensions.bodyWidth/2, y + this.dimensions.bodyHeight/2);
        ctx.rotate(rotation);
        ctx.fillStyle = color || this.colors.body;
        ctx.fillRect(-this.dimensions.bodyWidth/2, -this.dimensions.bodyHeight/2,
                     this.dimensions.bodyWidth, this.dimensions.bodyHeight);
        ctx.restore();
    }

    renderHead(ctx, x, y, rotation, color) {
        ctx.save();
        ctx.translate(x + this.dimensions.bodyWidth, y + this.dimensions.bodyHeight/2);
        ctx.rotate(rotation);
        ctx.fillStyle = color || this.colors.head;
        ctx.beginPath();
        ctx.arc(0, 0, this.dimensions.headRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    renderEyes(ctx, x, y, tilt, pupilOffset) {
        ctx.save();
        ctx.translate(x + this.dimensions.bodyWidth + 10, y + this.dimensions.bodyHeight/2);
        ctx.rotate(tilt);

        // Глаза
        ctx.fillStyle = this.colors.eyes;
        ctx.beginPath();
        ctx.arc(0, -8, this.dimensions.eyeRadius, 0, Math.PI * 2);
        ctx.arc(0, 8, this.dimensions.eyeRadius, 0, Math.PI * 2);
        ctx.fill();

        // Зрачки
        ctx.fillStyle = this.colors.pupils;
        ctx.beginPath();
        ctx.arc(pupilOffset, -8, this.dimensions.pupilRadius, 0, Math.PI * 2);
        ctx.arc(pupilOffset, 8, this.dimensions.pupilRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    renderBeak(ctx, x, y) {
        ctx.fillStyle = this.colors.beak;
        ctx.beginPath();
        ctx.moveTo(x + this.dimensions.bodyWidth + 30, y + this.dimensions.bodyHeight/2);
        ctx.lineTo(x + this.dimensions.bodyWidth + 50, y + this.dimensions.bodyHeight/2);
        ctx.lineTo(x + this.dimensions.bodyWidth + 40, y + this.dimensions.bodyHeight/2 + 10);
        ctx.fill();
    }

    renderLegs(ctx, x, y, walkOffset) {
        ctx.fillStyle = this.colors.legs;

        // Левая нога
        const leftLegX = x + 15 + walkOffset;
        ctx.fillRect(leftLegX, y + this.dimensions.bodyHeight - 5,
                    this.dimensions.legWidth, this.dimensions.legHeight);
        ctx.fillRect(leftLegX - 2, y + this.dimensions.bodyHeight + 10, 12, 5);

        // Правая нога
        const rightLegX = x + this.dimensions.bodyWidth - 25 - walkOffset;
        ctx.fillRect(rightLegX, y + this.dimensions.bodyHeight - 5,
                    this.dimensions.legWidth, this.dimensions.legHeight);
        ctx.fillRect(rightLegX - 2, y + this.dimensions.bodyHeight + 10, 12, 5);
    }

    renderWings(ctx, x, y, wingParams) {
        ctx.fillStyle = wingParams.color || this.colors.wings;

        if (wingParams.type === 'flapping') {
            // Взмах
            ctx.save();
            ctx.translate(x + 10, y + this.dimensions.bodyHeight/2);
            ctx.rotate(wingParams.rotationLeft || -0.3);
            ctx.fillRect(0, -wingParams.height/2, wingParams.width, wingParams.height);
            ctx.restore();

            ctx.save();
            ctx.translate(x + this.dimensions.bodyWidth - 10, y + this.dimensions.bodyHeight/2);
            ctx.rotate(wingParams.rotationRight || 0.3);
            ctx.fillRect(-wingParams.width, -wingParams.height/2, wingParams.width, wingParams.height);
            ctx.restore();

        } else if (wingParams.type === 'diving') {
            // Пикирование
            ctx.fillStyle = '#4A3520';
            ctx.fillRect(x - 3, y + 10, 6, this.dimensions.bodyHeight - 20);
            ctx.fillRect(x + this.dimensions.bodyWidth - 3, y + 10, 6, this.dimensions.bodyHeight - 20);

        } else if (wingParams.type === 'gliding') {
            // Планирование
            ctx.save();
            ctx.translate(x, y + this.dimensions.bodyHeight/2);
            ctx.rotate(wingParams.rotationLeft || -0.1);
            ctx.fillRect(0, -15, wingParams.widthLeft || 25, 30);
            ctx.restore();

            ctx.save();
            ctx.translate(x + this.dimensions.bodyWidth, y + this.dimensions.bodyHeight/2);
            ctx.rotate(wingParams.rotationRight || 0.1);
            ctx.fillRect(-(wingParams.widthRight || 25), -15, wingParams.widthRight || 25, 30);
            ctx.restore();

        } else if (wingParams.type === 'ground') {
            // На земле
            ctx.fillRect(x - 5, y + 10, 10, this.dimensions.bodyHeight - 20);
            ctx.fillRect(x + this.dimensions.bodyWidth - 5, y + 10, 10, this.dimensions.bodyHeight - 20);
        }
    }

    // Метод для получения цвета в зависимости от состояния
    getBodyColor(state) {
        switch(state) {
            case 'stalled': return '#FF6B6B';
            case 'flapping': return '#D2691E';
            case 'diving': return '#A0522D';
            default: return this.colors.body;
        }
    }
}