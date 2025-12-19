class MiceSprite {
    constructor() {
        // Цвета для мышей
        this.colors = {
            body: '#8B4513',
            head: '#A0522D',
            ears: '#654321',
            eyes: 'black',
            tail: '#5D4037',
            feet: '#8B4513',
            preparingBody: '#9C6B3A' // Новый цвет для подготовки к прятанию
        };

        // Размеры частей тела мыши
        this.dimensions = {
            bodyWidth: 25,
            bodyHeight: 15,
            headRadius: 8,
            earRadius: 4,
            eyeRadius: 2,
            tailLength: 20,
            tailWidth: 3,
            footWidth: 4,
            footHeight: 3
        };
    }

    // Отрисовка тела мыши
    renderBody(ctx, x, y, rotation, color) {
        ctx.save();
        ctx.translate(x + this.dimensions.bodyWidth/2, y + this.dimensions.bodyHeight/2);
        ctx.rotate(rotation);
        ctx.fillStyle = color || this.colors.body;

        // Тело - овал
        ctx.beginPath();
        ctx.ellipse(0, 0, this.dimensions.bodyWidth/2, this.dimensions.bodyHeight/2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // Отрисовка головы мыши
    renderHead(ctx, x, y, rotation) {
        ctx.save();
        ctx.translate(x + this.dimensions.bodyWidth + 2, y + this.dimensions.bodyHeight/2);
        ctx.rotate(rotation);

        // Голова
        ctx.fillStyle = this.colors.head;
        ctx.beginPath();
        ctx.arc(0, 0, this.dimensions.headRadius, 0, Math.PI * 2);
        ctx.fill();

        // Уши
        ctx.fillStyle = this.colors.ears;
        ctx.beginPath();
        ctx.arc(-4, -6, this.dimensions.earRadius, 0, Math.PI * 2);
        ctx.arc(4, -6, this.dimensions.earRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // Отрисовка глаз мыши
    renderEyes(ctx, x, y, isScared) {
        ctx.save();
        ctx.translate(x + this.dimensions.bodyWidth + 2, y + this.dimensions.bodyHeight/2);

        // Глаза
        ctx.fillStyle = this.colors.eyes;

        if (isScared) {
            // Испуганные глаза (широко открытые)
            ctx.beginPath();
            ctx.arc(-3, -1, this.dimensions.eyeRadius * 1.5, 0, Math.PI * 2);
            ctx.arc(3, -1, this.dimensions.eyeRadius * 1.5, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Обычные глаза
            ctx.beginPath();
            ctx.arc(-3, -1, this.dimensions.eyeRadius, 0, Math.PI * 2);
            ctx.arc(3, -1, this.dimensions.eyeRadius, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    // Отрисовка хвоста мыши
    renderTail(ctx, x, y, tailCurve, tailWiggle) {
        ctx.save();
        ctx.translate(x - 5, y + this.dimensions.bodyHeight/2);

        ctx.strokeStyle = this.colors.tail;
        ctx.lineWidth = this.dimensions.tailWidth;
        ctx.lineCap = 'round';

        // Хвост с изгибом и покачиванием
        ctx.beginPath();
        ctx.moveTo(0, 0);

        for (let i = 0; i <= 10; i++) {
            const t = i / 10;
            const curveX = this.dimensions.tailLength * t;
            const curveY = Math.sin(tailCurve + t * Math.PI * 2 + tailWiggle) * 8;

            if (i === 0) {
                ctx.moveTo(curveX, curveY);
            } else {
                ctx.lineTo(curveX, curveY);
            }
        }

        ctx.stroke();
        ctx.restore();
    }

    // Отрисовка лап мыши
    renderFeet(ctx, x, y, walkOffset) {
        ctx.fillStyle = this.colors.feet;

        // Передние лапы
        const frontOffset = Math.sin(walkOffset) * 2;
        ctx.fillRect(x + 5, y + this.dimensions.bodyHeight - 2,
                    this.dimensions.footWidth, this.dimensions.footHeight + frontOffset);
        ctx.fillRect(x + 15, y + this.dimensions.bodyHeight - 2,
                    this.dimensions.footWidth, this.dimensions.footHeight - frontOffset);

        // Задние лапы
        const backOffset = Math.cos(walkOffset) * 2;
        ctx.fillRect(x - 3, y + this.dimensions.bodyHeight - 2,
                    this.dimensions.footWidth, this.dimensions.footHeight + backOffset);
        ctx.fillRect(x + 8, y + this.dimensions.bodyHeight - 2,
                    this.dimensions.footWidth, this.dimensions.footHeight - backOffset);
    }

    // Отрисовка усов мыши
    renderWhiskers(ctx, x, y, whiskerPhase) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 1;

        ctx.save();
        ctx.translate(x + this.dimensions.bodyWidth + 2, y + this.dimensions.bodyHeight/2);

        // Усы с анимацией
        for (let i = -1; i <= 1; i++) {
            const angle = i * 0.5 + Math.sin(whiskerPhase) * 0.1;
            const length = 10 + Math.cos(whiskerPhase + i) * 2;

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
            ctx.stroke();
        }

        ctx.restore();
    }

    // Метод для получения цвета в зависимости от состояния
    getBodyColor(state) {
        switch(state) {
            case 'scared': return '#CD5C5C'; // Красноватый при испуге
            case 'running': return '#A0522D'; // Темнее при беге
            case 'hiding': return '#696969'; // Серый при прятании
            case 'preparing_to_hide': return this.colors.preparingBody; // Новый цвет при подготовке
            default: return this.colors.body;
        }
    }
}