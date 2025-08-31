// BlockHub - Estilo Remix para facilitar testing
// Usar exactamente como en Remix IDE

// CONFIGURACIÓN - DIRECCIONES REALES DE LOS CONTRATOS DESPLEGADOS
const FACTORY_ADDRESS = "0x3B804f2CF9a164d9384F6ee6259C8fFbABCC76B7"; // ✅ RepoFactory
const POAP_ADDRESS = "0x4b74468BCC47b92ffE6BD98989afF558536Eb1Af";     // ✅ POAP

// Variables globales (como en Remix)
let provider = null;
let signer = null;
let factoryContract = null;
let poapContract = null;
let factoryAbi = null;
let poapAbi = null;

// Función para inicializar (como en Remix)
async function initializeRemixStyle() {
    try {
        console.log('🚀 Inicializando estilo Remix...');
        
        // Verificar MetaMask
        if (typeof window.ethereum === 'undefined') {
            throw new Error('MetaMask no está instalado');
        }
        
        // Inicializar Ethers.js
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        
        const address = await signer.getAddress();
        console.log('🔗 Cuenta conectada:', address);
        
        // Cargar ABIs
        factoryAbi = await loadABI('ABI conections/RepoFactory_abi.json');
        poapAbi = await loadABI('ABI conections/POAP_abi.json');
        
        // Crear contratos (EXACTAMENTE como en Remix)
        factoryContract = new ethers.Contract(FACTORY_ADDRESS, factoryAbi, signer);
        poapContract = new ethers.Contract(POAP_ADDRESS, poapAbi, signer);
        
        console.log('✅ Inicialización completada - estilo Remix');
        console.log('📋 Usar: await factoryContract.createRepository("RepoName", "CID")');
        
        return {
            provider,
            signer,
            factoryContract,
            poapContract,
            address
        };
        
    } catch (error) {
        console.error('❌ Error inicializando:', error);
        throw error;
    }
}

