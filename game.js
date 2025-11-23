/**
 * NEMESIS COMPANION - CORE LOGIC v10.0 (GAME MASTER FEATURES)
 */

// --- DADOS ---

const TOKENS = { LARVA: 'Larval', CREEPER: 'Rastejante', ADULT: 'Adulta', BREEDER: 'Reprodutora', QUEEN: 'Rainha', BLANK: 'Branco' };

// Banco de Dados de Cômodos
const ROOM_DB = {
    tier1: [
        { name: "CABINES", desc: "Ação (1): O Personagem recupera seu fôlego. Embaralhe seu baralho de Ação (incluindo descarte)." },
        { name: "SALA DE COMANDO", desc: "Ação (1): Verifique ou Mude as Coordenadas. (Checar = olha a carta; Mudar = move o token)." },
        { name: "HIBERNATÓRIO", desc: "Cômodo de início. Jogadores podem entrar em hibernação aqui se as Câmaras estiverem abertas." },
        { name: "SALA DE MOTORES (1, 2, 3)", desc: "Ação (2): Verifique ou Conserte o Motor. (Verificar = olha a ficha; Consertar = remove defeito/muda estado)." },
        { name: "GERADOR", desc: "Se houver Defeito aqui, inicia a Autodestruição. Sem Ação específica de cômodo." },
        { name: "NINHO", desc: "Ação (1): Pegue um Ovo. Se houver Fogo aqui, destrua todos os Ovos." },
        { name: "ARSENAL", desc: "Ação (2): Recarregue sua Arma de Energia." },
        { name: "LABORATÓRIO", desc: "Ação (2): Analise um Objeto (Ovo/Cadáver/Carcaça) para descobrir Fraquezas." },
        { name: "ENFERMARIA", desc: "Ação (2): Faça um Curativo (Cure 1 Ferimento Grave) ou trate Ferimentos Leves." },
        { name: "SISTEMA DE COMBATE A INCÊNDIO", desc: "Ação (2): Inicie o Procedimento. Escolha um cômodo: apague o Fogo ou faça todas Intrusoras fugirem dele." }
    ],
    tier2: [
        { name: "ESCOTILHA DE VEDAÇÃO", desc: "Ação (2): Feche todas as portas conectadas a este cômodo ou a qualquer outro cômodo." },
        { name: "SISTEMA DE CONTROLE DE PORTAS", desc: "Ação (1): Feche ou Abra qualquer porta em qualquer corredor." },
        { name: "SISTEMA DE MONITORAMENTO", desc: "Ação (1): Olhe qualquer 1 Cômodo inexplorado ou 1 Carta de Exploração." },
        { name: "REFEITÓRIO", desc: "Ação (1): Cure 1 Ferimento Leve. Só pode usar se não houver Intrusora no cômodo." },
        { name: "CIRURGIA", desc: "Ação (2): Faça uma Cirurgia. Escaneie todas as cartas de contaminação (remova as infectadas) e cure todos os ferimentos (corpo)." },
        { name: "DEPÓSITO", desc: "Ação (2): Procure. Compre 2 cartas de Item da cor deste cômodo (Vermelho/Amarelo)." },
        { name: "SALA DE RÁDIO", desc: "Ação (1): Envie um Sinal. Necessário para alguns objetivos." },
        { name: "CHUVEIRO", desc: "Ação (1): Tome banho. Se tiver Gosma, remova-a. Se tiver carta de Contaminação, escaneie." },
        { name: "ESCRITÓRIO", desc: "Ação (1): Verifique se as portas de escape estão travadas ou destravadas." }
    ]
};

