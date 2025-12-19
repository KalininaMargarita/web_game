// Класс управления анимацией совы
class OwlAnimation {
    constructor() {
        // Состояния анимации
        this.wingFrame = 0;
        this.wingCycleTimer = 0;
        this.walkFrame = 0;
        this.walkTimer = 0;
        this.walkCycle = [0, 1, 2, 1];
        this.wingCycle = [0, 1, 2, 3, 2, 1];

        // Параметры взмаха
        this.flapPhase = 0;
        this.flapTimer = 0;

        // Константы анимации
        this.ANIMATION = {
            WALK_FRAME_DURATION: 200,
            FLAP_FRAME_DURATION: 50
        };
    }

    updateWingAnimation(deltaTime, flightState) {
        if (flightState.isFlapping) {
            this.wingCycleTimer += deltaTime;
            const frameTime = flightState.isDiving ?
                this.ANIMATION.FLAP_FRAME_DURATION * 0.7 :
                this.ANIMATION.FLAP_FRAME_DURATION;

            if (this.wingCycleTimer >= frameTime) {
                this.wingCycleTimer = 0;
                this.wingFrame = (this.wingFrame + 1) % this.wingCycle.length;
            }

            // Обновление фазы взмаха для физики
            this.flapTimer += deltaTime;
            this.flapPhase = (this.flapTimer * 5 * 2 * Math.PI / 1000) % (2 * Math.PI);

        } else if (flightState.isGliding || flightState.isDiving) {
            // Медленная анимация при планировании/пикировании
            this.wingCycleTimer += deltaTime;
            if (this.wingCycleTimer >= this.ANIMATION.FLAP_FRAME_DURATION * 3) {
                this.wingCycleTimer = 0;
                this.wingFrame = (this.wingFrame + 1) % 2;
            }
            this.flapPhase = 0;

        } else {
            this.wingFrame = 0;
            this.flapPhase = 0;
        }

        return {
            wingFrame: this.wingFrame,
            wingPhase: this.wingCycle[this.wingFrame] / 3,
            flapPhase: this.flapPhase
        };
    }

    updateWalkAnimation(deltaTime, isOnGround, velocityY) {
        if (isOnGround && Math.abs(velocityY) < 0.1) {
            this.walkTimer += deltaTime;
            if (this.walkTimer >= this.ANIMATION.WALK_FRAME_DURATION) {
                this.walkTimer = 0;
                this.walkFrame = (this.walkFrame + 1) % this.walkCycle.length;
            }
        } else {
            this.walkTimer = 0;
            this.walkFrame = 0;
        }

        return {
            walkFrame: this.walkFrame,
            walkOffset: this.walkCycle[this.walkFrame] * 2,
            bodyBob: isOnGround ? Math.sin(Date.now() * 0.01 + this.walkFrame) * 3 : 0
        };
    }

    getWingParams(flightState, wingPhase, flapPhase, airspeed, maxAirspeed) {
        if (flightState.isFlapping) {
            // Параметры для взмаха
            const flapHeight = 15 + Math.sin(flapPhase) * 20;
            const flapWidth = 20 + Math.abs(Math.sin(flapPhase)) * 15;
            const wingRotation = Math.sin(flapPhase) * 0.8;

            return {
                type: 'flapping',
                width: flapWidth,
                height: flapHeight,
                rotationLeft: -0.3 - wingRotation,
                rotationRight: 0.3 + wingRotation
            };

        } else if (flightState.isDiving) {
            // Параметры для пикирования
            return {
                type: 'diving'
            };

        } else if (flightState.isGliding) {
            // Параметры для планирования
            const glideSpread = 0.8 + (airspeed / maxAirspeed) * 0.4;
            const wingFlex = Math.sin(Date.now() * 0.005) * 0.05;

            return {
                type: 'gliding',
                widthLeft: 25 * glideSpread,
                widthRight: 25 * glideSpread,
                rotationLeft: (-0.1 + wingFlex) * glideSpread,
                rotationRight: (0.1 - wingFlex) * glideSpread
            };

        } else if (flightState.isOnGround) {
            // Параметры для положения на земле
            return {
                type: 'ground'
            };
        }

        // По умолчанию
        return {
            type: 'ground'
        };
    }

    getEyeParams(flightState, velocityY) {
        let pupilOffset = 0;
        if (flightState.isDiving) {
            pupilOffset = 3;
        } else if (flightState.isFlapping) {
            pupilOffset = -2;
        }

        return {
            tilt: velocityY * 0.02,
            pupilOffset: pupilOffset
        };
    }

    reset() {
        this.wingFrame = 0;
        this.wingCycleTimer = 0;
        this.walkFrame = 0;
        this.walkTimer = 0;
        this.flapPhase = 0;
        this.flapTimer = 0;
    }
}