// Cargar ABI (helper function)
async function loadABI(filepath) {
    try {
        const response = await fetch(filepath);
        if (!response.ok) {
            throw new Error(`Error cargando ABI: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`❌ Error cargando ABI desde ${filepath}:`, error);
        throw error;
    }
}

// Función wrapper para crear repositorio (como en Remix)
async function createRepository(repoName, cid) {
    try {
        console.log('📝 REMIX STYLE: Creando repositorio...');
        console.log('📁 Nombre:', repoName);
        console.log('🔗 CID:', cid);
        
        if (!factoryContract) {
            throw new Error('Contratos no inicializados. Llama a initializeRemixStyle() primero.');
        }
        
        // EXACTAMENTE COMO EN REMIX
        console.log('📞 Ejecutando: await factoryContract.createRepository("' + repoName + '", "' + cid + '")');
        
        const tx = await factoryContract.createRepository(repoName, cid);
        console.log('⏳ Transacción enviada:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ Transacción confirmada!');
        console.log('📋 Receipt:', receipt);
        
        // Buscar eventos
        const events = receipt.events || [];
        console.log('🔍 Eventos encontrados:', events.length);
        
        for (const event of events) {
            if (event.event === 'createdSuccessfully') {
                console.log('🎉 Evento createdSuccessfully encontrado!');
                console.log('📋 Args:', event.args);
                
                const tokenId = event.args.tokenId?.toString();
                const owner = event.args.owner;
                const repoCID = event.args.repoCID;
                
                console.log('🎯 Resultado:');
                console.log('  Token ID:', tokenId);
                console.log('  Owner:', owner);
                console.log('  Repo CID:', repoCID);
                console.log('  ¿CID coincide?:', repoCID === cid);
                
                return {
                    success: true,
                    transactionHash: receipt.transactionHash,
                    tokenId: tokenId,
                    owner: owner,
                    repoCID: repoCID,
                    blockNumber: receipt.blockNumber,
                    gasUsed: receipt.gasUsed?.toString()
                };
            }
        }
        
        // Si no encontró el evento específico
        console.warn('⚠️ Evento createdSuccessfully no encontrado');
        console.log('📋 Todos los eventos:', events.map(e => e.event));
        
        return {
            success: true,
            transactionHash: receipt.transactionHash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed?.toString(),
            note: 'Transacción exitosa pero evento no encontrado'
        };
        
    } catch (error) {
        console.error('❌ Error creando repositorio:', error);
        throw error;
    }
}

// Helper para verificar conexión
function checkConnection() {
    if (!provider || !signer || !factoryContract) {
        console.error('❌ No inicializado. Ejecuta: await initializeRemixStyle()');
        return false;
    }
    console.log('✅ Conexión OK');
    return true;
}

// Helper para obtener información de la cuenta
async function getAccountInfo() {
    if (!signer) {
        throw new Error('Signer no inicializado');
    }
    
    const address = await signer.getAddress();
    const balance = await provider.getBalance(address);
    const network = await provider.getNetwork();
    
    return {
        address,
        balance: ethers.utils.formatEther(balance),
        network: network.name,
        chainId: network.chainId
    };
}

// 📋 OBTENER TODOS LOS REPOSITORIOS
async function getAllRepositories() {
    if (!factoryContract) {
        console.error("❌ Factory contract no inicializado. Llama a initializeRemixStyle() primero.");
        return null;
    }
    
    try {
        console.log("📋 Obteniendo todos los repositorios...");
        
        const result = await factoryContract.getAllRepos();
        console.log("✅ Resultado bruto:", result);
        
        const [folderCIDs, tokens, owners, names] = result;
        
        const repositories = folderCIDs.map((cid, index) => ({
            tokenId: tokens[index].toString(),
            name: names[index],
            cid: cid,
            owner: owners[index],
            index: index
        }));
        
        console.log(`📁 Se encontraron ${repositories.length} repositorios:`);
        repositories.forEach((repo, i) => {
            console.log(`  ${i + 1}. ${repo.name} (Token: ${repo.tokenId}) - ${repo.owner.substring(0, 8)}...`);
        });
        
        return repositories;
        
    } catch (error) {
        console.error("❌ Error obteniendo repositorios:", error);
        return null;
    }
}

// 💰 DEPOSITAR FONDOS A REPOSITORIO
async function depositToRepo(tokenId, ethAmount) {
    if (!factoryContract) {
        console.error("❌ Factory contract no inicializado. Llama a initializeRemixStyle() primero.");
        return null;
    }
    
    try {
        console.log(`💰 Depositando ${ethAmount} ETH al repositorio ${tokenId}...`);
        
        // Convertir ETH a Wei
        const weiAmount = ethers.utils.parseEther(ethAmount.toString());
        console.log(`💰 Enviando ${ethAmount} ETH (${weiAmount.toString()} Wei)`);
        
        // EXACTAMENTE COMO EN REMIX
        console.log('📞 Ejecutando: await factoryContract.depositToRepo(' + tokenId + ', { value: "' + weiAmount.toString() + '" })');
        
        const tx = await factoryContract.depositToRepo(tokenId, {
            value: weiAmount
        });
        
        console.log('⏳ Transacción enviada:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ Depósito confirmado!');
        console.log('📋 Receipt:', receipt);
        
        // Buscar evento depositedETH
        const events = receipt.events || [];
        console.log('🔍 Eventos encontrados:', events.length);
        
        for (const event of events) {
            if (event.event === 'depositedETH') {
                const [repoTokenId, depositor, amount] = event.args;
                console.log('🎉 Evento depositedETH:', {
                    tokenId: repoTokenId.toString(),
                    depositor: depositor,
                    amount: ethers.utils.formatEther(amount) + ' ETH'
                });
                
                return {
                    success: true,
                    transactionHash: receipt.transactionHash,
                    tokenId: repoTokenId.toString(),
                    depositor: depositor,
                    amount: ethers.utils.formatEther(amount),
                    gasUsed: receipt.gasUsed.toString()
                };
            }
        }
        
        return {
            success: true,
            transactionHash: receipt.transactionHash,
            tokenId: tokenId,
            amount: ethAmount
        };
        
    } catch (error) {
        console.error('❌ Error en depósito:', error.message);
        return { success: false, error: error.message };
    }
}

// ✅ APROBAR COMMIT (SOLO DUEÑO)
async function approveCommit(tokenId, commitIndex, reward) {
    if (!factoryContract) {
        console.error("❌ Factory contract no inicializado. Llama a initializeRemixStyle() primero.");
        return null;
    }
    
    try {
        console.log(`✅ Aprobando commit ${commitIndex} del repositorio ${tokenId} con recompensa ${reward} ETH...`);
        
        // Convertir recompensa ETH a Wei
        const weiReward = ethers.utils.parseEther(reward.toString());
        console.log(`💰 Recompensa: ${reward} ETH (${weiReward.toString()} Wei)`);
        
        // EXACTAMENTE COMO EN REMIX
        console.log('📞 Ejecutando: await factoryContract.approveCommit(' + tokenId + ', ' + commitIndex + ', "' + weiReward.toString() + '", { value: "' + weiReward.toString() + '" })');
        
        const tx = await factoryContract.approveCommit(
            tokenId,
            commitIndex,
            weiReward,
            { value: weiReward } // Enviar ETH para la recompensa
        );
        
        console.log('⏳ Transacción enviada:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ Commit aprobado!');
        console.log('📋 Receipt:', receipt);
        
        // Buscar eventos
        const events = receipt.events || [];
        console.log('🔍 Eventos encontrados:', events.length);
        
        let approvedEvent = null;
        let badgeEvents = [];
        
        for (const event of events) {
            if (event.event === 'approvedCommit') {
                approvedEvent = event;
                console.log('🎉 Evento approvedCommit:', {
                    tokenId: event.args[0].toString(),
                    owner: event.args[1],
                    folderCID: event.args[2]
                });
            } else if (event.event === 'BadgeMinted') {
                badgeEvents.push(event);
                console.log('🏆 Badge otorgado:', {
                    recipient: event.args[0],
                    badgeType: event.args[1].toString(),
                    reason: event.args[2]
                });
            } else if (event.event === 'StatsUpdated') {
                badgeEvents.push(event);
                console.log('📊 Stats actualizadas:', event.args);
            }
        }
        
        return {
            success: true,
            transactionHash: receipt.transactionHash,
            tokenId: tokenId,
            commitIndex: commitIndex,
            reward: reward,
            approvedEvent: approvedEvent,
            badgeEvents: badgeEvents,
            gasUsed: receipt.gasUsed.toString()
        };
        
    } catch (error) {
        console.error('❌ Error aprobando commit:', error.message);
        return { success: false, error: error.message };
    }
}

// 🚫 RECHAZAR COMMIT (SOLO DUEÑO)
async function rejectCommit(tokenId, commitIndex) {
    if (!factoryContract) {
        console.error("❌ Factory contract no inicializado. Llama a initializeRemixStyle() primero.");
        return null;
    }
    
    try {
        console.log(`🚫 Rechazando commit ${commitIndex} del repositorio ${tokenId}...`);
        
        // EXACTAMENTE COMO EN REMIX
        console.log('📞 Ejecutando: await factoryContract.rejectCommit(' + tokenId + ', ' + commitIndex + ')');
        
        const tx = await factoryContract.rejectCommit(
            tokenId,
            commitIndex
        );
        
        console.log('⏳ Transacción enviada:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ Commit rechazado!');
        console.log('📋 Receipt:', receipt);
        
        // Buscar eventos
        const events = receipt.events || [];
        console.log('🔍 Eventos encontrados:', events.length);
        
        let rejectedEvent = null;
        
        for (const event of events) {
            if (event.event === 'rejectedCommit') {
                rejectedEvent = event;
                console.log('🚫 Evento rejectedCommit:', {
                    committer: event.args[0],
                    owner: event.args[1],
                    folderCID: event.args[2]
                });
            }
        }
        
        return {
            success: true,
            transactionHash: receipt.transactionHash,
            tokenId: tokenId,
            commitIndex: commitIndex,
            rejectedEvent: rejectedEvent,
            gasUsed: receipt.gasUsed.toString()
        };
        
    } catch (error) {
        console.error('❌ Error rechazando commit:', error.message);
        return { success: false, error: error.message };
    }
}

// 🔗 OBTENER CID ESPECÍFICO DE UN COMMIT
async function getCommitCID(tokenId, commitIndex) {
    if (!factoryContract) {
        console.error("❌ Factory contract no inicializado. Llama a initializeRemixStyle() primero.");
        return null;
    }
    
    try {
        console.log(`🔗 Obteniendo CID del commit ${commitIndex} del repositorio ${tokenId}...`);
        
        // EXACTAMENTE COMO EN REMIX
        console.log('📞 Ejecutando: await factoryContract.getCommitCID(' + tokenId + ', ' + commitIndex + ')');
        
        const commitCID = await factoryContract.getCommitCID(tokenId, commitIndex);
        console.log(`✅ CID obtenido: ${commitCID}`);
        
        return commitCID;
        
    } catch (error) {
        console.error('❌ Error obteniendo CID del commit:', error.message);
        console.log('💡 La función getCommitCID podría no estar disponible en el contrato');
        return null;
    }
}

// 📋 OBTENER COMMITS DEL REPOSITORIO
async function retrieveCommits(tokenId) {
    if (!factoryContract) {
        console.error("❌ Factory contract no inicializado. Llama a initializeRemixStyle() primero.");
        return null;
    }
    
    try {
        console.log(`📋 Obteniendo commits del repositorio ${tokenId}...`);
        
        // EXACTAMENTE COMO EN REMIX
        console.log('📞 Ejecutando: await factoryContract.retrieveCommits(' + tokenId + ')');
        
        const commitsData = await factoryContract.retrieveCommits(tokenId);
        console.log('📥 Datos de commits recibidos:', commitsData);
        
        // Destructurar los arrays retornados: messages, timestamps, committers, status
        const [messages, timestamps, committers, statuses] = commitsData;
        
        console.log('📝 Messages:', messages);
        console.log('⏰ Timestamps:', timestamps.map(t => t.toString()));
        console.log('👤 Committers:', committers);
        console.log('📊 Statuses:', statuses.map(s => s.toString()));
        
        // Convertir a formato más manejable
        const commits = [];
        for (let i = 0; i < messages.length; i++) {
            const status = parseInt(statuses[i].toString());
            const timestamp = parseInt(timestamps[i].toString());
            
            commits.push({
                index: i,
                message: messages[i],
                timestamp: timestamp,
                timestampDate: new Date(timestamp * 1000), // Convert from seconds to ms
                committer: committers[i],
                status: status,
                statusText: status === 0 ? 'pending' : status === 1 ? 'approved' : 'rejected'
            });
            
            console.log(`📋 Commit #${i}:`, {
                message: messages[i],
                committer: committers[i],
                status: status === 0 ? 'pending' : status === 1 ? 'approved' : 'rejected',
                date: new Date(timestamp * 1000).toLocaleString()
            });
        }
        
        return {
            success: true,
            tokenId: tokenId,
            totalCommits: commits.length,
            commits: commits,
            raw: {
                messages: messages,
                timestamps: timestamps,
                committers: committers,
                statuses: statuses
            }
        };
        
    } catch (error) {
        console.error('❌ Error obteniendo commits:', error.message);
        return { success: false, error: error.message };
    }
}