const EVENT_DECK_DATA = [
    { title: "ECLOSÃO", desc: "Personagens com Larval morrem. Compre 4 cartas, verifique contaminação. Se infectado, ganha Larval.", moveTypes: [TOKENS.CREEPER, TOKENS.ADULT, TOKENS.BREEDER, TOKENS.QUEEN], moveDir: 1 },
    { title: "VAZAMENTO DE LÍQUIDO", desc: "Se Defeito no Gerador: Inicia Autodestruição. REMOVA e embaralhe.", moveTypes: [TOKENS.ADULT, TOKENS.BREEDER, TOKENS.QUEEN], moveDir: 1, special: "remove_shuffle" },
    { title: "REGENERAÇÃO", desc: "Todas Intrusoras curam 2 Danos.", moveTypes: [TOKENS.ADULT, TOKENS.BREEDER], moveDir: 1 },
    { title: "CONTENÇÕES ABERTAS", desc: "Abra todas as Portas.", moveTypes: [TOKENS.ADULT, TOKENS.BREEDER], moveDir: 1 },
    { title: "INCÊNDIO DESTRUIDOR", desc: "Espalha Fogo e Defeito onde já tem Fogo.", moveTypes: [TOKENS.ADULT, TOKENS.BREEDER], moveDir: 1 },
    { title: "CAÇADA", desc: "Adulta move para cômodo com Personagem.", moveTypes: [TOKENS.ADULT, TOKENS.BREEDER, TOKENS.QUEEN], moveDir: 2 },
    { title: "DANO", desc: "Defeito onde tem Adulta, Reprodutora ou Rainha.", moveTypes: [TOKENS.ADULT, TOKENS.BREEDER, TOKENS.QUEEN], moveDir: 2 },
    { title: "DEFEITO", desc: "Defeito no cômodo explorado de menor número. Embaralhe de volta.", moveTypes: [TOKENS.QUEEN], moveDir: 2, special: "return_shuffle" },
    { title: "FALHA DO SUPORTE", desc: "Defeito em cada Cômodo Verde. REMOVA e embaralhe.", moveTypes: [TOKENS.ADULT, TOKENS.BREEDER, TOKENS.QUEEN], moveDir: 2, special: "remove_shuffle" },
    { title: "PROTEÇÃO DOS OVOS", desc: "Encontro para quem está no Ninho ou com Ovo.", moveTypes: [TOKENS.CREEPER, TOKENS.ADULT, TOKENS.BREEDER, TOKENS.QUEEN], moveDir: 2 },
    { title: "RASTRO DA PRESA", desc: "Ruído perto de quem tem Gosma.", moveTypes: [TOKENS.ADULT, TOKENS.BREEDER], moveDir: 3 },
    { title: "INCUBAÇÃO", desc: "Descarte 1 Ovo. Quem está no Ninho sem cartas ganha Larval.", moveTypes: [TOKENS.ADULT, TOKENS.BREEDER], moveDir: 3 },
    { title: "CAÇADA (REPROD.)", desc: "Adulta move para cômodo com Personagem.", moveTypes: [TOKENS.ADULT, TOKENS.BREEDER], moveDir: 3 },
    { title: "NINHO", desc: "Ruído ao redor do Ninho.", moveTypes: [TOKENS.ADULT, TOKENS.BREEDER, TOKENS.QUEEN], moveDir: 3 },
    { title: "EJEÇÃO DA CÁPSULA", desc: "Lance a Cápsula menor. REMOVA e embaralhe.", moveTypes: [TOKENS.ADULT, TOKENS.BREEDER, TOKENS.QUEEN], moveDir: 3, special: "remove_shuffle" },
    { title: "À ESPREITA", desc: "Remova Intrusoras isoladas para o banco.", moveTypes: [TOKENS.ADULT, TOKENS.BREEDER], moveDir: 4 },
    { title: "COMPONENTES INFLAMÁVEIS", desc: "Fogo no Hibernatório e adjacentes.", moveTypes: [TOKENS.ADULT, TOKENS.BREEDER, TOKENS.QUEEN], moveDir: 4 },
    { title: "INCÊNDIO ARDENTE", desc: "Zere itens onde tem Fogo. Espalhe Fogo.", moveTypes: [TOKENS.ADULT, TOKENS.BREEDER, TOKENS.QUEEN], moveDir: 4 },
    { title: "CURTO-CIRCUITO", desc: "Defeito em Cômodos Amarelos com Computador. REMOVA e embaralhe.", moveTypes: [TOKENS.ADULT, TOKENS.BREEDER, TOKENS.QUEEN], moveDir: 4, special: "remove_shuffle" },
    { title: "RUÍDO TÉCNICO", desc: "Ruído nos Corredores Técnicos ou rolagem próxima.", moveTypes: [TOKENS.ADULT, TOKENS.BREEDER], moveDir: 4 }
];

