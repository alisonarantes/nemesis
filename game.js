/**
 * NEMESIS COMPANION - CORE LOGIC v9.2 (DECK COUNT FIXED)
 */

// --- 1. CONSTANTES E DEFINIÇÕES ---

const TOKENS = { 
    LARVA: 'Larval', 
    CREEPER: 'Rastejante', 
    ADULT: 'Adulta', 
    BREEDER: 'Reprodutora', 
    QUEEN: 'Rainha', 
    BLANK: 'Branco' 
};

const EVENT_DECK_DATA = [
    { title: "ECLOSÃO", desc: "Personagens com uma Larval morrem (coloque uma Rastejante no Cômodo deles). Cada Personagem compra 4 cartas do baralho de ação...", moveTypes: [TOKENS.CREEPER, TOKENS.ADULT, TOKENS.BREEDER, TOKENS.QUEEN], moveDir: 1 },
    { title: "VAZAMENTO DE LÍQUIDO", desc: "Se houver marcador de Defeito no Gerador, inicie Autodestruição. REMOVA e embaralhe.", moveTypes: [TOKENS.ADULT, TOKENS.BREEDER, TOKENS.QUEEN], moveDir: 1, special: "remove_shuffle" },
    { title: "REGENERAÇÃO", desc: "Cada Intrusora no tabuleiro tem 2 Danos Curados.", moveTypes: [TOKENS.ADULT, TOKENS.BREEDER], moveDir: 1 },
    { title: "CONTENÇÕES ABERTAS", desc: "Abra todas as Portas (exceto Portas Destruídas).", moveTypes: [TOKENS.ADULT, TOKENS.BREEDER], moveDir: 1 },
    { title: "INCÊNDIO DESTRUIDOR", desc: "Espalha Fogo e Defeito baseado em Fogo existente.", moveTypes: [TOKENS.ADULT, TOKENS.BREEDER], moveDir: 1 },
    { title: "CAÇADA", desc: "Desloque Intrusora Adulta para Cômodo com Personagem ou menor número.", moveTypes: [TOKENS.ADULT, TOKENS.BREEDER, TOKENS.QUEEN], moveDir: 2 },
    { title: "DANO", desc: "Coloque Defeito em cada Cômodo com Intrusora Adulta, Reprodutora ou Rainha.", moveTypes: [TOKENS.ADULT, TOKENS.BREEDER, TOKENS.QUEEN], moveDir: 2 },
    { title: "DEFEITO", desc: "Defeito no Cômodo explorado de menor número. Embaralhe esta carta de volta.", moveTypes: [TOKENS.QUEEN], moveDir: 2, special: "return_shuffle" },
    { title: "FALHA DO SUPORTE", desc: "Defeito em cada Cômodo Verde explorado. REMOVA e embaralhe.", moveTypes: [TOKENS.ADULT, TOKENS.BREEDER, TOKENS.QUEEN], moveDir: 2, special: "remove_shuffle" },
    { title: "PROTEÇÃO DOS OVOS", desc: "Encontro para cada Personagem no Ninho ou carregando Ovo.", moveTypes: [TOKENS.CREEPER, TOKENS.ADULT, TOKENS.BREEDER, TOKENS.QUEEN], moveDir: 2 },
    { title: "RASTRO DA PRESA", desc: "Ruído em corredores conectados a Personagens com Gosma.", moveTypes: [TOKENS.ADULT, TOKENS.BREEDER], moveDir: 3 },
    { title: "INCUBAÇÃO", desc: "Descarte 1 Ovo. Personagens no Ninho sem cartas na mão são Infestados.", moveTypes: [TOKENS.ADULT, TOKENS.BREEDER], moveDir: 3 },
    { title: "CAÇADA (REPROD.)", desc: "Desloque Intrusora Adulta para Cômodo com Personagem.", moveTypes: [TOKENS.ADULT, TOKENS.BREEDER], moveDir: 3 },
    { title: "NINHO", desc: "Se Ninho explorado, Ruído em todos corredores conectados.", moveTypes: [TOKENS.ADULT, TOKENS.BREEDER, TOKENS.QUEEN], moveDir: 3 },
    { title: "EJEÇÃO DA CÁPSULA", desc: "Lance a Cápsula de menor número. REMOVA e embaralhe.", moveTypes: [TOKENS.ADULT, TOKENS.BREEDER, TOKENS.QUEEN], moveDir: 3, special: "remove_shuffle" },
    { title: "À ESPREITA", desc: "Remova Intrusoras que não estão com Personagens para o banco.", moveTypes: [TOKENS.ADULT, TOKENS.BREEDER], moveDir: 4 },
    { title: "COMPONENTES INFLAMÁVEIS", desc: "Fogo no Hibernatório e adjacentes.", moveTypes: [TOKENS.ADULT, TOKENS.BREEDER, TOKENS.QUEEN], moveDir: 4 },
    { title: "INCÊNDIO ARDENTE", desc: "Zere itens de salas com Fogo. Espalhe Fogo.", moveTypes: [TOKENS.ADULT, TOKENS.BREEDER, TOKENS.QUEEN], moveDir: 4 },
    { title: "CURTO-CIRCUITO", desc: "Defeito em Cômodos Amarelos com Computador. REMOVA e embaralhe.", moveTypes: [TOKENS.ADULT, TOKENS.BREEDER, TOKENS.QUEEN], moveDir: 4, special: "remove_shuffle" },
    { title: "RUÍDO TÉCNICO", desc: "Ruído nos Corredores Técnicos ou rolagem para quem estiver perto.", moveTypes: [TOKENS.ADULT, TOKENS.BREEDER], moveDir: 4 }
];