// 🔄 PROCESAR NUEVO COMMIT
async function processNewCommit(tokenId, commitMessage, newCID) {
    if (!factoryContract) {
        console.error("❌ Factory contract no inicializado. Llama a initializeRemixStyle() primero.");
        return null;
    }
    
    try {
        console.log(`🔄 Procesando nuevo commit para token ${tokenId}...`);
        console.log(`📝 Mensaje: "${commitMessage}"`);
        console.log(`🔗 Nuevo CID: ${newCID}`);
        
        const tx = await factoryContract.processNewCommit(tokenId, commitMessage, newCID);
        console.log("⏳ Transacción enviada:", tx.hash);
        
        const receipt = await tx.wait();
        console.log("✅ Transacción confirmada:", receipt);
        
        const result = {
            success: true,
            transactionHash: receipt.transactionHash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString(),
            tokenId: tokenId,
            commitMessage: commitMessage,
            newCID: newCID,
            timestamp: Date.now()
        };
        
        console.log("🎉 ¡Commit procesado exitosamente!", result);
        return result;
        
    } catch (error) {
        console.error("❌ Error procesando commit:", error);
        return null;
    }
}

// 📊 OBTENER ESTADÍSTICAS RÁPIDAS
async function getRepositoryStats() {
    try {
        const repos = await getAllRepositories();
        if (!repos) return null;
        
        const currentAccount = await signer.getAddress();
        const myRepos = repos.filter(repo => repo.owner.toLowerCase() === currentAccount.toLowerCase());
        const uniqueOwners = new Set(repos.map(repo => repo.owner)).size;
        
        const stats = {
            totalRepositories: repos.length,
            myRepositories: myRepos.length,
            uniqueOwners: uniqueOwners,
            repositories: repos
        };
        
        console.log("📊 Estadísticas de repositorios:", stats);
        return stats;
        
    } catch (error) {
        console.error("❌ Error obteniendo estadísticas:", error);
        return null;
    }
}