const ATTACK_DEFINITIONS = [
    { hp: 2, title: "ARRANHÃO", desc: "1 Ferimento Leve + 1 Contaminação.", targets: [TOKENS.LARVA, TOKENS.CREEPER, TOKENS.ADULT], count: 1 },
    { hp: 3, title: "ARRANHÃO", desc: "1 Ferimento Leve + 1 Contaminação.", targets: [TOKENS.LARVA, TOKENS.CREEPER, TOKENS.ADULT], count: 1 },
    { hp: 5, title: "ARRANHÃO", desc: "1 Ferimento Leve + 1 Contaminação.", targets: [TOKENS.LARVA, TOKENS.CREEPER, TOKENS.ADULT], count: 1 },
    { hp: 6, title: "ARRANHÃO", desc: "1 Ferimento Leve + 1 Contaminação.", targets: [TOKENS.LARVA, TOKENS.CREEPER, TOKENS.ADULT], count: 1 },
    { hp: 3, title: "ATAQUE DAS GARRAS", desc: "2 Ferimentos Leves + 1 Contaminação.", targets: [TOKENS.CREEPER, TOKENS.ADULT, TOKENS.BREEDER], count: 1 },
    { hp: 4, title: "ATAQUE DAS GARRAS", desc: "2 Ferimentos Leves + 1 Contaminação.", targets: [TOKENS.CREEPER, TOKENS.ADULT, TOKENS.BREEDER], count: 2 },
    { hp: 5, title: "ATAQUE DAS GARRAS", desc: "2 Ferimentos Leves + 1 Contaminação.", targets: [TOKENS.CREEPER, TOKENS.ADULT, TOKENS.BREEDER], count: 1 },
    { hp: 2, title: "ATAQUE DA CAUDA", desc: "Se tiver 1 Grave -> Morre. Senão -> 1 Grave.", targets: [TOKENS.ADULT, TOKENS.BREEDER, TOKENS.QUEEN], count: 1 },
    { hp: 5, title: "ATAQUE DA CAUDA", desc: "Se tiver 1 Grave -> Morre. Senão -> 1 Grave.", targets: [TOKENS.ADULT, TOKENS.BREEDER, TOKENS.QUEEN], count: 1 },
    { hp: 4, title: "MORDIDA", desc: "Se tiver 2 Graves -> Morre. Senão -> 1 Grave.", targets: [TOKENS.CREEPER, TOKENS.ADULT, TOKENS.BREEDER], count: 2 },
    { hp: 4, title: "MORDIDA", desc: "Se tiver 2 Graves -> Morre. Senão -> 1 Grave.", targets: [TOKENS.ADULT, TOKENS.BREEDER, TOKENS.QUEEN], count: 1 },
    { hp: 6, title: "MORDIDA", desc: "Se tiver 2 Graves -> Morre. Senão -> 1 Grave.", targets: [TOKENS.ADULT, TOKENS.BREEDER, TOKENS.QUEEN], count: 1 },
    { hp: 3, title: "INVOCAÇÃO", desc: "Compre 1 ficha de Intrusora. Ela não ataca agora.", targets: [TOKENS.CREEPER, TOKENS.ADULT], count: 1 },
    { hp: 5, title: "GOSMA", desc: "Recebe Gosma + 1 Contaminação.", targets: [TOKENS.LARVA, TOKENS.CREEPER, TOKENS.ADULT, TOKENS.BREEDER], count: 1 },
    { hp: 4, title: "TRANSFORMAÇÃO", desc: "Troque Rastejante por Reprodutora. Se sem cartas -> Ataque Surpresa.", targets: [TOKENS.CREEPER], count: 1 },
    { hp: 5, title: "TRANSFORMAÇÃO", desc: "Troque Rastejante por Reprodutora. Se sem cartas -> Ataque Surpresa.", targets: [TOKENS.CREEPER], count: 1 },
    { hp: 3, title: "FRENESI", desc: "2+ Graves -> Morre. Outros -> 1 Grave.", targets: [TOKENS.ADULT, TOKENS.BREEDER], count: 1 },
    { hp: 4, title: "FRENESI", desc: "2+ Graves -> Morre. Outros -> 1 Grave.", targets: [TOKENS.ADULT, TOKENS.BREEDER], count: 1 }
];

