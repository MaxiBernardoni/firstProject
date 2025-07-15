// Quantum Escape - Juego de Puzzle Multidimensional
class QuantumEscape {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'menu'; // menu, playing, paused, levelComplete
        
        // Configuración del canvas
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        // Variables del juego
        this.currentLevel = 1;
        this.quantumEnergy = 100;
        this.maxQuantumEnergy = 100;
        this.clones = [];
        this.activeCloneIndex = 0;
        this.keys = {};
        this.particles = [];
        this.bgParticles = [];
        this.bgParallax = 0;
        this.animFrame = 0;
        
        // Configuración del jugador
        this.playerSize = 20;
        this.playerSpeed = 3;
        
        // Niveles del juego
        this.levels = this.createLevels();
        this.currentLevelData = this.levels[this.currentLevel - 1];
        
        // Inicializar
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.createParticles();
        this.createBackgroundParticles();
        this.loadProgress();
        this.gameLoop();
        this.playMusic();
    }
    
    setupEventListeners() {
        // Eventos del teclado
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.gameState === 'playing') {
                    this.createQuantumClone();
                }
            }
            
            if (e.code === 'KeyQ') {
                if (this.gameState === 'playing') {
                    this.switchClone();
                }
            }
            
            if (e.code === 'KeyE') {
                if (this.gameState === 'playing') {
                    this.teleportToClone();
                }
            }
            
            if (e.code === 'KeyR') {
                if (this.gameState === 'playing') {
                    this.resetLevel();
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Botón de inicio
        const startBtn = document.getElementById('startButton');
        if (startBtn) startBtn.addEventListener('click', () => { this.startGame(); });
        // Botón siguiente nivel
        const nextBtn = document.getElementById('nextLevel');
        if (nextBtn) nextBtn.addEventListener('click', () => { this.nextLevel(); });
        // Botón selección de nivel
        const openLevelBtn = document.getElementById('openLevelSelect');
        if (openLevelBtn) openLevelBtn.addEventListener('click', () => { this.showLevelSelect(); });
        const closeLevelBtn = document.getElementById('closeLevelSelect');
        if (closeLevelBtn) closeLevelBtn.addEventListener('click', () => { document.getElementById('levelSelect').style.display = 'none'; });
        // Botón tutorial
        const openTutBtn = document.getElementById('openTutorial');
        if (openTutBtn) openTutBtn.addEventListener('click', () => { document.getElementById('tutorialModal').style.display = 'flex'; });
        const closeTutBtn = document.getElementById('closeTutorial');
        if (closeTutBtn) closeTutBtn.addEventListener('click', () => { document.getElementById('tutorialModal').style.display = 'none'; });
    }
    
    createLevels() {
        return [
            // Nivel 1 - Tutorial básico
            {
                player: { x: 60, y: 540 },
                exit: { x: 720, y: 60 },
                walls: [
                    { x: 0, y: 580, width: 800, height: 20 }, // Suelo
                    { x: 0, y: 0, width: 20, height: 600 }, // Pared izquierda
                    { x: 780, y: 0, width: 20, height: 600 } // Pared derecha
                ],
                switches: [
                    { x: 400, y: 560, width: 30, height: 20, activated: false, required: 1, color: null }
                ],
                platforms: [
                    { x: 100, y: 480, width: 120, height: 15, color: '#00ffff' },
                    { x: 300, y: 400, width: 120, height: 15, color: '#00ffff' },
                    { x: 500, y: 320, width: 120, height: 15, color: '#00ffff' },
                    { x: 650, y: 200, width: 80, height: 15, color: '#00ffff' }
                ],
                portals: [
                    { x: 120, y: 470, width: 30, height: 30, target: { x: 700, y: 100 }, color: '#ff00ff' }
                ],
                enemies: [],
                description: "Aprende a saltar, crear clones y usar portales."
            },
            // Nivel 2 - Plataformas móviles y portales
            {
                player: { x: 60, y: 540 },
                exit: { x: 720, y: 60 },
                walls: [
                    { x: 0, y: 580, width: 800, height: 20 },
                    { x: 0, y: 0, width: 20, height: 600 },
                    { x: 780, y: 0, width: 20, height: 600 }
                ],
                switches: [
                    { x: 400, y: 560, width: 30, height: 20, activated: false, required: 1, color: null },
                    { x: 700, y: 80, width: 30, height: 20, activated: false, required: 1, color: null }
                ],
                platforms: [
                    { x: 100, y: 480, width: 120, height: 15, color: '#00ffff', moving: { axis: 'x', min: 100, max: 300, speed: 1.5 } },
                    { x: 300, y: 400, width: 120, height: 15, color: '#00ffff', moving: { axis: 'y', min: 300, max: 500, speed: 1.2 } },
                    { x: 500, y: 320, width: 120, height: 15, color: '#00ffff' },
                    { x: 650, y: 200, width: 80, height: 15, color: '#00ffff' }
                ],
                portals: [
                    { x: 120, y: 470, width: 30, height: 30, target: { x: 700, y: 100 }, color: '#ff00ff' },
                    { x: 700, y: 180, width: 30, height: 30, target: { x: 100, y: 500 }, color: '#00ffcc' }
                ],
                enemies: [
                    { x: 400, y: 560, width: 20, height: 20, vx: 2, vy: 0, color: '#ff3333', type: 'horizontal', range: [300, 500] }
                ],
                description: "Plataformas móviles, portales y enemigos."
            },
            // Nivel 3 - Interruptores y puertas
            {
                player: { x: 60, y: 540 },
                exit: { x: 720, y: 60 },
                walls: [
                    { x: 0, y: 580, width: 800, height: 20 },
                    { x: 0, y: 0, width: 20, height: 600 },
                    { x: 780, y: 0, width: 20, height: 600 },
                    { x: 400, y: 300, width: 20, height: 280, isDoor: true, open: false }
                ],
                switches: [
                    { x: 380, y: 560, width: 30, height: 20, activated: false, required: 1, color: null, opens: 3 }
                ],
                platforms: [
                    { x: 100, y: 480, width: 120, height: 15, color: '#00ffff' },
                    { x: 300, y: 400, width: 120, height: 15, color: '#00ffff' },
                    { x: 500, y: 320, width: 120, height: 15, color: '#00ffff' },
                    { x: 650, y: 200, width: 80, height: 15, color: '#00ffff' }
                ],
                portals: [
                    { x: 120, y: 470, width: 30, height: 30, target: { x: 700, y: 100 }, color: '#ff00ff' }
                ],
                enemies: [
                    { x: 400, y: 560, width: 20, height: 20, vx: 2, vy: 0, color: '#ff3333', type: 'horizontal', range: [300, 500] }
                ],
                description: "Activa interruptores para abrir puertas."
            },
            // Nivel 4 - Enemigos avanzados y zonas secretas
            {
                player: { x: 60, y: 540 },
                exit: { x: 720, y: 60 },
                walls: [
                    { x: 0, y: 580, width: 800, height: 20 },
                    { x: 0, y: 0, width: 20, height: 600 },
                    { x: 780, y: 0, width: 20, height: 600 }
                ],
                switches: [
                    { x: 400, y: 560, width: 30, height: 20, activated: false, required: 1, color: null }
                ],
                platforms: [
                    { x: 100, y: 480, width: 120, height: 15, color: '#00ffff' },
                    { x: 300, y: 400, width: 120, height: 15, color: '#00ffff' },
                    { x: 500, y: 320, width: 120, height: 15, color: '#00ffff' },
                    { x: 650, y: 200, width: 80, height: 15, color: '#00ffff' },
                    { x: 50, y: 100, width: 60, height: 15, color: '#ffcc00', secret: true }
                ],
                portals: [
                    { x: 120, y: 470, width: 30, height: 30, target: { x: 700, y: 100 }, color: '#ff00ff' },
                    { x: 700, y: 180, width: 30, height: 30, target: { x: 60, y: 120 }, color: '#00ffcc' }
                ],
                enemies: [
                    { x: 400, y: 560, width: 20, height: 20, vx: 2, vy: 0, color: '#ff3333', type: 'horizontal', range: [300, 500] },
                    { x: 600, y: 320, width: 20, height: 20, vx: 0, vy: 2, color: '#00ff00', type: 'vertical', range: [200, 500] },
                    { x: 200, y: 480, width: 20, height: 20, vx: 1.5, vy: 1.5, color: '#ff00ff', type: 'diagonal', range: [100, 700, 100, 500] }
                ],
                description: "Descubre zonas secretas y esquiva enemigos avanzados."
            }
            // Puedes seguir agregando más niveles con nuevas ideas...
        ];
    }
    
    startGame() {
        this.gameState = 'playing';
        document.getElementById('uiOverlay').style.display = 'none';
        document.getElementById('gameUI').style.display = 'block';
        this.loadLevel(this.currentLevel);
        this.startTimer();
    }
    
    loadLevel(levelNumber) {
        this.currentLevel = levelNumber;
        this.currentLevelData = this.levels[levelNumber - 1];
        
        // Reiniciar clones
        this.clones = [];
        this.activeCloneIndex = 0;
        this.quantumEnergy = this.maxQuantumEnergy;
        
        // Crear jugador principal
        this.player = {
            x: this.currentLevelData.player.x,
            y: this.currentLevelData.player.y,
            vx: 0,
            vy: 0,
            onGround: false,
            color: '#00ffff'
        };
        
        // Actualizar UI
        this.updateUI();
    }
    
    createQuantumClone() {
        if (this.quantumEnergy >= 30 && this.clones.length < 3) {
            const clone = {
                x: this.player.x,
                y: this.player.y,
                vx: 0,
                vy: 0,
                onGround: false,
                color: `hsl(${180 + this.clones.length * 60}, 100%, 70%)`,
                id: this.clones.length
            };
            
            this.clones.push(clone);
            this.quantumEnergy -= 30;
            this.updateUI();
            
            // Efecto visual
            this.createCloneEffect(clone.x, clone.y);
            this.playSFX('sfxClone');
        }
    }
    
    switchClone() {
        if (this.clones.length > 0) {
            this.activeCloneIndex = (this.activeCloneIndex + 1) % (this.clones.length + 1);
            this.updateUI();
        }
    }
    
    resetLevel() {
        this.loadLevel(this.currentLevel);
    }
    
    nextLevel() {
        if (this.currentLevel < this.levels.length) {
            this.loadLevel(this.currentLevel + 1);
            document.getElementById('levelComplete').style.display = 'none';
            this.saveProgress();
        } else {
            // Juego completado
            this.gameState = 'menu';
            document.getElementById('uiOverlay').style.display = 'flex';
            document.getElementById('gameUI').style.display = 'none';
        }
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        this.handleInput();
        this.updatePhysics();
        this.updateMovingPlatforms();
        this.updateEnemies();
        this.checkCollisions();
        this.checkLevelComplete();
        this.updateParticles();
    }
    
    handleInput() {
        const activeEntity = this.activeCloneIndex === 0 ? this.player : this.clones[this.activeCloneIndex - 1];
        
        // Movimiento horizontal
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
            activeEntity.vx = -this.playerSpeed;
        } else if (this.keys['KeyD'] || this.keys['ArrowRight']) {
            activeEntity.vx = this.playerSpeed;
        } else {
            activeEntity.vx *= 0.8; // Fricción
        }
        
        // Salto
        if ((this.keys['KeyW'] || this.keys['ArrowUp'] || this.keys['Space']) && activeEntity.onGround) {
            activeEntity.vy = -12;
            activeEntity.onGround = false;
        }
    }
    
    updatePhysics() {
        // Gravedad
        const entities = [this.player, ...this.clones];
        
        entities.forEach(entity => {
            if (!entity.onGround) {
                entity.vy += 0.6; // Gravedad
            }
            
            // Actualizar posición
            entity.x += entity.vx;
            entity.y += entity.vy;
            
            // Límites del canvas
            if (entity.x < 0) entity.x = 0;
            if (entity.x > this.canvas.width - this.playerSize) entity.x = this.canvas.width - this.playerSize;
            if (entity.y > this.canvas.height - this.playerSize) {
                entity.y = this.canvas.height - this.playerSize;
                entity.vy = 0;
                entity.onGround = true;
            }
        });
    }
    
    checkCollisions() {
        const entities = [this.player, ...this.clones];
        
        entities.forEach(entity => {
            // Colisión con paredes y puertas
            this.currentLevelData.walls.forEach((wall, idx) => {
                if (wall.isDoor && wall.open) return;
                if (this.checkCollision(entity, wall)) {
                    this.resolveCollision(entity, wall);
                }
            });
            
            // Colisión con plataformas (secretas con color especial)
            this.currentLevelData.platforms.forEach(platform => {
                if (this.checkCollision(entity, platform)) {
                    this.resolveCollision(entity, platform);
                }
            });
            
            // Colisión con interruptores que abren puertas
            this.currentLevelData.switches.forEach((switchObj, idx) => {
                // Si el interruptor tiene color, solo clones/jugador con ese color pueden activarlo
                if (this.checkCollision(entity, switchObj) && !switchObj.activated) {
                    if (!switchObj.color || this.colorsMatch(entity.color, switchObj.color)) {
                        switchObj.activated = true;
                        this.createSwitchEffect(switchObj.x + switchObj.width/2, switchObj.y + switchObj.height/2);
                        // Si el interruptor abre una puerta
                        if (typeof switchObj.opens === 'number') {
                            const door = this.currentLevelData.walls[switchObj.opens];
                            if (door && door.isDoor) door.open = true;
                        }
                    }
                }
            });
            // Colisión con portales
            if (this.currentLevelData.portals) {
                this.currentLevelData.portals.forEach(portal => {
                    if (this.checkCollision(entity, portal)) {
                        this.teleportThroughPortal(entity, portal);
                    }
                });
            }
            // Colisión con enemigos
            if (this.currentLevelData.enemies) {
                this.currentLevelData.enemies.forEach(enemy => {
                    if (this.checkCollision(entity, enemy)) {
                        this.onEnemyCollision(entity);
                    }
                });
            }
        });
        // FUSIÓN DE CLONES
        this.handleCloneFusion();
    }

    // FUSIÓN DE CLONES: si dos clones se tocan, se fusionan y recuperan energía
    handleCloneFusion() {
        for (let i = 0; i < this.clones.length; i++) {
            for (let j = i + 1; j < this.clones.length; j++) {
                if (this.checkCollision(this.clones[i], this.clones[j])) {
                    // Fusionar: eliminar uno y recuperar energía
                    this.quantumEnergy = Math.min(this.maxQuantumEnergy, this.quantumEnergy + 20);
                    this.createFusionEffect(this.clones[i].x, this.clones[i].y);
                    this.clones.splice(j, 1);
                    if (this.activeCloneIndex > j) this.activeCloneIndex--;
                    return; // Solo una fusión por frame
                }
            }
        }
    }
    
    checkCollision(entity, object) {
        return entity.x < object.x + object.width &&
               entity.x + this.playerSize > object.x &&
               entity.y < object.y + object.height &&
               entity.y + this.playerSize > object.y;
    }
    
    resolveCollision(entity, object) {
        const entityCenterX = entity.x + this.playerSize / 2;
        const entityCenterY = entity.y + this.playerSize / 2;
        const objectCenterX = object.x + object.width / 2;
        const objectCenterY = object.y + object.height / 2;
        
        const dx = entityCenterX - objectCenterX;
        const dy = entityCenterY - objectCenterY;
        
        const minX = (this.playerSize + object.width) / 2;
        const minY = (this.playerSize + object.height) / 2;
        
        if (Math.abs(dx) < minX && Math.abs(dy) < minY) {
            const overlapX = minX - Math.abs(dx);
            const overlapY = minY - Math.abs(dy);
            
            if (overlapX < overlapY) {
                if (dx > 0) {
                    entity.x = object.x + object.width;
                } else {
                    entity.x = object.x - this.playerSize;
                }
                entity.vx = 0;
            } else {
                if (dy > 0) {
                    entity.y = object.y + object.height;
                    entity.vy = 0;
                } else {
                    entity.y = object.y - this.playerSize;
                    entity.vy = 0;
                    entity.onGround = true;
                }
            }
        }
    }
    
    checkLevelComplete() {
        const activeEntity = this.activeCloneIndex === 0 ? this.player : this.clones[this.activeCloneIndex - 1];
        const exit = this.currentLevelData.exit;
        
        if (this.checkCollision(activeEntity, { x: exit.x, y: exit.y, width: 30, height: 30 })) {
            // Verificar que todos los interruptores estén activados
            const allSwitchesActivated = this.currentLevelData.switches.every(switchObj => switchObj.activated);
            
            if (allSwitchesActivated) {
                this.gameState = 'levelComplete';
                document.getElementById('levelComplete').style.display = 'flex';
            }
        }
    }
    
    render() {
        // Fondo animado con partículas y parallax
        this.renderBackground();
        // Mensaje de depuración en pantalla
        this.ctx.save();
        this.ctx.font = '16px monospace';
        this.ctx.fillStyle = '#ff00ff';
        if (this.gameState !== 'playing') {
            this.ctx.fillText('DEBUG: Estado actual = ' + this.gameState, 20, 40);
        }
        if (!this.player) {
            this.ctx.fillText('DEBUG: Jugador no inicializado', 20, 60);
        }
        if (!this.currentLevelData) {
            this.ctx.fillText('DEBUG: Nivel no cargado', 20, 80);
        }
        if (this.player && this.currentLevelData) {
            this.ctx.fillText('DEBUG: Jugador en (' + this.player.x + ',' + this.player.y + ')', 20, 100);
        }
        this.ctx.restore();
        if (this.gameState === 'playing') {
            this.renderLevel();
            this.renderEntities();
            this.renderParticles();
            this.renderUI();
        }
        this.animFrame++;
        // Depuración en consola
        if (this.animFrame % 60 === 0) {
            console.log('DEBUG:', {
                estado: this.gameState,
                nivel: this.currentLevel,
                player: this.player,
                clones: this.clones,
                levelData: this.currentLevelData
            });
        }
    }
    
    renderLevel() {
        // Renderizar paredes y puertas
        this.ctx.fillStyle = '#333';
        this.currentLevelData.walls.forEach((wall, idx) => {
            if (wall.isDoor && !wall.open) {
                this.ctx.fillStyle = '#ffcc00';
            } else if (wall.isDoor && wall.open) {
                return; // No dibujar puerta abierta
            } else {
                this.ctx.fillStyle = '#333';
            }
            this.ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
        });
        // Renderizar plataformas (secretas con color especial)
        this.currentLevelData.platforms.forEach(platform => {
            this.ctx.fillStyle = platform.secret ? '#ffcc00' : platform.color;
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        });
        
        // Renderizar interruptores
        this.currentLevelData.switches.forEach(switchObj => {
            this.ctx.fillStyle = switchObj.activated ? '#00ff00' : '#ff0000';
            this.ctx.fillRect(switchObj.x, switchObj.y, switchObj.width, switchObj.height);
            
            // Efecto de brillo
            if (switchObj.activated) {
                this.ctx.shadowColor = '#00ff00';
                this.ctx.shadowBlur = 10;
                this.ctx.fillRect(switchObj.x, switchObj.y, switchObj.width, switchObj.height);
                this.ctx.shadowBlur = 0;
            }
        });
        
        // Renderizar portales
        if (this.currentLevelData.portals) {
            this.currentLevelData.portals.forEach(portal => {
                this.ctx.save();
                this.ctx.globalAlpha = 0.8;
                this.ctx.beginPath();
                this.ctx.arc(portal.x + portal.width/2, portal.y + portal.height/2, portal.width/2, 0, 2 * Math.PI);
                this.ctx.fillStyle = portal.color || '#ff00ff';
                this.ctx.shadowColor = portal.color || '#ff00ff';
                this.ctx.shadowBlur = 20;
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
                this.ctx.restore();
            });
        }
        // Renderizar salida
        this.ctx.fillStyle = '#00ffff';
        this.ctx.fillRect(this.currentLevelData.exit.x, this.currentLevelData.exit.y, 30, 30);
        
        // Efecto de brillo en la salida
        this.ctx.shadowColor = '#00ffff';
        this.ctx.shadowBlur = 15;
        this.ctx.fillRect(this.currentLevelData.exit.x, this.currentLevelData.exit.y, 30, 30);
        this.ctx.shadowBlur = 0;
        // Renderizar enemigos
        if (this.currentLevelData.enemies) {
            this.currentLevelData.enemies.forEach(enemy => {
                this.ctx.save();
                this.ctx.globalAlpha = 0.9;
                this.ctx.beginPath();
                this.ctx.arc(enemy.x + enemy.width/2, enemy.y + enemy.height/2, enemy.width/2, 0, 2 * Math.PI);
                this.ctx.fillStyle = enemy.color;
                this.ctx.shadowColor = enemy.color;
                this.ctx.shadowBlur = 15;
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
                this.ctx.restore();
            });
        }
    }
    
    renderEntities() {
        // Renderizar jugador principal
        this.renderEntity(this.player, this.activeCloneIndex === 0);
        
        // Renderizar clones
        this.clones.forEach((clone, index) => {
            this.renderEntity(clone, this.activeCloneIndex === index + 1);
        });
    }
    
    renderEntity(entity, isActive) {
        // Animación de pulso y color
        const t = this.animFrame;
        const pulse = 1 + 0.1 * Math.sin(t/10 + entity.x/30);
        let color = entity.color;
        if (isActive) {
            // Cambia de color y brillo si está activo
            color = `hsl(${(t*2)%360}, 100%, 70%)`;
        }
        this.ctx.save();
        this.ctx.translate(entity.x + this.playerSize/2, entity.y + this.playerSize/2);
        this.ctx.scale(pulse, pulse);
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.playerSize/2, 0, 2 * Math.PI);
        this.ctx.fillStyle = color;
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = isActive ? 20 : 8;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        // Ojos animados
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(-5, -3, 2, 0, 2 * Math.PI);
        this.ctx.arc(5, -3, 2, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.restore();
        // Efecto de selección
        if (isActive) {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(entity.x + this.playerSize/2, entity.y + this.playerSize/2, this.playerSize/2 + 6 + 2*Math.sin(t/8), 0, 2 * Math.PI);
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 3 + 2*Math.abs(Math.sin(t/12));
            this.ctx.globalAlpha = 0.7;
            this.ctx.shadowColor = color;
            this.ctx.shadowBlur = 15;
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;
            this.ctx.globalAlpha = 1;
            this.ctx.restore();
        }
    }
    
    renderParticles() {
        this.particles.forEach(particle => {
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
        });
        this.ctx.globalAlpha = 1;
    }
    
    renderUI() {
        // Información del nivel
        this.ctx.fillStyle = '#00ffff';
        this.ctx.font = '16px Orbitron';
        this.ctx.fillText(`Nivel ${this.currentLevel}`, 10, 25);
        this.ctx.fillText(`Clones: ${this.clones.length}`, 10, 45);
        this.ctx.fillText(`Energía: ${this.quantumEnergy}%`, 10, 65);
        this.ctx.fillText(`Tiempo: ${this.getElapsedTime()}s`, 10, 85);
        // Logros básicos
        if (this.clones.length === 0 && this.currentLevel > 1) {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.fillText('Logro: Sin clones', 10, 105);
        }
    }
    
    updateUI() {
        document.getElementById('levelNumber').textContent = `Nivel ${this.currentLevel}`;
        document.getElementById('clonesCount').textContent = `Clones: ${this.clones.length}`;
        document.getElementById('quantumBar').style.width = `${(this.quantumEnergy / this.maxQuantumEnergy) * 100}%`;
    }
    
    createParticles() {
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 3 + 1,
                alpha: Math.random() * 0.5 + 0.1,
                color: `hsl(${180 + Math.random() * 60}, 100%, 70%)`
            });
        }
    }
    
    updateParticles() {
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
        });
    }
    
    createCloneEffect(x, y) {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: x + this.playerSize/2,
                y: y + this.playerSize/2,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                size: Math.random() * 4 + 2,
                alpha: 1,
                color: '#00ffff',
                life: 30
            });
        }
        this.playSFX('sfxClone');
    }
    
    createSwitchEffect(x, y) {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                size: Math.random() * 3 + 1,
                alpha: 1,
                color: '#00ff00',
                life: 20
            });
        }
    }
    
    // TELETRANSPORTE ENTRE CLONES
    teleportToClone() {
        if (this.clones.length > 0 && this.activeCloneIndex > 0) {
            // Intercambia la posición entre el jugador y el clon activo
            const clone = this.clones[this.activeCloneIndex - 1];
            const temp = { x: this.player.x, y: this.player.y };
            this.player.x = clone.x;
            this.player.y = clone.y;
            clone.x = temp.x;
            clone.y = temp.y;
            // Efecto visual
            this.createTeleportEffect(this.player.x, this.player.y);
            this.createTeleportEffect(clone.x, clone.y);
        }
    }
    
    // EFECTO VISUAL DE TELETRANSPORTE
    createTeleportEffect(x, y) {
        for (let i = 0; i < 25; i++) {
            this.particles.push({
                x: x + this.playerSize/2,
                y: y + this.playerSize/2,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12,
                size: Math.random() * 5 + 2,
                alpha: 1,
                color: '#ff00ff',
                life: 25
            });
        }
    }
    
    // EFECTO VISUAL DE FUSIÓN
    createFusionEffect(x, y) {
        for (let i = 0; i < 30; i++) {
            this.particles.push({
                x: x + this.playerSize/2,
                y: y + this.playerSize/2,
                vx: (Math.random() - 0.5) * 14,
                vy: (Math.random() - 0.5) * 14,
                size: Math.random() * 6 + 2,
                alpha: 1,
                color: '#ffff00',
                life: 30
            });
        }
    }
    
    // TELETRANSPORTE POR PORTAL
    teleportThroughPortal(entity, portal) {
        // Solo teletransportar si no está ya en el destino (evita bucle)
        if (!entity._justTeleported) {
            entity.x = portal.target.x;
            entity.y = portal.target.y;
            entity._justTeleported = true;
            this.createPortalEffect(entity.x, entity.y, portal.color);
            setTimeout(() => { entity._justTeleported = false; }, 300); // Pequeño cooldown
        }
    }
    // EFECTO VISUAL DE PORTAL
    createPortalEffect(x, y, color) {
        for (let i = 0; i < 35; i++) {
            this.particles.push({
                x: x + this.playerSize/2,
                y: y + this.playerSize/2,
                vx: (Math.random() - 0.5) * 16,
                vy: (Math.random() - 0.5) * 16,
                size: Math.random() * 7 + 2,
                alpha: 1,
                color: color || '#ff00ff',
                life: 35
            });
        }
        this.playSFX('sfxPortal');
    }
    
    createBackgroundParticles() {
        // Partículas de fondo para efecto parallax
        for (let i = 0; i < 80; i++) {
            this.bgParticles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                r: Math.random() * 2 + 1,
                speed: Math.random() * 0.5 + 0.2,
                color: `hsl(${180 + Math.random() * 60}, 100%, 60%)`,
                alpha: Math.random() * 0.3 + 0.1
            });
        }
    }

    renderBackground() {
        // Fondo degradado animado
        const grad = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        grad.addColorStop(0, '#0a0a0a');
        grad.addColorStop(0.5 + 0.2 * Math.sin(this.animFrame/120), '#1a1a2e');
        grad.addColorStop(1, '#16213e');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // Partículas de fondo con parallax
        this.bgParallax = Math.sin(this.animFrame/100) * 10;
        this.bgParticles.forEach(p => {
            this.ctx.globalAlpha = p.alpha;
            this.ctx.beginPath();
            this.ctx.arc(p.x + this.bgParallax, p.y, p.r, 0, 2 * Math.PI);
            this.ctx.fillStyle = p.color;
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
        // Animar partículas
        this.bgParticles.forEach(p => {
            p.x += p.speed;
            if (p.x > this.canvas.width + 20) p.x = -20;
        });
    }
    
    gameLoop() {
        this.update();
        this.render();
        
        // Limpiar partículas muertas
        this.particles = this.particles.filter(particle => {
            if (particle.life !== undefined) {
                particle.life--;
                particle.alpha = particle.life / 30;
                return particle.life > 0;
            }
            return true;
        });
        
        requestAnimationFrame(() => this.gameLoop());
    }

    // Comparar colores (tolerancia)
    colorsMatch(entityColor, switchColor) {
        // Si el color es hsl o hex, comparar solo el tono principal
        if (entityColor && switchColor) {
            return entityColor.slice(-6) === switchColor.slice(-6);
        }
        return false;
    }
    // Lógica al tocar un enemigo
    onEnemyCollision(entity) {
        // Si es el jugador, reinicia el nivel
        if (entity === this.player) {
            this.resetLevel();
        } else {
            // Si es un clon, lo elimina
            const idx = this.clones.indexOf(entity);
            if (idx !== -1) {
                this.createFusionEffect(entity.x, entity.y);
                this.clones.splice(idx, 1);
                if (this.activeCloneIndex > idx + 1) this.activeCloneIndex--;
            }
        }
        this.playSFX('sfxEnemy');
    }

    // Movimiento de enemigos
    updateEnemies() {
        if (!this.currentLevelData.enemies) return;
        this.currentLevelData.enemies.forEach(enemy => {
            if (enemy.type === 'horizontal') {
                enemy.x += enemy.vx;
                if (enemy.x < enemy.range[0] || enemy.x > enemy.range[1]) enemy.vx *= -1;
            } else if (enemy.type === 'vertical') {
                enemy.y += enemy.vy;
                if (enemy.y < enemy.range[0] || enemy.y > enemy.range[1]) enemy.vy *= -1;
            } else if (enemy.type === 'diagonal') {
                enemy.x += enemy.vx;
                enemy.y += enemy.vy;
                if (enemy.x < enemy.range[0] || enemy.x > enemy.range[1]) enemy.vx *= -1;
                if (enemy.y < enemy.range[2] || enemy.y > enemy.range[3]) enemy.vy *= -1;
            }
        });
    }

    // Actualizar plataformas móviles
    updateMovingPlatforms() {
        if (!this.currentLevelData.platforms) return;
        this.currentLevelData.platforms.forEach(platform => {
            if (platform.moving) {
                if (platform.moving.axis === 'x') {
                    platform.x += platform.moving.speed;
                    if (platform.x < platform.moving.min || platform.x > platform.moving.max) platform.moving.speed *= -1;
                } else if (platform.moving.axis === 'y') {
                    platform.y += platform.moving.speed;
                    if (platform.y < platform.moving.min || platform.y > platform.moving.max) platform.moving.speed *= -1;
                }
            }
        });
    }

    // Música y sonidos
    playMusic() {
        const music = document.getElementById('bgMusic');
        if (music) music.volume = 0.5;
        music && music.play();
    }
    playSFX(id) {
        const sfx = document.getElementById(id);
        if (sfx) { sfx.currentTime = 0; sfx.play(); }
    }

    // Selección de nivel
    showLevelSelect() {
        const modal = document.getElementById('levelSelect');
        const btns = document.getElementById('levelButtons');
        btns.innerHTML = '';
        for (let i = 1; i <= this.levels.length; i++) {
            const b = document.createElement('button');
            b.textContent = 'Nivel ' + i;
            b.className = 'glow-button';
            b.onclick = () => { this.loadLevel(i); modal.style.display = 'none'; };
            btns.appendChild(b);
        }
        modal.style.display = 'flex';
    }

    // Modo contrarreloj y logros
    startTimer() {
        this.startTime = Date.now();
    }
    getElapsedTime() {
        return ((Date.now() - this.startTime) / 1000).toFixed(2);
    }

    // Guardado de progreso
    saveProgress() {
        localStorage.setItem('qe_level', this.currentLevel);
    }
    loadProgress() {
        const lvl = localStorage.getItem('qe_level');
        if (lvl) this.currentLevel = parseInt(lvl);
    }
}

// Captura global de errores para mostrar en el canvas
window.onerror = function(message, source, lineno, colno, error) {
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.save();
        ctx.fillStyle = '#ff3333';
        ctx.font = '18px monospace';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillText('ERROR JS:', 20, 40);
        ctx.fillText(message, 20, 70);
        ctx.fillText('Linea: ' + lineno + ', Col: ' + colno, 20, 100);
        ctx.restore();
    }
    console.error('ERROR JS:', message, source, lineno, colno, error);
};

// Inicializar el juego cuando se cargue la página
document.addEventListener('DOMContentLoaded', () => {
    const game = new QuantumEscape();
    // Iniciar automáticamente el juego
    game.gameState = 'playing';
    document.getElementById('uiOverlay').style.display = 'none';
    document.getElementById('gameUI').style.display = 'block';
    game.loadLevel(game.currentLevel);
    game.startTimer();
}); 