// Hacer funciones disponibles globalmente
if (typeof window !== 'undefined') {
    window.initializeRemixStyle = initializeRemixStyle;
    window.createRepository = createRepository;
    window.checkConnection = checkConnection;
    window.getAccountInfo = getAccountInfo;
    window.getAllRepositories = getAllRepositories;
    window.processNewCommit = processNewCommit;
    window.depositToRepo = depositToRepo;
    window.approveCommit = approveCommit;
    window.rejectCommit = rejectCommit;
    window.retrieveCommits = retrieveCommits;
    window.getCommitCID = getCommitCID;
    window.getRepositoryStats = getRepositoryStats;
    window.factoryContract = factoryContract;
    window.poapContract = poapContract;
}

console.log('🔧 BlockHub Remix Style cargado');
console.log('📋 Funciones disponibles:');
console.log('  - await initializeRemixStyle()');
console.log('  - await createRepository("RepoName", "CID")');
console.log('  - await getAllRepositories()');
console.log('  - await processNewCommit(tokenId, "mensaje", "nuevoCID")');
console.log('  - await depositToRepo(tokenId, "0.01")');
console.log('  - await approveCommit(tokenId, commitIndex, "0.001")');
console.log('  - await rejectCommit(tokenId, commitIndex)');
console.log('  - await retrieveCommits(tokenId)');
console.log('  - await getCommitCID(tokenId, commitIndex)');
console.log('  - await getRepositoryStats()');
console.log('  - checkConnection()');
console.log('  - await getAccountInfo()');
console.log('🚀 ¡Listo para usar!');