// --- JOGO ---

class NemesisGame {
    constructor() {
        this.state = {
            bag: [], deck: [], discard: [], attackDeck: [], attackDiscard: [],
            step: 1, turn: 15, selfDestruct: null,
            // Flags para avisos únicos
            flags: { firstEncounter: false, firstDeath: false, hibernationAlert: false, podUnlockAlert: false }
        };
    }

    startGame(players) {
        document.getElementById('setup-screen').classList.add('hidden');
        document.getElementById('main-interface').classList.remove('hidden');
        
        const saved = localStorage.getItem('nemesis_os_v10');
        if (saved) {
            if(confirm("Jogo salvo encontrado. Continuar?")) {
                this.state = JSON.parse(saved);
                ui.updateAll(this.state);
                return;
            }
        }
        this.initNewGame(players);
    }

    initNewGame(players) {
        this.state.bag = [TOKENS.BLANK, TOKENS.QUEEN, TOKENS.BREEDER, TOKENS.CREEPER, TOKENS.LARVA, TOKENS.LARVA, TOKENS.LARVA, TOKENS.LARVA];
        let adults = (players <= 2) ? 3 : (players === 3 ? 4 : 5);
        for (let i = 0; i < adults; i++) this.state.bag.push(TOKENS.ADULT);

        this.state.deck = [...EVENT_DECK_DATA];
        this.shuffle(this.state.deck);
        this.state.discard = [];
        
        this.state.attackDeck = [];
        ATTACK_DEFINITIONS.forEach(def => { for(let i=0; i<def.count; i++) this.state.attackDeck.push(def); });
        this.shuffle(this.state.attackDeck);
        this.state.attackDiscard = [];

        this.state.step = 1; this.state.turn = 15; this.state.selfDestruct = null;
        this.state.flags = { firstEncounter: false, firstDeath: false, hibernationAlert: false, podUnlockAlert: false };
        
        this.saveState();
        ui.updateAll(this.state);
    }

    saveState() {
        localStorage.setItem('nemesis_os_v10', JSON.stringify(this.state));
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
        
        if (token === TOKENS.BLANK) { 
            message = "FALSO ALARME. Token permanece na bolsa."; 
        } else { 
            this.state.bag.splice(idx, 1); 
            message = "INTRUSORA DETECTADA! Token removido."; 
            removed = true;
            
            // GATILHO 1: PRIMEIRO ENCONTRO
            if (!this.state.flags.firstEncounter) {
                ui.showAlert("PRIMEIRO ENCONTRO DETECTADO", "MOMENTO CRÍTICO: Todos os jogadores devem escolher 1 Objetivo e descartar o outro agora.");
                this.state.flags.firstEncounter = true;
            }
        }
        this.saveState();
        return { token, text: message, removed };
    }

    reportDeath() {
        if(!this.state.flags.firstDeath) {
            this.state.flags.firstDeath = true;
            ui.showAlert("ÓBITO REGISTRADO", "MOMENTO CRÍTICO: O primeiro tripulante morreu. TODAS as Cápsulas de Fuga estão destravadas automaticamente.");
            this.saveState();
        } else {
            alert("Morte já registrada anteriormente. Cápsulas já estão destravadas.");
        }
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

        // Regra de suporte de vida
        if (card.title.includes("FALHA DO SUPORTE") || card.title.includes("SUPORTE DE VIDA")) {
            this.updateCounter('turn', -1);
        }
        
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
        if (this.state.selfDestruct === null) { 
            this.state.selfDestruct = 6; // Inicia amarelo geralmente
            this.checkSelfDestructTrigger();
        } else { 
            this.state.selfDestruct = null; 
        }
        this.saveState();
    }

