class CloudsBackground {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.clouds = [];
        this.time = 0;
        this.initClouds();
    }

    initClouds() {
        const cloudTypes = [
            { layers: 3, minSize: 30, maxSize: 50, alpha: 0.4 },
            { layers: 4, minSize: 40, maxSize: 60, alpha: 0.6 },
            { layers: 5, minSize: 50, maxSize: 80, alpha: 0.8 }
        ];

        for (let i = 0; i < 15; i++) {
            const type = cloudTypes[Math.floor(Math.random() * cloudTypes.length)];
            const height = 50 + Math.random() * (this.canvasHeight * 0.4);
            const speed = 0.2 + Math.random() * 0.8;
            const scale = 0.8 + Math.random() * 0.4;

            this.clouds.push({
                x: Math.random() * this.canvasWidth * 1.5,
                y: height,
                scale: scale,
                speed: speed,
                type: type,
                layers: [],
                windEffect: Math.random() * 0.02
            });

            const cloud = this.clouds[this.clouds.length - 1];
            for (let j = 0; j < type.layers; j++) {
                cloud.layers.push({
                    offsetX: (Math.random() - 0.5) * 20,
                    offsetY: (Math.random() - 0.5) * 15,
                    size: type.minSize + Math.random() * (type.maxSize - type.minSize)
                });
            }
        }
    }

    update(deltaTime) {
        this.time += deltaTime;
        this.clouds.forEach(cloud => {
            cloud.x -= cloud.speed;
            cloud.y += Math.sin(this.time * 0.001 + cloud.x * 0.01) * cloud.windEffect;

            if (cloud.x < -200) {
                cloud.x = this.canvasWidth + 200;
                cloud.y = 50 + Math.random() * (this.canvasHeight * 0.4);

                // Обновляем слои облака
                cloud.layers.forEach(layer => {
                    layer.offsetX = (Math.random() - 0.5) * 20;
                    layer.offsetY = (Math.random() - 0.5) * 15;
                });
            }
        });
    }

    render(ctx) {
        this.clouds.forEach(cloud => {
            ctx.save();
            ctx.globalAlpha = cloud.type.alpha;
            ctx.fillStyle = 'rgba(30, 30, 50, 0.9)';

            cloud.layers.forEach((layer, index) => {
                const x = cloud.x + layer.offsetX;
                const y = cloud.y + layer.offsetY + index * 3;
                const size = layer.size * cloud.scale;

                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.arc(x + size * 0.7, y - size * 0.3, size * 0.8, 0, Math.PI * 2);
                ctx.arc(x + size * 1.4, y, size * 0.9, 0, Math.PI * 2);
                ctx.arc(x - size * 0.5, y + size * 0.4, size * 0.7, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.restore();
        });
    }

    reset() {
        this.clouds = [];
        this.initClouds();
    }
}