// CORREÇÃO: Count = 1 para todos, pois cada linha é uma carta única transcrita
const ATTACK_DEFINITIONS = [
    { hp: 2, title: "ARRANHÃO", desc: "O Personagem sofre 1 Ferimento Leve e recebe 1 carta de Contaminação.", targets: [TOKENS.LARVA, TOKENS.CREEPER, TOKENS.ADULT], count: 1 },
    { hp: 3, title: "ARRANHÃO", desc: "O Personagem sofre 1 Ferimento Leve e recebe 1 carta de Contaminação.", targets: [TOKENS.LARVA, TOKENS.CREEPER, TOKENS.ADULT], count: 1 },
    { hp: 5, title: "ARRANHÃO", desc: "O Personagem sofre 1 Ferimento Leve e recebe 1 carta de Contaminação.", targets: [TOKENS.LARVA, TOKENS.CREEPER, TOKENS.ADULT], count: 1 },
    { hp: 6, title: "ARRANHÃO", desc: "O Personagem sofre 1 Ferimento Leve e recebe 1 carta de Contaminação.", targets: [TOKENS.LARVA, TOKENS.CREEPER, TOKENS.ADULT], count: 1 },
    { hp: 3, title: "ATAQUE DAS GARRAS", desc: "O Personagem sofre 2 Ferimentos Leves e recebe 1 carta de Contaminação.", targets: [TOKENS.CREEPER, TOKENS.ADULT, TOKENS.BREEDER], count: 1 },
    { hp: 4, title: "ATAQUE DAS GARRAS", desc: "O Personagem sofre 2 Ferimentos Leves e recebe 1 carta de Contaminação.", targets: [TOKENS.CREEPER, TOKENS.ADULT, TOKENS.BREEDER], count: 1 },
    { hp: 4, title: "ATAQUE DAS GARRAS", desc: "O Personagem sofre 2 Ferimentos Leves e recebe 1 carta de Contaminação.", targets: [TOKENS.CREEPER, TOKENS.ADULT, TOKENS.BREEDER], count: 1 },
    { hp: 5, title: "ATAQUE DAS GARRAS", desc: "O Personagem sofre 2 Ferimentos Leves e recebe 1 carta de Contaminação.", targets: [TOKENS.CREEPER, TOKENS.ADULT, TOKENS.BREEDER], count: 1 },
    { hp: 2, title: "ATAQUE DA CAUDA", desc: "Se o Personagem tiver pelo menos 1 Ferimento Grave, ele morre. Se não, ele sofre 1 Ferimento Grave.", targets: [TOKENS.ADULT, TOKENS.BREEDER, TOKENS.QUEEN], count: 1 },
    { hp: 5, title: "ATAQUE DA CAUDA", desc: "Se o Personagem tiver pelo menos 1 Ferimento Grave, ele morre. Se não, ele sofre 1 Ferimento Grave.", targets: [TOKENS.ADULT, TOKENS.BREEDER, TOKENS.QUEEN], count: 1 },
    { hp: 4, title: "MORDIDA", desc: "Se o Personagem tiver 2 Ferimentos Graves, ele morre. Se não, ele sofre 1 Ferimento Grave.", targets: [TOKENS.CREEPER, TOKENS.ADULT, TOKENS.BREEDER], count: 1 },
    { hp: 4, title: "MORDIDA", desc: "Se o Personagem tiver 2 Ferimentos Graves, ele morre. Se não, ele sofre 1 Ferimento Grave.", targets: [TOKENS.CREEPER, TOKENS.ADULT, TOKENS.BREEDER], count: 1 },
    { hp: 4, title: "MORDIDA", desc: "Se o Personagem tiver 2 Ferimentos Graves, ele morre. Se não, ele sofre 1 Ferimento Grave.", targets: [TOKENS.ADULT, TOKENS.BREEDER, TOKENS.QUEEN], count: 1 },
    { hp: 6, title: "MORDIDA", desc: "Se o Personagem tiver 2 Ferimentos Graves, ele morre. Se não, ele sofre 1 Ferimento Grave.", targets: [TOKENS.ADULT, TOKENS.BREEDER, TOKENS.QUEEN], count: 1 },
    { hp: 3, title: "INVOCAÇÃO", desc: "Compre 1 ficha de Intrusora e coloque no Cômodo. Ela não ataca nesta ação.", targets: [TOKENS.CREEPER, TOKENS.ADULT], count: 1 },
    { hp: 5, title: "GOSMA", desc: "O Personagem recebe um marcador de Gosma e 1 carta de Contaminação.", targets: [TOKENS.LARVA, TOKENS.CREEPER, TOKENS.ADULT, TOKENS.BREEDER], count: 1 },
    { hp: 4, title: "TRANSFORMAÇÃO", desc: "Substitua a Rastejante atacante por uma Reprodutora. Se jogador sem cartas, Ataque Surpresa.", targets: [TOKENS.CREEPER], count: 1 },
    { hp: 5, title: "TRANSFORMAÇÃO", desc: "Substitua a Rastejante atacante por uma Reprodutora. Se jogador sem cartas, Ataque Surpresa.", targets: [TOKENS.CREEPER], count: 1 },
    { hp: 3, title: "FRENESI", desc: "Personagens com 2+ Ferimentos Graves morrem. Outros sofrem 1 Ferimento Grave.", targets: [TOKENS.ADULT, TOKENS.BREEDER], count: 1 },
    { hp: 4, title: "FRENESI", desc: "Personagens com 2+ Ferimentos Graves morrem. Outros sofrem 1 Ferimento Grave.", targets: [TOKENS.ADULT, TOKENS.BREEDER], count: 1 }
];