    updateCounter(type, delta) {
        if (type === 'turn') {
            this.state.turn += delta;
            if (this.state.turn < 0) this.state.turn = 0;
            if (this.state.turn > 15) this.state.turn = 15;
            
            // GATILHO 2: TRILHA DE TEMPO (9 -> 8)
            if (this.state.turn === 8 && !this.state.flags.hibernationAlert) {
                ui.showAlert("CÂMARAS ABERTAS", "ATENÇÃO: A nave entrou na zona AZUL (Turno 8). As Câmaras de Hibernação estão ABERTAS.");
                this.state.flags.hibernationAlert = true;
            }

        } else if (type === 'selfDestruct') {
            if (this.state.selfDestruct !== null) {
                this.state.selfDestruct += delta;
                if (this.state.selfDestruct < 0) this.state.selfDestruct = 0;
                this.checkSelfDestructTrigger();
            }
        }
        this.saveState();
    }

    checkSelfDestructTrigger() {
        // GATILHO 3: AUTODESTRUIÇÃO AMARELA (<= 6)
        if (this.state.selfDestruct !== null && this.state.selfDestruct <= 6 && !this.state.flags.podUnlockAlert) {
            ui.showAlert("ALERTA DE DESTRUIÇÃO", "A Autodestruição entrou na zona crítica. TODAS as Cápsulas de Fuga estão DESTRAVADAS.");
            this.state.flags.podUnlockAlert = true;
        }
    }

    setStep(val) { this.state.step = val; this.saveState(); }
}

// --- UI MANAGER ---

