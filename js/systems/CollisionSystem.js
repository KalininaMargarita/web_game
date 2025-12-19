class CollisionSystem {
    constructor() {
        // Базовая система коллизий
    }

    // Проверка AABB коллизии
    checkAABBCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }

    // Проверка столкновений с врагами
    checkEnemyCollisions(player, enemies) {
        if (!enemies || enemies.length === 0) return null;

        for (let i = 0; i < enemies.length; i++) {
            if (this.checkAABBCollision(player, enemies[i])) {
                return { type: 'enemy', object: enemies[i], index: i };
            }
        }

        return null;
    }

    // Проверка столкновений с собираемыми предметами
    checkCollectibleCollisions(player, collectibles) {
        if (!collectibles || collectibles.length === 0) return [];

        const collisions = [];
        for (let i = collectibles.length - 1; i >= 0; i--) {
            if (this.checkAABBCollision(player, collectibles[i])) {
                collisions.push({ type: 'collectible', object: collectibles[i], index: i });
            }
        }

        return collisions;
    }

    // Проверка попадания точки в объект
    pointInObject(x, y, object) {
        return x >= object.x &&
               x <= object.x + object.width &&
               y >= object.y &&
               y <= object.y + object.height;
    }
}