const getSvgIcon = (type) => {
    const baseClass = "token-svg";
    let path = "";
    switch(type) {
        case TOKENS.LARVA: path = `<path d="M65,35 Q50,35 40,50 T35,75" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" /><circle cx="65" cy="35" r="5" fill="currentColor"/>`; break;
        case TOKENS.CREEPER: path = `<path d="M70,40 A 22 22 0 1 0 70,60" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" />`; break;
        case TOKENS.ADULT: path = `<path d="M55,20 Q85,35 50,50 Q15,65 45,80" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" />`; break;
        case TOKENS.BREEDER: path = `<g transform="translate(50,50)" stroke="currentColor" stroke-width="6" stroke-linecap="round" fill="none"><path d="M0,0 Q10,-25 30,-25" /><path d="M0,0 Q10,-25 30,-25" transform="rotate(120)" /><path d="M0,0 Q10,-25 30,-25" transform="rotate(240)" /></g>`; break;
        case TOKENS.QUEEN: path = `<g transform="translate(50,53) scale(1.2)" stroke="currentColor" stroke-width="5" stroke-linecap="round" fill="none"><path d="M0,-35 C15,-15 30,10 0,10 C-30,10 -15,-15 0,-35 Z" /><path d="M0,-35 C15,-15 30,10 0,10 C-30,10 -15,-15 0,-35 Z" transform="rotate(120)" /><path d="M0,-35 C15,-15 30,10 0,10 C-30,10 -15,-15 0,-35 Z" transform="rotate(240)" /></g>`; break;
        case TOKENS.BLANK: path = `<circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="6,4"/><line x1="50" y1="20" x2="50" y2="80" stroke="currentColor" stroke-width="2"/><line x1="20" y1="50" x2="80" y2="50" stroke="currentColor" stroke-width="2"/>`; break;
    }
    return `<svg viewBox="0 0 100 100" class="${baseClass} token-${type.toLowerCase()}">${path}</svg>`;
};