const ui = {
    game: null, manualMode: false, bagVisible: false,

    init: (g) => {
        ui.game = g;
        const date = new Date().toISOString().split('T')[0];
        document.getElementById('app-footer').innerText = `TERMINAL ID: ${date}`;

        document.getElementById('btn-reset').onclick = () => { if(confirm("Apagar progresso?")) { localStorage.removeItem('nemesis_os_v10'); location.reload(); }};
        document.getElementById('btn-toggle-edit').onclick = () => { ui.manualMode = !ui.manualMode; ui.updateAll(ui.game.state); };
        document.getElementById('btn-encounter').onclick = () => { const res = ui.game.triggerEncounter(); if(res.token) ui.renderEncounterResult(res); };
        document.getElementById('btn-step-2').onclick = () => { ui.changeStep(2); const card = ui.game.drawEventCard(); ui.renderCard(card); };
        document.getElementById('btn-step-3').onclick = () => { ui.changeStep(3); const res = ui.game.resolveBag(); ui.renderBagResult(res); };
        document.getElementById('btn-finish-phase').onclick = () => {
            ui.game.updateCounter('turn', -1);
            if(ui.game.state.selfDestruct !== null && ui.game.state.selfDestruct > 0) { ui.game.updateCounter('selfDestruct', -1); }
            ui.changeStep(1);
        };

        const saved = localStorage.getItem('nemesis_os_v10');
        if(saved) {
            document.getElementById('setup-screen').classList.add('hidden');
            document.getElementById('main-interface').classList.remove('hidden');
            ui.game.state = JSON.parse(saved);
            ui.updateAll(ui.game.state);
        }
    },

    // MODAIS
    openRoomModal: () => {
        document.getElementById('room-modal').classList.remove('hidden');
        // Popula lista
        const t1 = document.getElementById('rooms-tier-1');
        const t2 = document.getElementById('rooms-tier-2');
        t1.innerHTML = ROOM_DB.tier1.map(r => `<div class="room-item"><strong>${r.name}</strong><br>${r.desc}</div>`).join('');
        t2.innerHTML = ROOM_DB.tier2.map(r => `<div class="room-item"><strong>${r.name}</strong><br>${r.desc}</div>`).join('');
    },
    closeModal: (id) => { document.getElementById(id).classList.add('hidden'); },
    showAlert: (title, msg) => {
        document.getElementById('alert-title').innerText = title;
        document.getElementById('alert-message').innerText = msg;
        document.getElementById('alert-modal').classList.remove('hidden');
    },

    changeStep: (n) => { ui.game.setStep(n); ui.renderStep(n); },
    renderStep: (n) => {
        document.querySelectorAll('.step-box').forEach(e => e.classList.remove('active'));
        document.getElementById(`step-${n}`).classList.add('active');
        if (n === 1) { document.getElementById('card-output').innerHTML = ''; document.getElementById('bag-dev-result').innerHTML = ''; }
    },
    toggleBagVisibility: () => {
        if (!ui.bagVisible) { if (confirm("Revelar dados da bolsa?")) ui.bagVisible = true; } else { ui.bagVisible = false; }
        ui.updateBagVisibility();
    },
    updateBagVisibility: () => {
        if (ui.bagVisible) { document.getElementById('bag-overlay').classList.add('hidden'); document.getElementById('bag-content').classList.remove('hidden'); } 
        else { document.getElementById('bag-overlay').classList.remove('hidden'); document.getElementById('bag-content').classList.add('hidden'); }
    },
    triggerHealthCheck: () => { const card = ui.game.drawAttackCard(); ui.renderCombatResult(card, "DANO DO JOGADOR", "Verifique Resistência.", true); },
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
        document.getElementById('combat-result').classList.remove('hidden');
        document.getElementById('attacker-name').innerText = title;
        document.getElementById('card-hp-value').innerText = card.hp;
        document.getElementById('attack-card-name').innerText = card.title.toUpperCase();
        const textEl = document.getElementById('attack-effect');
        textEl.innerText = effectText;
        const hpEl = document.getElementById('card-hp-value');
        if(isHit) { textEl.style.color = "var(--neon-red)"; hpEl.style.color = "var(--neon-red)"; } 
        else { textEl.style.color = "#aaa"; hpEl.style.color = "#888"; }
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

        // Bag List (Texto apenas)
        const counts = {};
        Object.values(TOKENS).forEach(t => counts[t] = 0);
        state.bag.forEach(t => counts[t] = (counts[t] || 0) + 1);
        
        const container = document.getElementById('bag-ui');
        container.innerHTML = '';
        Object.keys(counts).forEach(key => {
            const div = document.createElement('div');
            div.className = 'bag-item-text';
            const controls = ui.manualMode ? ` <button class="btn-mini" onclick="ui.game.modifyBag('${key}',-1)">-</button> <button class="btn-mini" onclick="ui.game.modifyBag('${key}',1)">+</button>` : '';
            div.innerHTML = `${key}: <strong>${counts[key]}</strong> ${controls}`;
            container.appendChild(div);
        });
        document.getElementById('total-tokens').innerText = `ASSINATURAS: ${state.bag.length}`;
        ui.renderStep(state.step);
    },
    renderCard: (c) => { 
        const iconsHtml = (c.moveTypes || []).map(t => `<span class="mini-text-icon">${t}</span>`).join(' / ');
        document.getElementById('card-output').innerHTML = `<div class="card-title">${c.title}</div><div class="card-desc">${c.desc}</div><div class="card-move"><div class="move-label">MOVIMENTO:</div><div class="card-move-icons" style="font-size:0.8rem">${iconsHtml}</div><div class="move-dir">DIREÇÃO: <span>${c.moveDir}</span></div></div>`; 
    },
    renderBagResult: (r) => { document.getElementById('bag-dev-result').innerHTML = `<span class="result-token" style="font-size:2rem">${r.token.toUpperCase()}</span><div>${r.text}</div>`; },
    renderEncounterResult: (r) => {
        const area = document.getElementById('encounter-result-area');
        area.classList.remove('hidden');
        document.getElementById('encounter-token-name').innerText = r.token.toUpperCase();
        document.getElementById('encounter-action-text').innerText = r.text;
        const color = (r.token === TOKENS.BLANK) ? "#fff" : "var(--neon-red)";
        document.getElementById('encounter-token-name').style.color = color;
        area.style.borderColor = color;
    }
};

const game = new NemesisGame();
ui.init(game);
