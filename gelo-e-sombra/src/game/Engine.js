export default class Engine {
    constructor(canvas, setUIState) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.setUIState = setUIState;
        this.width = canvas.width;
        this.height = canvas.height;
        this.lastTime = performance.now();
        this.keys = {};

        // Camera offset
        this.cam = { x: 0, y: 0 };

        // Game State
        this.player = { x: 0, y: 0, speed: 180, hp: 100, warmth: 100, inv: { wood: 5, stone: 0, food: 0 } };
        this.hearth = { x: 0, y: 0, fuel: 100, radius: 200 };
        this.workers = [];
        this.enemies = [];
        this.resources = [];
        
        this.dayTime = 0; // 0 to 60 (seconds)
        this.dayCount = 1;
        this.isNight = false;
        this.gameOver = false;
        
        this.msg = "";
        this.msgTimer = 0;

        this.generateWorld();

        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);

        this.loop = this.loop.bind(this);
        this.reqId = requestAnimationFrame(this.loop);
    }

    cleanup() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        cancelAnimationFrame(this.reqId);
    }

    handleKeyDown = (e) => {
        const key = e.key.toLowerCase();
        this.keys[key] = true;
        
        if (key === 'e') this.interact();
        if (key === 'f') this.fuelHearth();
        if (key === 'b') this.buildWorker();
    }
    handleKeyUp = (e) => {
        this.keys[e.key.toLowerCase()] = false;
    }

    generateWorld() {
        for(let i = 0; i < 400; i++) {
            let x = (Math.random() - 0.5) * 4000;
            let y = (Math.random() - 0.5) * 4000;
            
            // Clear space around hearth
            if (Math.abs(x) < 150 && Math.abs(y) < 150) continue;
            
            let r = Math.random();
            let type = r < 0.5 ? 'tree' : (r < 0.8 ? 'rock' : 'bush');
            this.resources.push({x, y, type, active: true});
        }
    }

    interact() {
        let nearest = null;
        let minDist = 50;
        this.resources.forEach(r => {
            if(!r.active) return;
            let d = Math.hypot(this.player.x - r.x, this.player.y - r.y);
            if (d < minDist) { minDist = d; nearest = r; }
        });
        
        if(nearest) {
            nearest.active = false;
            if(nearest.type === 'tree') this.player.inv.wood += Math.floor(Math.random()*3) + 2;
            if(nearest.type === 'rock') this.player.inv.stone += Math.floor(Math.random()*2) + 1;
            if(nearest.type === 'bush') this.player.inv.food += Math.floor(Math.random()*4) + 2;
            this.showMsg("+ Recurso Coletado!");
        }
    }

    fuelHearth() {
        let dist = Math.hypot(this.player.x - this.hearth.x, this.player.y - this.hearth.y);
        if (dist < 80) {
            if (this.player.inv.wood > 0) {
                this.player.inv.wood--;
                this.hearth.fuel += 20;
                if (this.hearth.fuel > 150) this.hearth.fuel = 150;
                this.showMsg("Fogueira Alimentada!");
            } else {
                this.showMsg("Sem Madeira!");
            }
        }
    }

    buildWorker() {
        let dist = Math.hypot(this.player.x - this.hearth.x, this.player.y - this.hearth.y);
        if (dist < 80) {
            if (this.player.inv.wood >= 10 && this.player.inv.food >= 10) {
                this.player.inv.wood -= 10;
                this.player.inv.food -= 10;
                this.workers.push({x: this.hearth.x, y: this.hearth.y, timer: 0});
                this.showMsg("Trabalhador Contratado!");
            } else {
                this.showMsg("Faltam Recursos (10 Mad, 10 Com)!");
            }
        }
    }

    showMsg(text) {
        this.msg = text;
        this.msgTimer = 2.0;
    }

    update(dt) {
        // Time & Day cycle (60 seconds per day)
        this.dayTime += dt;
        if (this.dayTime >= 60) {
            this.dayTime = 0;
            this.dayCount++;
            
            // Respawn some resources each day
            this.resources.forEach(r => {
                if(!r.active && Math.random() < 0.2) r.active = true; 
            });
        }
        this.isNight = this.dayTime > 30;

        // Player movement
        let dx = 0, dy = 0;
        if (this.keys['w'] || this.keys['arrowup']) dy -= 1;
        if (this.keys['s'] || this.keys['arrowdown']) dy += 1;
        if (this.keys['a'] || this.keys['arrowleft']) dx -= 1;
        if (this.keys['d'] || this.keys['arrowright']) dx += 1;
        
        let len = Math.hypot(dx, dy);
        if (len > 0) {
            this.player.x += (dx/len) * this.player.speed * dt;
            this.player.y += (dy/len) * this.player.speed * dt;
        }

        // Hearth logic
        if (this.hearth.fuel > 0) {
            this.hearth.fuel -= dt * (this.isNight ? 1.5 : 0.8);
            if (this.hearth.fuel < 0) this.hearth.fuel = 0;
        }

        // Warmth & HP logic
        let distToHearth = Math.hypot(this.player.x - this.hearth.x, this.player.y - this.hearth.y);
        let inWarmth = distToHearth < this.hearth.radius && this.hearth.fuel > 0;

        if (inWarmth) {
            this.player.warmth += 15 * dt;
            if (this.player.warmth > 100) this.player.warmth = 100;
        } else {
            this.player.warmth -= (this.isNight ? 6 : 2) * dt;
        }

        if (this.player.warmth <= 0) {
            this.player.warmth = 0;
            this.player.hp -= 3 * dt; // Freeze to death
        }
        
        if (this.player.hp <= 0 && !this.gameOver) {
            this.gameOver = true;
            this.setUIState('GAMEOVER');
        }

        // Enemy logic (Shadows)
        if (this.isNight && Math.random() < (0.01 + this.dayCount*0.005)) {
            // Spawn far from player
            let ex = this.player.x + (Math.random() > 0.5 ? 1 : -1) * (800 + Math.random() * 400);
            let ey = this.player.y + (Math.random() > 0.5 ? 1 : -1) * (800 + Math.random() * 400);
            this.enemies.push({x: ex, y: ey, hp: 100});
        }
        
        for(let i = this.enemies.length - 1; i >= 0; i--) {
            let e = this.enemies[i];
            let edx = this.player.x - e.x;
            let edy = this.player.y - e.y;
            let elen = Math.hypot(edx, edy);
            
            // Move toward player
            e.x += (edx/elen) * (90 + this.dayCount*5) * dt;
            e.y += (edy/elen) * (90 + this.dayCount*5) * dt;

            // Attack player
            if (elen < 25) {
                this.player.hp -= 20;
                this.enemies.splice(i, 1);
                continue;
            }
            
            // Burned by hearth light
            let eHearthDist = Math.hypot(e.x - this.hearth.x, e.y - this.hearth.y);
            if (eHearthDist < this.hearth.radius && this.hearth.fuel > 0) {
                this.enemies.splice(i, 1);
            }
        }

        // Workers logic
        this.workers.forEach(w => {
            w.timer -= dt;
            if(w.timer <= 0) {
                w.timer = 2 + Math.random() * 3;
                w.tx = this.hearth.x + (Math.random()-0.5)*400;
                w.ty = this.hearth.y + (Math.random()-0.5)*400;
                
                // Gather passive resources for city
                let r = Math.random();
                if(r < 0.4) this.player.inv.wood++;
                else if(r < 0.7) this.player.inv.food++;
            }
            let wdx = w.tx - w.x;
            let wdy = w.ty - w.y;
            let wlen = Math.hypot(wdx, wdy);
            if(wlen > 5) {
                w.x += (wdx/wlen) * 60 * dt;
                w.y += (wdy/wlen) * 60 * dt;
            }
        });
    }

    draw() {
        const { ctx, width, height } = this;
        
        // Background
        ctx.fillStyle = this.isNight ? '#0b1320' : '#b2c8d6';
        ctx.fillRect(0, 0, width, height);

        // Camera Math
        this.cam.x = this.player.x - width/2;
        this.cam.y = this.player.y - height/2;

        ctx.save();
        ctx.translate(-this.cam.x, -this.cam.y);

        // Draw Hearth Warmth Radius
        if (this.hearth.fuel > 0) {
            ctx.beginPath();
            ctx.arc(this.hearth.x, this.hearth.y, this.hearth.radius, 0, Math.PI*2);
            let intensity = (this.hearth.fuel / 150);
            ctx.fillStyle = this.isNight ? `rgba(255, 100, 0, ${0.15 * intensity})` : `rgba(255, 150, 0, ${0.08 * intensity})`;
            ctx.fill();
        }

        // Draw Resources
        this.resources.forEach(r => {
            if(!r.active) return;
            // Draw simple pixel shapes
            if(r.type === 'tree') {
                ctx.fillStyle = '#4a3320'; // trunk
                ctx.fillRect(r.x - 4, r.y, 8, 12);
                ctx.fillStyle = this.isNight ? '#16301b' : '#2d5a27'; // leaves
                ctx.fillRect(r.x - 12, r.y - 16, 24, 20);
            }
            if(r.type === 'rock') {
                ctx.fillStyle = this.isNight ? '#444' : '#7a7a7a';
                ctx.fillRect(r.x - 10, r.y - 10, 20, 20);
                ctx.fillStyle = this.isNight ? '#222' : '#555';
                ctx.fillRect(r.x - 4, r.y - 4, 14, 14); // detail
            }
            if(r.type === 'bush') {
                ctx.fillStyle = this.isNight ? '#1f3822' : '#3c6e42';
                ctx.fillRect(r.x - 10, r.y - 10, 20, 20);
                ctx.fillStyle = '#d43343'; // berries
                ctx.fillRect(r.x - 6, r.y - 6, 4, 4);
                ctx.fillRect(r.x + 2, r.y, 4, 4);
            }
        });

        // Draw Hearth
        ctx.fillStyle = '#333';
        ctx.fillRect(this.hearth.x - 24, this.hearth.y - 24, 48, 48); // base
        if (this.hearth.fuel > 0) {
            // Flickering fire
            ctx.fillStyle = Math.random() > 0.5 ? '#ffcc00' : '#ff5500';
            ctx.fillRect(this.hearth.x - 16, this.hearth.y - 16, 32, 32);
        }

        // Draw Workers
        this.workers.forEach(w => {
            ctx.fillStyle = '#f0c040';
            ctx.fillRect(w.x - 8, w.y - 8, 16, 16);
            ctx.fillStyle = '#333'; // eyes
            ctx.fillRect(w.x - 4, w.y - 4, 2, 2);
            ctx.fillRect(w.x + 2, w.y - 4, 2, 2);
        });

        // Draw Enemies (Shadows)
        this.enemies.forEach(e => {
            ctx.fillStyle = '#110022';
            ctx.fillRect(e.x - 12, e.y - 12, 24, 24);
            ctx.fillStyle = '#ff0033'; // red eyes
            ctx.fillRect(e.x - 6, e.y - 4, 4, 4);
            ctx.fillRect(e.x + 2, e.y - 4, 4, 4);
        });

        // Draw Player
        ctx.fillStyle = '#2b7bc4';
        ctx.fillRect(this.player.x - 10, this.player.y - 10, 20, 20);
        ctx.fillStyle = '#fff'; // face direction indicator
        ctx.fillRect(this.player.x - 6, this.player.y - 6, 4, 4);
        ctx.fillRect(this.player.x + 2, this.player.y - 6, 4, 4);

        ctx.restore();

        // ------------------ HUD ------------------
        ctx.font = '12px "Press Start 2P", monospace';
        
        // Top Left: Stats
        ctx.textAlign = 'left';
        ctx.fillStyle = this.player.hp < 30 ? 'red' : 'white';
        ctx.fillText(`VIDA: ${Math.floor(this.player.hp)}`, 20, 30);
        
        ctx.fillStyle = this.player.warmth < 30 ? '#42b6f5' : 'white';
        ctx.fillText(`CALOR: ${Math.floor(this.player.warmth)}%`, 20, 60);

        // Top Right: Inventory
        ctx.textAlign = 'right';
        ctx.fillStyle = 'white';
        ctx.fillText(`MADEIRA: ${this.player.inv.wood}`, width - 20, 30);
        ctx.fillText(`PEDRA: ${this.player.inv.stone}`, width - 20, 60);
        ctx.fillText(`COMIDA: ${this.player.inv.food}`, width - 20, 90);

        // Top Center: Day/Time
        ctx.textAlign = 'center';
        ctx.fillStyle = this.isNight ? '#88aadd' : '#ffcc00';
        ctx.fillText(`DIA ${this.dayCount} - ${this.isNight ? 'NOITE' : 'MANHÃ'}`, width/2, 30);
        
        ctx.fillStyle = this.hearth.fuel < 20 ? 'red' : '#ff9900';
        ctx.fillText(`FOGO DA CIDADE: ${Math.floor(this.hearth.fuel)}%`, width/2, 60);
        
        if (this.workers.length > 0) {
            ctx.fillStyle = '#f0c040';
            ctx.fillText(`TRABALHADORES: ${this.workers.length}`, width/2, 90);
        }

        // Bottom Prompts & Messages
        this.drawPrompts();
    }

    drawPrompts() {
        let prompts = [];
        
        // Hearth actions
        let distToHearth = Math.hypot(this.player.x - this.hearth.x, this.player.y - this.hearth.y);
        if (distToHearth < 80) {
            prompts.push("[F] Add Lenha");
            prompts.push("[B] Contratar Trabalhador");
        }

        // Gather actions
        let nearest = null;
        let minDist = 50;
        this.resources.forEach(r => {
            if(!r.active) return;
            let d = Math.hypot(this.player.x - r.x, this.player.y - r.y);
            if (d < minDist) { minDist = d; nearest = r; }
        });
        if(nearest) {
            let action = nearest.type === 'tree' ? 'Cortar Árvore' : (nearest.type === 'rock' ? 'Minerar Pedra' : 'Coletar Frutas');
            prompts.push(`[E] ${action}`);
        }

        this.ctx.fillStyle = '#fff';
        this.ctx.textAlign = 'center';
        prompts.forEach((p, i) => {
            this.ctx.fillText(p, this.width/2, this.height - 80 + (i*30));
        });

        // Floating Messages
        if(this.msgTimer > 0) {
            this.msgTimer -= 0.016;
            this.ctx.fillStyle = `rgba(255, 200, 50, ${this.msgTimer})`;
            this.ctx.fillText(this.msg, this.width/2, this.height - 150);
        }
    }

    loop() {
        if (this.gameOver) return;
        const now = performance.now();
        const dt = (now - this.lastTime) / 1000;
        this.lastTime = now;

        // Cap dt to prevent huge jumps if tab is inactive
        if (dt < 0.1) {
            this.update(dt);
            this.draw();
        }

        this.reqId = requestAnimationFrame(this.loop);
    }
}