// --- 3. LÓGICA DO JOGO ---

class NemesisGame {
    constructor() {
        this.state = {
            bag: [], deck: [], discard: [], 
            attackDeck: [], attackDiscard: [],
            step: 1, turn: 15, selfDestruct: null
        };
    }

    startGame(players) {
        document.getElementById('setup-screen').classList.add('hidden');
        document.getElementById('main-interface').classList.remove('hidden');
        
        const saved = localStorage.getItem('nemesis_os_v92');
        if (saved) {
            if(confirm("Jogo salvo encontrado. Continuar? (Cancelar = Novo Jogo)")) {
                this.state = JSON.parse(saved);
                ui.updateAll(this.state);
                return;
            }
        }
        this.initNewGame(players);
    }

    initNewGame(players) {
        this.state.bag = [TOKENS.BLANK, TOKENS.QUEEN, TOKENS.BREEDER, TOKENS.CREEPER, TOKENS.LARVA, TOKENS.LARVA, TOKENS.LARVA, TOKENS.LARVA];
        
        // Regra Padrão de Adultos (Ex: 3 Jogadores = +4 Adultas)
        let adults = 0;
        if (players <= 2) adults = 3; 
        else if (players === 3) adults = 4; 
        else adults = 5; // 4 ou 5 jogadores (Regra base aproximada)
        
        for (let i = 0; i < adults; i++) this.state.bag.push(TOKENS.ADULT);

        this.state.deck = [...EVENT_DECK_DATA];
        this.shuffle(this.state.deck);
        this.state.discard = [];
        
        this.state.attackDeck = [];
        // Como o count agora é 1, isso vai gerar exatamente 20 cartas
        ATTACK_DEFINITIONS.forEach(def => {
            for(let i=0; i<def.count; i++) this.state.attackDeck.push(def);
        });
        this.shuffle(this.state.attackDeck);
        this.state.attackDiscard = [];

        this.state.step = 1; this.state.turn = 15; this.state.selfDestruct = null;
        this.saveState();
    }

