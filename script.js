// Variables globales
let rules = [], // Stocke toutes les règles de pare-feu
    isSimulationRunning = false, // État de la simulation (activée/désactivée)
    simulationInterval; // Intervalle pour contrôler la simulation

// Ajoute une nouvelle règle de pare-feu
function addRule() {
    // Récupération et nettoyage des valeurs du formulaire
    const firstName = document.getElementById('operatorFirstName').value.trim();
    const lastName = document.getElementById('operatorLastName').value.trim();
    const ip = document.getElementById('ipAddress').value;
    const port = document.getElementById('port').value;
    
    // Validation des entrées
    if (!firstName || !lastName || !validateIP(ip) || !validatePort(port)) {
        alert('Veuillez remplir tous les champs correctement');
        return;
    }

    // Création de l'objet règle
    rules.push({
        ip, // Adresse IP cible
        port: parseInt(port), // Port converti en nombre
        action: document.getElementById('action').value, // "allow" ou "block"
        operator: { firstName, lastName }, // Opérateur responsable
        timestamp: new Date() // Date/heure de création
    });
    
    updateRulesList(); // Mise à jour de l'interface
    // Réinitialisation des champs
    document.getElementById('ipAddress').value = '';
    document.getElementById('port').value = '';
}

// Valide le format d'une adresse IPv4
function validateIP(ip) {
    return /^(\d{1,3}\.){3}\d{1,3}$/.test(ip) // Format X.X.X.X
        && ip.split('.').every(p => p >= 0 && p <= 255); // Chaque octet valide
}

// Valide un port réseau (1-65535)
function validatePort(port) {
    return port > 0 && port <= 65535;
}

// Met à jour l'affichage des règles
function updateRulesList() {
    document.getElementById('rulesList').innerHTML = rules
        .map((rule, index) => `
            <div class="rule-item ${rule.action}">
                <div class="rule-info">
                    <span>${rule.ip}:${rule.port} | ${rule.action === 'allow' ? 'Autoriser' : 'Bloquer'}</span>
                    <span class="rule-operator">${rule.operator.firstName} ${rule.operator.lastName} - ${new Intl.DateTimeFormat('fr-FR').format(rule.timestamp)}</span>
                </div>
                <button onclick="deleteRule(${index})" class="btn-danger">X</button>
            </div>
        `).join(''); // Génère le HTML pour chaque règle
}

// Supprime une règle par son index
function deleteRule(index) {
    rules.splice(index, 1); // Retire l'élément du tableau
    updateRulesList(); // Rafraîchit l'affichage
}

// Bascule l'état de la simulation
function toggleSimulation() {
    const btn = document.getElementById('startSimulation');
    isSimulationRunning = !isSimulationRunning; // Inverse l'état
    
    // Met à jour le bouton
    btn.textContent = isSimulationRunning ? 'Arrêter' : 'Démarrer';
    btn.className = isSimulationRunning ? 'btn-danger' : 'btn-success';
    
    // Démarre/arrête la simulation
    isSimulationRunning ? startSimulation() : stopSimulation();
}

// Démarre la simulation de trafic
function startSimulation() {
    simulationInterval = setInterval(() => {
        // Génère une IP aléatoire (ex: 192.168.0.1)
        const ip = Array.from({length:4}, () => Math.floor(Math.random()*256)).join('.');
        
        // Génère un port aléatoire (1-65535)
        const port = Math.floor(Math.random()*65535)+1;
        
        // Vérifie si le paquet est autorisé
        const allowed = checkPacket(ip, port);

       

        // Ajoute une entrée de log
        const log = document.createElement('div');
        log.textContent = `[${new Date().toLocaleTimeString()}] ${ip}:${port} - ${allowed ? 'AUTORISÉ' : 'BLOQUÉ'}`;
        document.getElementById('simulationLogs').prepend(log);
        
        // Limite à 50 entrées max
        if (document.getElementById('simulationLogs').children.length > 50) log.remove();
    }, 2000); // Répète toutes les 2 secondes
}

// Arrête la simulation
function stopSimulation() {
    clearInterval(simulationInterval); // Supprime l'intervalle
}

// Vérifie si un paquet est autorisé
function checkPacket(ip, port) {
    const rule = rules.find(r => r.ip === ip && r.port === port);
    // Par défaut autorisé si aucune règle ne correspond
    return rule ? rule.action === 'allow' : true;
}