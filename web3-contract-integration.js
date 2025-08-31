// BlockHub Web3 Contract Integration
// Integración de contratos inteligentes con Pinata IPFS

class BlockHubWeb3Service {
    constructor() {
        this.web3 = null;
        this.ethers = null;
        this.provider = null;
        this.signer = null;
        this.account = null;
        this.repoFactoryContract = null;
        this.poapContract = null;
        this.isInitialized = false;
        
        // Contract addresses - DIRECCIONES REALES DESPLEGADAS
        this.contracts = {
            repoFactory: '0xE43A9e79b2231Ecf9a5C7Fee9d103Ca6845D90aE', // ✅ RepoFactory
            poap: '0x4b74468BCC47b92ffE6BD98989afF558536Eb1Af' // ✅ POAP
        };
    }

    // Inicializar Web3 y conectar con MetaMask
    async initializeWeb3() {
        try {
            // Verificar si MetaMask está instalado
            if (typeof window.ethereum !== 'undefined') {
                console.log('🦊 MetaMask detectado');
                
                // OPCIÓN 1: Web3.js (método original)
                this.web3 = new Web3(window.ethereum);
                
                // OPCIÓN 2: Ethers.js (método como Remix)
                if (typeof window.ethers !== 'undefined') {
                    this.provider = new window.ethers.providers.Web3Provider(window.ethereum);
                    this.signer = this.provider.getSigner();
                    console.log('📦 Ethers.js inicializado');
                }
                
                // Solicitar acceso a las cuentas
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts'
                });
                
                this.account = accounts[0];
                console.log('🔗 Cuenta conectada:', this.account);
                
                // Inicializar contratos
                await this.initializeContracts();
                
                this.isInitialized = true;
                console.log('✅ Web3 inicializado exitosamente');
                
                return true;
            } else {
                throw new Error('MetaMask no está instalado. Por favor instala MetaMask para continuar.');
            }
        } catch (error) {
            console.error('❌ Error inicializando Web3:', error);
            throw error;
        }
    }

    // Inicializar los contratos inteligentes
    async initializeContracts() {
        try {
            // Cargar ABIs
            const repoFactoryABI = await this.loadABI('ABI conections/RepoFactory_abi.json');
            const poapABI = await this.loadABI('ABI conections/POAP_abi.json');
            
            // Crear instancias de contratos con ETHERS.JS (como Remix)
            if (this.signer && typeof window.ethers !== 'undefined') {
                console.log('🔧 Inicializando contratos con Ethers.js...');
                
                this.repoFactoryContract = new window.ethers.Contract(
                    this.contracts.repoFactory,
                    repoFactoryABI,
                    this.signer
                );
                
                this.poapContract = new window.ethers.Contract(
                    this.contracts.poap,
                    poapABI,
                    this.signer
                );
                
                console.log('📋 Contratos inicializados con Ethers.js (estilo Remix)');
            } else {
                // Fallback a Web3.js
                console.log('🔧 Fallback: Inicializando contratos con Web3.js...');
                
                this.repoFactoryContract = new this.web3.eth.Contract(
                    repoFactoryABI,
                    this.contracts.repoFactory
                );
                
                this.poapContract = new this.web3.eth.Contract(
                    poapABI,
                    this.contracts.poap
                );
                
                console.log('📋 Contratos inicializados con Web3.js');
            }
            
        } catch (error) {
            console.error('❌ Error inicializando contratos:', error);
            throw error;
        }
    }

    // Cargar ABI desde archivo
    async loadABI(filepath) {
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

    // Verificar si Web3 está inicializado
    checkInitialization() {
        if (!this.isInitialized) {
            throw new Error('Web3 no está inicializado. Llama a initializeWeb3() primero.');
        }
    }

    // Crear repositorio en el contrato - MÉTODO REMIX/ETHERS.JS
    async createRepositoryWithEthers(repoName, ipfsCID) {
        this.checkInitialization();
        
        try {
            console.log('🚀 MÉTODO REMIX: Creando repositorio con Ethers.js...');
            console.log('📁 Nombre:', repoName);
            console.log('🔗 IPFS CID:', ipfsCID);
            
            if (!repoName || !ipfsCID) {
                throw new Error('Nombre del repositorio e IPFS CID son requeridos');
            }
            
            if (!this.signer || !this.repoFactoryContract) {
                throw new Error('Ethers.js no está inicializado correctamente');
            }
            
            // EXACTAMENTE COMO EN REMIX
            console.log('📞 Llamando: await factoryContract.createRepository("' + repoName + '", "' + ipfsCID + '")');
            const tx = await this.repoFactoryContract.createRepository(repoName, ipfsCID);
            
            console.log('⏳ Transacción enviada, esperando confirmación...');
            console.log('📄 TX Hash:', tx.hash);
            
            // Esperar confirmación
            const receipt = await tx.wait();
            
            console.log('✅ Transacción confirmada!');
            console.log('📋 Receipt:', receipt);
            
            // Buscar eventos en el receipt
            const events = receipt.events || [];
            console.log('🔍 Eventos encontrados:', events.length);
            
            let tokenId = null;
            let owner = null;
            let repoCID = null;
            
            // Buscar el evento createdSuccessfully
            for (const event of events) {
                console.log('📋 Evento:', event.event, event.args);
                if (event.event === 'createdSuccessfully') {
                    tokenId = event.args.tokenId?.toString();
                    owner = event.args.owner;
                    repoCID = event.args.repoCID;
                    break;
                }
            }
            
            console.log('🎯 Datos extraídos del evento:');
            console.log('  Token ID:', tokenId);
            console.log('  Owner:', owner);
            console.log('  Repo CID:', repoCID);
            console.log('  ¿CID coincide?:', repoCID === ipfsCID);
            
            return {
                success: true,
                method: 'ethers',
                transactionHash: receipt.transactionHash,
                tokenId: tokenId || ipfsCID,
                owner: owner || this.account,
                repoCID: repoCID || ipfsCID,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed?.toString(),
                originalCID: ipfsCID
            };
            
        } catch (error) {
            console.error('❌ Error con método Ethers.js:', error);
            throw error;
        }
    }

    // Crear repositorio en el contrato (función principal con fallback)
    async createRepository(repoName, ipfsCID, options = {}) {
        this.checkInitialization();
        
        // Intentar primero con Ethers.js (como Remix)
        if (this.signer && typeof window.ethers !== 'undefined') {
            try {
                return await this.createRepositoryWithEthers(repoName, ipfsCID);
            } catch (error) {
                console.warn('⚠️ Ethers.js falló, intentando con Web3.js...', error.message);
            }
        }
        
        // Fallback a Web3.js
        try {
            console.log('🔄 FALLBACK: Usando Web3.js...');
            console.log('📁 Nombre:', repoName);
            console.log('🔗 IPFS CID:', ipfsCID);
            
            if (!repoName || !ipfsCID) {
                throw new Error('Nombre del repositorio e IPFS CID son requeridos');
            }
            
            // Preparar la transacción
            const gasEstimate = await this.repoFactoryContract.methods
                .createRepository(repoName, ipfsCID)
                .estimateGas({ from: this.account });
            
            console.log('⛽ Gas estimado:', gasEstimate);
            
            // Ejecutar la transacción
            const result = await this.repoFactoryContract.methods
                .createRepository(repoName, ipfsCID)
                .send({
                    from: this.account,
                    gas: Math.floor(gasEstimate * 1.2),
                    ...options
                });
            
            console.log('✅ Repositorio creado exitosamente con Web3.js');
            console.log('📄 Hash de transacción:', result.transactionHash);
            
            // Extraer información del evento
            const repositoryCreatedEvent = result.events.createdSuccessfully || result.events['0'];
            
            if (repositoryCreatedEvent) {
                const { tokenId, owner, repoCID } = repositoryCreatedEvent.returnValues;
                
                return {
                    success: true,
                    method: 'web3',
                    transactionHash: result.transactionHash,
                    tokenId: tokenId || ipfsCID,
                    owner: owner,
                    repoCID: repoCID || ipfsCID,
                    blockNumber: result.blockNumber,
                    gasUsed: result.gasUsed,
                    originalCID: ipfsCID
                };
            } else {
                return {
                    success: true,
                    method: 'web3',
                    transactionHash: result.transactionHash,
                    tokenId: ipfsCID,
                    owner: this.account,
                    repoCID: ipfsCID,
                    blockNumber: result.blockNumber,
                    gasUsed: result.gasUsed,
                    originalCID: ipfsCID,
                    note: 'Token ID asignado desde CID (evento no encontrado)'
                };
            }
            
        } catch (error) {
            console.error('❌ Error creando repositorio:', error);
            throw error;
        }
    }

    // Obtener repositorios del usuario
    async getUserRepositories() {
        this.checkInitialization();
        
        try {
            console.log('📚 Obteniendo repositorios del usuario...');
            
            const result = await this.repoFactoryContract.methods
                .getAllReposByOwner()
                .call({ from: this.account });
            
            const [folderCIDs, tokens, names] = result;
            
            const repositories = folderCIDs.map((cid, index) => ({
                tokenId: tokens[index],
                name: names[index],
                ipfsCID: cid,
                owner: this.account
            }));
            
            console.log(`📁 Se encontraron ${repositories.length} repositorios`);
            return repositories;
            
        } catch (error) {
            console.error('❌ Error obteniendo repositorios:', error);
            throw error;
        }
    }

    // Obtener todos los repositorios (públicos)
    async getAllRepositories() {
        try {
            console.log('🌍 Obteniendo todos los repositorios...');
            
            if (!this.repoFactoryContract) {
                throw new Error('Contrato no inicializado');
            }

            let result;
            
            // Intentar con Ethers.js primero
            if (this.ethers && this.repoFactoryContract.getAllRepos) {
                try {
                    console.log('📦 Usando Ethers.js para getAllRepos...');
                    result = await this.repoFactoryContract.getAllRepos();
                    console.log('✅ Resultado Ethers.js:', result);
                } catch (ethersError) {
                    console.log('⚠️ Ethers.js falló, intentando Web3.js...', ethersError.message);
                }
            }

            // Fallback a Web3.js si Ethers.js falla
            if (!result && this.web3 && this.repoFactoryContract.methods) {
                console.log('🕸️ Usando Web3.js para getAllRepos...');
                result = await this.repoFactoryContract.methods.getAllRepos().call();
                console.log('✅ Resultado Web3.js:', result);
            }

            if (!result) {
                throw new Error('No se pudo obtener los repositorios');
            }

            // Procesar los resultados
            const [folderCIDs, tokens, owners, names] = result;
            
            const repositories = folderCIDs.map((cid, index) => ({
                tokenId: tokens[index].toString(),
                name: names[index],
                cid: cid,
                ipfsCID: cid, // Mantener compatibilidad
                owner: owners[index],
                index: index
            }));
            
            console.log(`🌐 Se encontraron ${repositories.length} repositorios públicos`);
            
            return {
                success: true,
                repositories: repositories,
                totalCount: repositories.length
            };
            
        } catch (error) {
            console.error('❌ Error obteniendo repositorios públicos:', error);
            return {
                success: false,
                error: error.message,
                repositories: []
            };
        }
    }

    // Depositar ETH a un repositorio
    async depositToRepository(tokenId, amount) {
        this.checkInitialization();
        
        try {
            console.log(`💰 Depositando ${amount} ETH al repositorio ${tokenId}...`);
            
            const amountWei = this.web3.utils.toWei(amount.toString(), 'ether');
            
            const result = await this.repoFactoryContract.methods
                .depositToRepo(tokenId)
                .send({
                    from: this.account,
                    value: amountWei
                });
            
            console.log('✅ Depósito realizado exitosamente');
            console.log('📄 Hash de transacción:', result.transactionHash);
            
            return {
                success: true,
                transactionHash: result.transactionHash,
                amount: amount,
                tokenId: tokenId
            };
            
        } catch (error) {
            console.error('❌ Error depositando a repositorio:', error);
            throw error;
        }
    }

    // Obtener balance de un repositorio
    async getRepositoryBalance(tokenId) {
        this.checkInitialization();
        
        try {
            const balanceWei = await this.repoFactoryContract.methods
                .getBalance(tokenId)
                .call();
            
            const balanceEth = this.web3.utils.fromWei(balanceWei, 'ether');
            
            return {
                tokenId: tokenId,
                balanceWei: balanceWei,
                balanceEth: balanceEth
            };
            
        } catch (error) {
            console.error('❌ Error obteniendo balance del repositorio:', error);
            throw error;
        }
    }

    // Depositar fondos a un repositorio
    async depositToRepo(tokenId, ethAmount) {
        try {
            console.log(`💰 Depositando ${ethAmount} ETH al repositorio ${tokenId}...`);
            
            if (!this.repoFactoryContract) {
                throw new Error('Contrato no inicializado');
            }

            if (!ethAmount || ethAmount <= 0) {
                throw new Error('Cantidad de ETH debe ser mayor a 0');
            }

            let result;
            
            // Intentar con Ethers.js primero
            if (this.ethers && this.repoFactoryContract.depositToRepo) {
                try {
                    console.log('📦 Usando Ethers.js para depositToRepo...');
                    
                    // Convertir ETH a Wei
                    const weiAmount = this.ethers.utils.parseEther(ethAmount.toString());
                    console.log(`💰 Enviando ${ethAmount} ETH (${weiAmount.toString()} Wei)`);
                    
                    const tx = await this.repoFactoryContract.depositToRepo(tokenId, {
                        value: weiAmount
                    });
                    console.log('⏳ Transacción de depósito enviada:', tx.hash);
                    
                    const receipt = await tx.wait();
                    console.log('✅ Depósito confirmado:', receipt);

                    // Buscar evento depositedETH
                    const depositEvent = receipt.events?.find(e => e.event === 'depositedETH');
                    if (depositEvent) {
                        console.log('🎉 Evento depositedETH:', depositEvent.args);
                    }

                    result = {
                        success: true,
                        transactionHash: receipt.transactionHash,
                        blockNumber: receipt.blockNumber,
                        tokenId: tokenId,
                        amount: ethAmount,
                        gasUsed: receipt.gasUsed.toString(),
                        event: depositEvent?.args || null
                    };
                    
                } catch (ethersError) {
                    console.error('❌ Error con Ethers.js:', ethersError);
                    throw ethersError;
                }
            } else {
                // Fallback a Web3.js
                console.log('🔄 Fallback a Web3.js para depositToRepo...');
                
                if (!this.web3 || !this.repoFactoryContractWeb3) {
                    throw new Error('Web3.js no disponible como fallback');
                }
                
                const accounts = await this.web3.eth.getAccounts();
                if (accounts.length === 0) {
                    throw new Error('No hay cuentas conectadas');
                }
                
                const weiAmount = this.web3.utils.toWei(ethAmount.toString(), 'ether');
                
                const tx = await this.repoFactoryContractWeb3.methods.depositToRepo(tokenId).send({
                    from: accounts[0],
                    value: weiAmount
                });
                
                result = {
                    success: true,
                    transactionHash: tx.transactionHash,
                    blockNumber: tx.blockNumber,
                    tokenId: tokenId,
                    amount: ethAmount,
                    gasUsed: tx.gasUsed.toString()
                };
            }

            console.log('🎉 Depósito exitoso:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Error en depósito:', error);
            throw new Error(`Error depositando fondos: ${error.message}`);
        }
    }

    // Aprobar un commit (solo dueño del repositorio)
    async approveCommit(tokenId, commitIndex, reward) {
        try {
            console.log(`✅ Aprobando commit ${commitIndex} del repositorio ${tokenId} con recompensa ${reward} ETH...`);
            
            if (!this.repoFactoryContract) {
                throw new Error('Contrato no inicializado');
            }

            if (typeof commitIndex !== 'number' || commitIndex < 0) {
                throw new Error('Índice de commit debe ser un número válido');
            }

            if (!reward || reward <= 0) {
                throw new Error('Recompensa debe ser mayor a 0');
            }

            let result;
            
            // Intentar con Ethers.js primero
            if (this.ethers && this.repoFactoryContract.approveCommit) {
                try {
                    console.log('📦 Usando Ethers.js para approveCommit...');
                    
                    // Convertir recompensa ETH a Wei
                    const weiReward = this.ethers.utils.parseEther(reward.toString());
                    console.log(`💰 Recompensa: ${reward} ETH (${weiReward.toString()} Wei)`);
                    
                    const tx = await this.repoFactoryContract.approveCommit(
                        tokenId,
                        commitIndex, 
                        weiReward,
                        { value: weiReward } // Enviar ETH para la recompensa
                    );
                    console.log('⏳ Transacción de aprobación enviada:', tx.hash);
                    
                    const receipt = await tx.wait();
                    console.log('✅ Commit aprobado:', receipt);

                    // Buscar eventos relevantes
                    const approvedEvent = receipt.events?.find(e => e.event === 'approvedCommit');
                    if (approvedEvent) {
                        console.log('🎉 Evento approvedCommit:', approvedEvent.args);
                    }

                    // Buscar eventos de badges si existen
                    const badgeEvents = receipt.events?.filter(e => e.event === 'BadgeMinted' || e.event === 'StatsUpdated');
                    if (badgeEvents && badgeEvents.length > 0) {
                        console.log('🏆 Eventos de badges:', badgeEvents);
                    }

                    result = {
                        success: true,
                        transactionHash: receipt.transactionHash,
                        blockNumber: receipt.blockNumber,
                        tokenId: tokenId,
                        commitIndex: commitIndex,
                        reward: reward,
                        gasUsed: receipt.gasUsed.toString(),
                        approvedEvent: approvedEvent?.args || null,
                        badgeEvents: badgeEvents || []
                    };
                    
                } catch (ethersError) {
                    console.error('❌ Error con Ethers.js:', ethersError);
                    throw ethersError;
                }
            } else {
                // Fallback a Web3.js
                console.log('🔄 Fallback a Web3.js para approveCommit...');
                
                if (!this.web3 || !this.repoFactoryContractWeb3) {
                    throw new Error('Web3.js no disponible como fallback');
                }
                
                const accounts = await this.web3.eth.getAccounts();
                if (accounts.length === 0) {
                    throw new Error('No hay cuentas conectadas');
                }
                
                const weiReward = this.web3.utils.toWei(reward.toString(), 'ether');
                
                const tx = await this.repoFactoryContractWeb3.methods.approveCommit(
                    tokenId, commitIndex, weiReward
                ).send({
                    from: accounts[0],
                    value: weiReward
                });
                
                result = {
                    success: true,
                    transactionHash: tx.transactionHash,
                    blockNumber: tx.blockNumber,
                    tokenId: tokenId,
                    commitIndex: commitIndex,
                    reward: reward,
                    gasUsed: tx.gasUsed.toString()
                };
            }

            console.log('🎉 Aprobación exitosa:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Error aprobando commit:', error);
            throw new Error(`Error aprobando commit: ${error.message}`);
        }
    }

    // Obtener todos los commits de un repositorio
    async retrieveCommits(tokenId) {
        try {
            console.log(`📋 Obteniendo commits del repositorio ${tokenId}...`);
            
            if (!this.repoFactoryContract) {
                throw new Error('Contrato no inicializado');
            }

            let result;
            
            // Intentar con Ethers.js primero
            if (this.ethers && this.repoFactoryContract.retrieveCommits) {
                try {
                    console.log('📦 Usando Ethers.js para retrieveCommits...');
                    
                    const commitsData = await this.repoFactoryContract.retrieveCommits(tokenId);
                    console.log('📥 Datos de commits recibidos:', commitsData);
                    
                    // Destructurar los arrays retornados (incluyendo commitCID)
                    const [messages, timestamps, committers, statuses, commitCIDs] = commitsData;
                    
                    console.log('📥 Arrays destructurados:', {
                        messages: messages.length,
                        timestamps: timestamps.length,
                        committers: committers.length,
                        statuses: statuses.length,
                        commitCIDs: commitCIDs?.length || 'No disponible'
                    });
                    
                    // Convertir a formato más manejable
                    const commits = [];
                    for (let i = 0; i < messages.length; i++) {
                        commits.push({
                            index: i,
                            message: messages[i],
                            timestamp: parseInt(timestamps[i].toString()),
                            committer: committers[i],
                            status: parseInt(statuses[i].toString()), // 0=pending, 1=approved, 2=rejected
                            statusText: this.getCommitStatusText(parseInt(statuses[i].toString())),
                            cid: commitCIDs && commitCIDs[i] ? commitCIDs[i] : null // ✅ CID específico del commit
                        });
                    }
                    
                    result = {
                        success: true,
                        tokenId: tokenId,
                        totalCommits: commits.length,
                        commits: commits,
                        raw: {
                            messages: messages,
                            timestamps: timestamps,
                            committers: committers,
                            statuses: statuses,
                            commitCIDs: commitCIDs
                        }
                    };
                    
                } catch (ethersError) {
                    console.error('❌ Error con Ethers.js:', ethersError);
                    throw ethersError;
                }
            } else {
                // Fallback a Web3.js
                console.log('🔄 Fallback a Web3.js para retrieveCommits...');
                
                if (!this.web3 || !this.repoFactoryContractWeb3) {
                    throw new Error('Web3.js no disponible como fallback');
                }
                
                const commitsData = await this.repoFactoryContractWeb3.methods.retrieveCommits(tokenId).call();
                
                console.log('📥 Datos Web3.js recibidos:', commitsData);
                
                const commits = [];
                for (let i = 0; i < commitsData.messages.length; i++) {
                    commits.push({
                        index: i,
                        message: commitsData.messages[i],
                        timestamp: parseInt(commitsData.timestamps[i]),
                        committer: commitsData.committers[i],
                        status: parseInt(commitsData.status[i]),
                        statusText: this.getCommitStatusText(parseInt(commitsData.status[i])),
                        cid: commitsData.commitCID && commitsData.commitCID[i] ? commitsData.commitCID[i] : null // ✅ CID específico del commit
                    });
                }
                
                result = {
                    success: true,
                    tokenId: tokenId,
                    totalCommits: commits.length,
                    commits: commits
                };
            }

            console.log('📋 Commits obtenidos exitosamente:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Error obteniendo commits:', error);
            throw new Error(`Error obteniendo commits: ${error.message}`);
        }
    }

    // Obtener CID específico de un commit
    async getCommitCID(tokenId, commitIndex) {
        try {
            console.log(`🔗 Obteniendo CID del commit ${commitIndex} del repositorio ${tokenId}...`);
            
            if (!this.repoFactoryContract) {
                throw new Error('Contrato no inicializado');
            }

            // Intentar con Ethers.js primero
            if (this.ethers && this.repoFactoryContract.getCommitCID) {
                try {
                    console.log('📦 Usando Ethers.js para getCommitCID...');
                    
                    const commitCID = await this.repoFactoryContract.getCommitCID(tokenId, commitIndex);
                    console.log(`🔗 CID del commit ${commitIndex}: ${commitCID}`);
                    
                    return commitCID;
                    
                } catch (ethersError) {
                    console.error('❌ Error con Ethers.js para getCommitCID:', ethersError);
                    throw ethersError;
                }
            } else {
                // Fallback a Web3.js
                console.log('🔄 Fallback a Web3.js para getCommitCID...');
                
                if (!this.web3 || !this.repoFactoryContractWeb3) {
                    throw new Error('Web3.js no disponible como fallback');
                }
                
                const commitCID = await this.repoFactoryContractWeb3.methods.getCommitCID(tokenId, commitIndex).call();
                return commitCID;
            }
            
        } catch (error) {
            console.error('❌ Error obteniendo CID del commit:', error);
            // Si no hay función getCommitCID en el contrato, devolver null
            console.log('💡 Función getCommitCID no disponible en el contrato');
            return null;
        }
    }

    // Utility para convertir status numérico a texto
    getCommitStatusText(status) {
        switch (status) {
            case 0: return 'pending';
            case 1: return 'approved';
            case 2: return 'rejected';
            default: return 'unknown';
        }
    }

    // Rechazar un commit (solo dueño del repositorio)
    async rejectCommit(tokenId, commitIndex) {
        try {
            console.log(`❌ Rechazando commit ${commitIndex} del repositorio ${tokenId}...`);
            
            if (!this.repoFactoryContract) {
                throw new Error('Contrato no inicializado');
            }

            if (typeof commitIndex !== 'number' || commitIndex < 0) {
                throw new Error('Índice de commit debe ser un número válido');
            }

            let result;
            
            // Intentar con Ethers.js primero
            if (this.ethers && this.repoFactoryContract.rejectCommit) {
                try {
                    console.log('📦 Usando Ethers.js para rejectCommit...');
                    
                    const tx = await this.repoFactoryContract.rejectCommit(
                        tokenId,
                        commitIndex
                    );
                    console.log('⏳ Transacción de rechazo enviada:', tx.hash);
                    
                    const receipt = await tx.wait();
                    console.log('✅ Commit rechazado:', receipt);

                    // Buscar evento rejectedCommit
                    const rejectedEvent = receipt.events?.find(e => e.event === 'rejectedCommit');
                    if (rejectedEvent) {
                        console.log('🚫 Evento rejectedCommit:', rejectedEvent.args);
                    }

                    result = {
                        success: true,
                        transactionHash: receipt.transactionHash,
                        blockNumber: receipt.blockNumber,
                        tokenId: tokenId,
                        commitIndex: commitIndex,
                        gasUsed: receipt.gasUsed.toString(),
                        rejectedEvent: rejectedEvent?.args || null
                    };
                    
                } catch (ethersError) {
                    console.error('❌ Error con Ethers.js:', ethersError);
                    throw ethersError;
                }
            } else {
                // Fallback a Web3.js
                console.log('🔄 Fallback a Web3.js para rejectCommit...');
                
                if (!this.web3 || !this.repoFactoryContractWeb3) {
                    throw new Error('Web3.js no disponible como fallback');
                }
                
                const accounts = await this.web3.eth.getAccounts();
                if (accounts.length === 0) {
                    throw new Error('No hay cuentas conectadas');
                }
                
                const tx = await this.repoFactoryContractWeb3.methods.rejectCommit(
                    tokenId, commitIndex
                ).send({
                    from: accounts[0]
                });
                
                result = {
                    success: true,
                    transactionHash: tx.transactionHash,
                    blockNumber: tx.blockNumber,
                    tokenId: tokenId,
                    commitIndex: commitIndex,
                    gasUsed: tx.gasUsed.toString()
                };
            }

            console.log('🚫 Rechazo exitoso:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Error rechazando commit:', error);
            throw new Error(`Error rechazando commit: ${error.message}`);
        }
    }

    // Hacer un commit a un repositorio
    async processNewCommit(tokenId, message, commitCID) {
        try {
            console.log(`📝 Procesando nuevo commit para repositorio ${tokenId}...`);
            console.log(`💬 Mensaje: ${message}`);
            console.log(`🔗 CID: ${commitCID}`);
            
            if (!this.repoFactoryContract) {
                throw new Error('Contrato no inicializado');
            }

            let result;
            
            // Intentar con Ethers.js primero
            if (this.ethers && this.repoFactoryContract.processNewCommit) {
                try {
                    console.log('📦 Usando Ethers.js para processNewCommit...');
                    const tx = await this.repoFactoryContract.processNewCommit(
                        tokenId, 
                        message, 
                        commitCID
                    );
                    console.log('⏳ Transacción enviada:', tx.hash);
                    
                    const receipt = await tx.wait();
                    console.log('✅ Transacción confirmada:', receipt);
                    
                    result = {
                        success: true,
                        transactionHash: receipt.transactionHash,
                        blockNumber: receipt.blockNumber,
                        gasUsed: receipt.gasUsed.toString(),
                        tokenId: tokenId,
                        message: message,
                        commitCID: commitCID,
                        timestamp: Date.now()
                    };
                    
                } catch (ethersError) {
                    console.log('⚠️ Ethers.js falló, intentando Web3.js...', ethersError.message);
                }
            }

            // Fallback a Web3.js si Ethers.js falla
            if (!result && this.web3 && this.repoFactoryContract.methods) {
                console.log('🕸️ Usando Web3.js para processNewCommit...');
                
                const txObject = this.repoFactoryContract.methods.processNewCommit(
                    tokenId, 
                    message, 
                    commitCID
                );
                
                const gasEstimate = await txObject.estimateGas({ from: this.account });
                console.log('⛽ Gas estimado:', gasEstimate);
                
                const receipt = await txObject.send({
                    from: this.account,
                    gas: Math.floor(gasEstimate * 1.2)
                });
                
                console.log('✅ Transacción Web3.js confirmada:', receipt);
                
                result = {
                    success: true,
                    transactionHash: receipt.transactionHash,
                    blockNumber: receipt.blockNumber,
                    gasUsed: receipt.gasUsed.toString(),
                    tokenId: tokenId,
                    message: message,
                    commitCID: commitCID,
                    timestamp: Date.now()
                };
            }

            if (!result) {
                throw new Error('No se pudo procesar el commit');
            }

            console.log('🎉 ¡Commit procesado exitosamente!', result);
            return result;
            
        } catch (error) {
            console.error('❌ Error procesando commit:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Aprobar un commit y dar recompensa
    async approveCommit(tokenId, commitIndex, rewardAmount) {
        this.checkInitialization();
        
        try {
            console.log(`✅ Aprobando commit ${commitIndex} del repositorio ${tokenId}...`);
            
            const rewardWei = this.web3.utils.toWei(rewardAmount.toString(), 'ether');
            
            const result = await this.repoFactoryContract.methods
                .approveCommit(tokenId, commitIndex, rewardWei)
                .send({
                    from: this.account,
                    value: rewardWei
                });
            
            console.log('✅ Commit aprobado y recompensa enviada');
            console.log('📄 Hash de transacción:', result.transactionHash);
            
            return {
                success: true,
                transactionHash: result.transactionHash,
                tokenId: tokenId,
                commitIndex: commitIndex,
                rewardAmount: rewardAmount
            };
            
        } catch (error) {
            console.error('❌ Error aprobando commit:', error);
            throw error;
        }
    }

    // Obtener commits de un repositorio
    async getRepositoryCommits(tokenId) {
        this.checkInitialization();
        
        try {
            const result = await this.repoFactoryContract.methods
                .retrieveCommits(tokenId)
                .call();
            
            const [messages, timestamps, committers, status] = result;
            
            const commits = messages.map((message, index) => ({
                message: message,
                timestamp: timestamps[index],
                committer: committers[index],
                status: status[index],
                index: index
            }));
            
            return commits;
            
        } catch (error) {
            console.error('❌ Error obteniendo commits:', error);
            throw error;
        }
    }

    // Obtener información de la cuenta conectada
    getAccountInfo() {
        this.checkInitialization();
        
        return {
            account: this.account,
            isConnected: !!this.account,
            contracts: this.contracts
        };
    }

    // Formatear dirección de Ethereum
    formatAddress(address) {
        if (!address) return '';
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }

    // Convertir Wei a ETH
    weiToEth(weiAmount) {
        return this.web3.utils.fromWei(weiAmount.toString(), 'ether');
    }

    // Convertir ETH a Wei
    ethToWei(ethAmount) {
        return this.web3.utils.toWei(ethAmount.toString(), 'ether');
    }
}

// Crear instancia global del servicio
const blockHubWeb3 = new BlockHubWeb3Service();

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.BlockHubWeb3Service = BlockHubWeb3Service;
    window.blockHubWeb3 = blockHubWeb3;
}

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BlockHubWeb3Service, blockHubWeb3 };
}

console.log('🌐 BlockHub Web3 Service cargado');
console.log('📋 Instancia disponible en: window.blockHubWeb3');