    saveState() {
        localStorage.setItem('nemesis_os_v92', JSON.stringify(this.state));
        ui.updateAll(this.state);
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    triggerEncounter() {
        if (this.state.bag.length === 0) return { token: null, text: "Bolsa Vazia" };
        const idx = Math.floor(Math.random() * this.state.bag.length);
        const token = this.state.bag[idx];
        let message = "", removed = false;
        if (token === TOKENS.BLANK) { message = "FALSO ALARME. Token permanece na bolsa."; } 
        else { this.state.bag.splice(idx, 1); message = "INTRUSORA DETECTADA! Token removido."; removed = true; }
        this.saveState();
        return { token, text: message, removed };
    }

    drawEventCard() {
        if (this.state.deck.length === 0) {
            if (this.state.discard.length === 0) return { title: "FIM", desc: "Baralho vazio.", moveTypes: [], moveDir: "-" };
            this.state.deck = [...this.state.discard];
            this.state.discard = [];
            this.shuffle(this.state.deck);
        }
        const card = this.state.deck.pop();
        
        if (card.special === 'remove_shuffle') {
            this.state.deck = [...this.state.deck, ...this.state.discard];
            this.state.discard = [];
            this.shuffle(this.state.deck);
            card.desc += " <br><strong style='color:var(--neon-red)'>[SISTEMA: BARALHO REINICIADO]</strong>";
        } else if (card.special === 'return_shuffle') {
            this.state.deck.push(card);
            this.shuffle(this.state.deck);
            return { ...card, desc: card.desc + " <br><strong style='color:var(--neon-red)'>[SISTEMA: CARTA RETORNOU AO DECK]</strong>" };
        } else {
            this.state.discard.push(card);
        }

        if (card.title.includes("FALHA DO SUPORTE") || card.title.includes("SUPORTE DE VIDA")) this.updateCounter('turn', -1);
        this.saveState();
        return card;
    }

    resolveBag() {
        if (this.state.bag.length === 0) return { token: "ERRO", text: "Bolsa Vazia" };
        const idx = Math.floor(Math.random() * this.state.bag.length);
        const token = this.state.bag[idx];
        let action = "", remove = false, add = null;

        switch (token) {
            case TOKENS.LARVA: action = "Remova a Larval. Adicione 1 Adulta."; remove = true; add = TOKENS.ADULT; break;
            case TOKENS.CREEPER: action = "Remova a Rastejante. Adicione 1 Reprodutora."; remove = true; add = TOKENS.BREEDER; break;
            case TOKENS.ADULT: action = "Retorne para a bolsa.<br><em>Se ninguém em combate: Todos rolam Ruído.</em>"; break;
            case TOKENS.BREEDER: action = "Retorne para a bolsa.<br><em>Coloque 1 Ovo no Ninho.</em>"; break;
            case TOKENS.QUEEN: action = "Retorne para a bolsa.<br><em>Se Personagem no Ninho: ENCONTRO. Senão: +1 Ovo.</em>"; break;
            case TOKENS.BLANK: action = "Adicione 1 Adulta. Retorne o Branco."; add = TOKENS.ADULT; break;
        }
        if (remove) this.state.bag.splice(idx, 1);
        if (add) this.state.bag.push(add);
        this.saveState();
        return { token, text: action };
    }

    modifyBag(token, delta) {
        if (delta > 0) this.state.bag.push(token);
        else { const idx = this.state.bag.indexOf(token); if (idx > -1) this.state.bag.splice(idx, 1); }
        this.saveState();
    }

    drawAttackCard() {
        if (this.state.attackDeck.length === 0) {
            this.state.attackDeck = [...this.state.attackDiscard];
            this.state.attackDiscard = [];
            this.shuffle(this.state.attackDeck);
        }
        const card = this.state.attackDeck.pop();
        this.state.attackDiscard.push(card);
        this.saveState();
        return card;
    }

    resolveIntruderAttack(intruderType) {
        const card = this.drawAttackCard();
        const isHit = card.targets.includes(intruderType);
        let effectText = isHit ? card.desc : "ERROU! O símbolo da Intrusora não corresponde.";
        return { card: card, effect: effectText, isHit: isHit };
    }

    toggleSelfDestruct() {
        if (this.state.selfDestruct === null) { this.state.selfDestruct = 6; } 
        else { this.state.selfDestruct = null; }
        this.saveState();
    }

    updateCounter(type, delta) {
        if (type === 'turn') {
            this.state.turn += delta;
            if (this.state.turn < 0) this.state.turn = 0;
            if (this.state.turn > 15) this.state.turn = 15;
        } else if (type === 'selfDestruct') {
            if (this.state.selfDestruct !== null) {
                this.state.selfDestruct += delta;
                if (this.state.selfDestruct < 0) this.state.selfDestruct = 0;
            }
        }
        this.saveState();
    }

    setStep(val) { this.state.step = val; this.saveState(); }
}

// --- 4. UI MANAGER ---

const ui = {
    game: null, manualMode: false, bagVisible: false,

    init: (g) => {
        ui.game = g;
        document.getElementById('btn-reset').onclick = () => { if(confirm("TEM CERTEZA? ISSO APAGARÁ TODO O PROGRESSO.")) { localStorage.removeItem('nemesis_os_v92'); location.reload(); }};
        
        document.getElementById('btn-toggle-edit').onclick = () => { ui.manualMode = !ui.manualMode; ui.updateAll(ui.game.state); };
        document.getElementById('btn-encounter').onclick = () => { const res = ui.game.triggerEncounter(); if(res.token) ui.renderEncounterResult(res); };
        
        document.getElementById('btn-step-2').onclick = () => { ui.changeStep(2); const card = ui.game.drawEventCard(); ui.renderCard(card); };
        document.getElementById('btn-step-3').onclick = () => { ui.changeStep(3); const res = ui.game.resolveBag(); ui.renderBagResult(res); };
        document.getElementById('btn-finish-phase').onclick = () => {
            ui.game.updateCounter('turn', -1);
            if(ui.game.state.selfDestruct !== null && ui.game.state.selfDestruct > 0) { ui.game.updateCounter('selfDestruct', -1); }
            ui.changeStep(1);
        };

        const saved = localStorage.getItem('nemesis_os_v92');
        if(saved) {
            document.getElementById('setup-screen').classList.add('hidden');
            document.getElementById('main-interface').classList.remove('hidden');
            ui.game.state = JSON.parse(saved);
            ui.updateAll(ui.game.state);
        }
    },

    changeStep: (n) => { ui.game.setStep(n); ui.renderStep(n); },

    renderStep: (n) => {
        document.querySelectorAll('.step-box').forEach(e => e.classList.remove('active'));
        const el = document.getElementById(`step-${n}`);
        if(el) el.classList.add('active');
        if (n === 1) {
            document.getElementById('card-output').innerHTML = '';
            document.getElementById('bag-dev-result').innerHTML = '';
        }
    },

    toggleBagVisibility: () => {
        if (!ui.bagVisible) { if (confirm("Deseja revelar os dados da bolsa?")) ui.bagVisible = true; } 
        else { ui.bagVisible = false; }
        ui.updateBagVisibility();
    },

    updateBagVisibility: () => {
        const overlay = document.getElementById('bag-overlay');
        const content = document.getElementById('bag-content');
        if (ui.bagVisible) { overlay.classList.add('hidden'); content.classList.remove('hidden'); } 
        else { overlay.classList.remove('hidden'); content.classList.add('hidden'); }
    },

    triggerHealthCheck: () => {
        const card = ui.game.drawAttackCard();
        ui.renderCombatResult(card, "DANO DO JOGADOR", "Verifique se o dano é >= Resistência.", true);
    },

    triggerAttack: (typeKey) => {
        let intruderType = TOKENS[typeKey] || typeKey;
        if(typeKey === 'Larva') intruderType = TOKENS.LARVA;
        if(typeKey === 'Rastejadora') intruderType = TOKENS.CREEPER;
        if(typeKey === 'Adulto') intruderType = TOKENS.ADULT;
        if(typeKey === 'Reprodutora') intruderType = TOKENS.BREEDER;
        if(typeKey === 'Rainha') intruderType = TOKENS.QUEEN;
        const result = ui.game.resolveIntruderAttack(intruderType);
        ui.renderCombatResult(result.card, `ATACANTE: ${intruderType.toUpperCase()}`, result.effect, result.isHit);
    },

    renderCombatResult: (card, title, effectText, isHit) => {
        const display = document.getElementById('combat-result');
        display.classList.remove('hidden');
        document.getElementById('attacker-name').innerText = title;
        document.getElementById('card-hp-value').innerText = card.hp;
        document.getElementById('attack-card-name').innerText = card.title.toUpperCase();
        const textEl = document.getElementById('attack-effect');
        textEl.innerText = effectText;
        const hpEl = document.getElementById('card-hp-value');
        if(isHit) { textEl.style.color = "var(--neon-red)"; hpEl.style.color = "var(--neon-red)"; display.style.borderColor = "var(--neon-red)"; } 
        else { textEl.style.color = "#aaa"; hpEl.style.color = "#888"; display.style.borderColor = "#444"; }
        document.getElementById('attack-deck-count').innerText = ui.game.state.attackDeck.length;
    },

    updateAll: (state) => {
        document.getElementById('turn-display').innerText = state.turn;
        const sdEl = document.getElementById('sd-display');
        const sdControls = document.getElementById('sd-controls');
        if (state.selfDestruct === null) { sdEl.innerText = "OFF"; sdEl.style.color = "#444"; sdControls.style.display = 'none'; } 
        else { sdEl.innerText = state.selfDestruct; sdEl.style.color = state.selfDestruct === 0 ? "#fff" : "var(--neon-red)"; sdControls.style.display = 'flex'; }
        
        document.getElementById('deck-count').innerText = state.deck.length;
        if(document.getElementById('attack-deck-count')) document.getElementById('attack-deck-count').innerText = state.attackDeck.length;

        const counts = {};
        Object.values(TOKENS).forEach(t => counts[t] = 0);
        state.bag.forEach(t => counts[t] = (counts[t] || 0) + 1);
        
        const container = document.getElementById('bag-ui');
        container.innerHTML = '';
        Object.keys(counts).forEach(key => {
            const div = document.createElement('div');
            div.className = 'bag-item';
            const controls = ui.manualMode ? `<div class="bag-controls"><button class="btn-danger" data-token="${key}" data-delta="-1">-</button><button class="btn-primary" data-token="${key}" data-delta="1">+</button></div>` : '';
            div.innerHTML = `<div class="icon-box">${getSvgIcon(key)}</div><strong>${key}</strong><div class="count">${counts[key]}</div>${controls}`;
            container.appendChild(div);
        });
        document.getElementById('total-tokens').innerText = `ASSINATURAS: ${state.bag.length}`;
        
        if(ui.manualMode) { document.querySelectorAll('.bag-controls button').forEach(b => { b.onclick = (e) => { ui.game.modifyBag(e.target.dataset.token, parseInt(e.target.dataset.delta)); }; }); }
        
        ui.renderStep(state.step);
    },

    renderCard: (c) => { 
        const iconsHtml = (c.moveTypes || []).map(t => `<div class="mini-icon">${getSvgIcon(t)}</div>`).join('');
        document.getElementById('card-output').innerHTML = `<div class="card-title">${c.title}</div><div class="card-desc">${c.desc}</div><div class="card-move"><div class="move-label">MOVIMENTO:</div><div class="card-move-icons">${iconsHtml}</div><div class="move-dir">DIREÇÃO: <span>${c.moveDir}</span></div></div>`; 
    },
    
    renderBagResult: (r) => { document.getElementById('bag-dev-result').innerHTML = `<div class="result-icon-large">${getSvgIcon(r.token)}</div><span class="result-token">${r.token.toUpperCase()}</span><div>${r.text}</div>`; },
    
    renderEncounterResult: (r) => {
        const area = document.getElementById('encounter-result-area');
        area.classList.remove('hidden');
        document.getElementById('encounter-icon').innerHTML = getSvgIcon(r.token);
        document.getElementById('encounter-token-name').innerText = r.token.toUpperCase();
        document.getElementById('encounter-action-text').innerText = r.text;
        const color = (r.token === TOKENS.BLANK) ? "#fff" : "var(--neon-red)";
        document.getElementById('encounter-token-name').style.color = color;
        area.style.borderColor = color;
        document.querySelector('#encounter-result-area svg').style.color = color;
    }
};

// INICIALIZAÇÃO
const game = new NemesisGame();
ui.init(game);
