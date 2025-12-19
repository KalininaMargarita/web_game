class TreesBackground {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.trees = [];
        this.time = 0;
        this.initTrees();
    }

    initTrees() {
        const treeTypes = [
            { type: 'spruce', height: 120, width: 60, layers: 4 },
            { type: 'spruce', height: 100, width: 50, layers: 3 },
            { type: 'deciduous', height: 150, width: 80, branches: 5 },
            { type: 'deciduous', height: 120, width: 70, branches: 4 },
            { type: 'pine', height: 180, width: 40, layers: 6 }
        ];

        for (let i = 0; i < 25; i++) {
            const groundY = this.canvasHeight - GROUND.HEIGHT;
            const treeType = treeTypes[Math.floor(Math.random() * treeTypes.length)];
            const scale = 0.7 + Math.random() * 0.6;
            const x = Math.random() * this.canvasWidth * 2;
            const layer = Math.floor(Math.random() * 3);
            const speed = 0.5 + layer * 0.3;

            this.trees.push({
                x: x,
                y: groundY - treeType.height * scale,
                width: treeType.width * scale,
                height: treeType.height * scale,
                type: treeType.type,
                scale: scale,
                layer: layer,
                speed: speed,
                details: this.createTreeDetails(treeType, scale)
            });
        }

        this.trees.sort((a, b) => a.layer - b.layer);
    }

    createTreeDetails(treeType, scale) {
        const details = {
            trunkHeight: treeType.height * 0.2 * scale,
            trunkWidth: treeType.width * 0.15 * scale,
            branches: [],
            needles: [],
            leaves: []
        };

        if (treeType.type === 'spruce' || treeType.type === 'pine') {
            const layerCount = treeType.layers;
            const layerHeight = (treeType.height * scale - details.trunkHeight) / layerCount;

            for (let i = 0; i < layerCount; i++) {
                const y = details.trunkHeight + i * layerHeight;
                const width = treeType.width * scale * (1 - i * 0.2);
                const height = layerHeight * 0.8;

                details.branches.push({
                    y: y,
                    width: width,
                    height: height,
                    layer: i
                });

                const needleCount = 80 + Math.floor(Math.random() * 40);
                for (let j = 0; j < needleCount; j++) {
                    const angle = (Math.random() - 0.5) * Math.PI * 0.5;
                    const length = 3 + Math.random() * 5;
                    const offsetX = (Math.random() - 0.5) * width * 0.8;
                    const offsetY = y + (Math.random() - 0.5) * height;

                    details.needles.push({
                        x: offsetX,
                        y: offsetY,
                        angle: angle,
                        length: length,
                        width: 0.5 + Math.random() * 0.5
                    });
                }
            }
        } else if (treeType.type === 'deciduous') {
            const branchCount = treeType.branches;

            for (let i = 0; i < branchCount; i++) {
                const angle = -Math.PI/2 + (i/(branchCount-1) - 0.5) * Math.PI/2;
                const length = treeType.height * scale * (0.3 + Math.random() * 0.2);

                details.branches.push({
                    angle: angle,
                    length: length,
                    width: 3 + Math.random() * 2,
                    subBranches: Math.floor(2 + Math.random() * 3)
                });
            }

            const leafCount = 200 + Math.floor(Math.random() * 100);
            for (let i = 0; i < leafCount; i++) {
                const onBranch = Math.random() > 0.3;
                let x, y;

                if (onBranch && details.branches.length > 0) {
                    const branch = details.branches[Math.floor(Math.random() * details.branches.length)];
                    const distance = Math.random() * branch.length;
                    x = Math.cos(branch.angle) * distance;
                    y = details.trunkHeight + Math.sin(branch.angle) * distance;
                } else {
                    x = (Math.random() - 0.5) * treeType.width * scale * 0.8;
                    y = details.trunkHeight + Math.random() * (treeType.height * scale - details.trunkHeight);
                }

                const size = 2 + Math.random() * 4;
                const rotation = Math.random() * Math.PI * 2;
                const type = Math.random() > 0.5 ? 'round' : 'pointed';

                details.leaves.push({
                    x: x,
                    y: y,
                    size: size,
                    rotation: rotation,
                    type: type,
                    windEffect: Math.random() * 0.1
                });
            }
        }

        return details;
    }

    update(deltaTime) {
        this.time += deltaTime;
        this.trees.forEach(tree => {
            tree.x -= tree.speed;

            if (tree.x < -tree.width * 2) {
                tree.x = this.canvasWidth + tree.width * 2;

                if (Math.random() < 0.3) {
                    const groundY = this.canvasHeight - GROUND.HEIGHT;
                    const newScale = 0.7 + Math.random() * 0.6;
                    tree.y = groundY - tree.height * newScale / tree.scale;
                    tree.scale = newScale;
                    tree.details = this.createTreeDetails(
                        { type: tree.type, height: tree.height/tree.scale, width: tree.width/tree.scale,
                          layers: tree.type === 'pine' ? 6 : tree.type === 'spruce' ? 4 : 5, branches: 5 },
                        newScale
                    );
                }
            }
        });
    }

    render(ctx) {
        this.trees.forEach(tree => {
            ctx.save();

            const alpha = tree.layer === 0 ? 0.6 : tree.layer === 1 ? 0.8 : 1.0;
            ctx.globalAlpha = alpha;

            const treeX = tree.x;
            const treeY = tree.y;
            const trunkBottom = treeY + tree.height;

            // Ствол
            ctx.fillStyle = '#2c1810';
            ctx.fillRect(
                treeX - tree.details.trunkWidth / 2,
                trunkBottom - tree.details.trunkHeight,
                tree.details.trunkWidth,
                tree.details.trunkHeight
            );

            // Текстура ствола
            ctx.strokeStyle = '#1a0f0a';
            ctx.lineWidth = 1;
            for (let i = 0; i < 5; i++) {
                const y = trunkBottom - tree.details.trunkHeight + i * (tree.details.trunkHeight / 5);
                ctx.beginPath();
                ctx.moveTo(treeX - tree.details.trunkWidth / 2, y);
                ctx.lineTo(treeX + tree.details.trunkWidth / 2, y);
                ctx.stroke();
            }

            if (tree.type === 'spruce' || tree.type === 'pine') {
                this.renderConiferousTree(ctx, tree);
            } else if (tree.type === 'deciduous') {
                this.renderDeciduousTree(ctx, tree);
            }

            ctx.restore();
        });
    }

    renderConiferousTree(ctx, tree) {
        const treeX = tree.x;
        const treeY = tree.y;

        tree.details.branches.forEach(branch => {
            const y = treeY + branch.y;
            const branchWidth = branch.width;
            const branchHeight = branch.height;

            ctx.fillStyle = '#1e3d1e';
            ctx.beginPath();
            ctx.moveTo(treeX - branchWidth / 2, y);
            ctx.lineTo(treeX, y - branchHeight);
            ctx.lineTo(treeX + branchWidth / 2, y);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = '#143214';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.save();
            tree.details.needles
                .filter(needle => Math.abs(needle.y - y) < branchHeight / 2)
                .forEach(needle => {
                    const needleX = treeX + needle.x;
                    const needleY = treeY + needle.y;

                    ctx.strokeStyle = '#2d5a2d';
                    ctx.lineWidth = needle.width;
                    ctx.lineCap = 'round';

                    ctx.beginPath();
                    ctx.moveTo(needleX, needleY);
                    ctx.lineTo(
                        needleX + Math.cos(needle.angle) * needle.length,
                        needleY + Math.sin(needle.angle) * needle.length
                    );
                    ctx.stroke();
                });
            ctx.restore();
        });
    }

    renderDeciduousTree(ctx, tree) {
        const treeX = tree.x;
        const treeY = tree.y;

        ctx.strokeStyle = '#2c1810';
        ctx.lineWidth = tree.details.trunkWidth * 0.8;
        ctx.lineCap = 'round';

        tree.details.branches.forEach(branch => {
            ctx.beginPath();
            ctx.moveTo(treeX, treeY + tree.details.trunkHeight);
            ctx.lineTo(
                treeX + Math.cos(branch.angle) * branch.length,
                treeY + tree.details.trunkHeight + Math.sin(branch.angle) * branch.length
            );
            ctx.stroke();

            for (let i = 0; i < branch.subBranches; i++) {
                const subAngle = branch.angle + (Math.random() - 0.5) * Math.PI / 3;
                const subLength = branch.length * (0.3 + Math.random() * 0.3);

                ctx.beginPath();
                ctx.moveTo(
                    treeX + Math.cos(branch.angle) * branch.length * (0.3 + i * 0.2),
                    treeY + tree.details.trunkHeight + Math.sin(branch.angle) * branch.length * (0.3 + i * 0.2)
                );
                ctx.lineTo(
                    treeX + Math.cos(branch.angle) * branch.length * (0.3 + i * 0.2) + Math.cos(subAngle) * subLength,
                    treeY + tree.details.trunkHeight + Math.sin(branch.angle) * branch.length * (0.3 + i * 0.2) + Math.sin(subAngle) * subLength
                );
                ctx.stroke();
            }
        });

        ctx.fillStyle = '#2d5a2d';
        tree.details.leaves.forEach(leaf => {
            const leafX = treeX + leaf.x + Math.sin(this.time * 0.001 + leaf.windEffect) * 2;
            const leafY = treeY + leaf.y;

            ctx.save();
            ctx.translate(leafX, leafY);
            ctx.rotate(leaf.rotation + Math.sin(this.time * 0.002 + leaf.windEffect) * 0.1);

            if (leaf.type === 'round') {
                ctx.beginPath();
                ctx.ellipse(0, 0, leaf.size, leaf.size * 0.8, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = '#1e3d1e';
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(0, -leaf.size * 0.8);
                ctx.lineTo(0, leaf.size * 0.8);
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.moveTo(0, -leaf.size);
                ctx.lineTo(leaf.size * 0.8, 0);
                ctx.lineTo(0, leaf.size);
                ctx.lineTo(-leaf.size * 0.8, 0);
                ctx.closePath();
                ctx.fill();

                ctx.strokeStyle = '#1e3d1e';
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(0, -leaf.size);
                ctx.lineTo(0, leaf.size);
                ctx.stroke();
            }

            ctx.restore();
        });
    }

    reset() {
        this.trees = [];
        this.initTrees();
    }
}