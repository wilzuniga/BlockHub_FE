// Configuración de Pinata para BlockHub
// Instrucciones para configurar Pinata:

/*
1. Ve a https://pinata.cloud y crea una cuenta
2. Genera un JWT token en el dashboard
3. Reemplaza 'TU_JWT_TOKEN_AQUI' con tu token real
4. Opcional: Configura tu gateway personalizado
*/

const PINATA_CONFIG = {
    // 🔑 Reemplaza con tu JWT token de Pinata
    jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiN2M2MDgxOS00NWE5LTRhNTYtOTA0NC0wMmY4OWY5ZTY1MjMiLCJlbWFpbCI6IndpbG1lcnp1bmlnYS5hbnRAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImQxNjRkMTg3NTRiNWRkNWZiNzU1Iiwic2NvcGVkS2V5U2VjcmV0IjoiNGIzNjNjNGVlZDEzYjNhZTM1M2E4MjU0MmJjMTkyOWQ3ZWM4ZDUwOTliOTkwOGRhMzNmOWNlMDY1OGIyYjE2MyIsImV4cCI6MTc4ODA3MzYxNX0.oa_7CC5q7rE1h4-9ne5Mk3v7UAuDVcYDAmcU9mO9C1I',
    
    // 🌐 Gateway de Pinata (puedes usar el público o tu gateway personalizado)
    gateway: 'https://gateway.pinata.cloud/ipfs/',
    
    // 📡 API endpoints de Pinata
    api: {
        base: 'https://api.pinata.cloud',
        pinFile: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
        pinJson: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        unpin: 'https://api.pinata.cloud/pinning/unpin',
        list: 'https://api.pinata.cloud/data/pinList'
    }
};

// 📝 Funciones de utilidad para Pinata
class PinataService {
    constructor(config) {
        this.config = config;
        this.isConfigured = config.jwt && config.jwt !== 'TU_JWT_TOKEN_AQUI';
    }

    // Verificar si Pinata está configurado
    checkConfiguration() {
        if (!this.isConfigured) {
            throw new Error('Pinata no está configurado. Por favor configura tu JWT token en pinata-config.js');
        }
    }

    // Subir archivo de texto a Pinata
    async uploadFile(content, fileName, options = {}) {
        this.checkConfiguration();
        
        try {
            const formData = new FormData();
            formData.append('file', new Blob([content], { type: 'text/plain' }), fileName);
            
            // Metadatos opcionales
            if (options.name || options.description) {
                const metadata = JSON.stringify({
                    name: options.name || fileName,
                    description: options.description || `Archivo subido desde BlockHub: ${fileName}`
                });
                formData.append('pinataMetadata', metadata);
            }

            const response = await fetch(this.config.api.pinFile, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.jwt}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error de Pinata: ${errorData.error || response.statusText}`);
            }

            const result = await response.json();
            return {
                hash: result.IpfsHash,
                size: result.PinSize,
                timestamp: result.Timestamp
            };
        } catch (error) {
            console.error('Error uploading to Pinata:', error);
            throw error;
        }
    }

    // Subir JSON a Pinata
    async uploadJSON(jsonData, options = {}) {
        this.checkConfiguration();
        
        try {
            const data = {
                pinataContent: jsonData,
                pinataMetadata: {
                    name: options.name || 'BlockHub JSON',
                    description: options.description || 'JSON data from BlockHub'
                }
            };

            const response = await fetch(this.config.api.pinJson, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.jwt}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error de Pinata: ${errorData.error || response.statusText}`);
            }

            const result = await response.json();
            return {
                hash: result.IpfsHash,
                size: result.PinSize,
                timestamp: result.Timestamp
            };
        } catch (error) {
            console.error('Error uploading JSON to Pinata:', error);
            throw error;
        }
    }

    // Cargar archivo desde IPFS
    async loadFile(hash) {
        try {
            const response = await fetch(`${this.config.gateway}${hash}`);
            
            if (!response.ok) {
                throw new Error(`Archivo no encontrado: ${response.statusText}`);
            }

            const content = await response.text();
            return content;
        } catch (error) {
            console.error('Error loading from IPFS:', error);
            throw error;
        }
    }

    // Cargar JSON desde IPFS
    async loadJSON(hash) {
        try {
            const response = await fetch(`${this.config.gateway}${hash}`);
            
            if (!response.ok) {
                throw new Error(`JSON no encontrado: ${response.statusText}`);
            }

            const json = await response.json();
            return json;
        } catch (error) {
            console.error('Error loading JSON from IPFS:', error);
            throw error;
        }
    }

    // Listar archivos anclados
    async listPinnedFiles(options = {}) {
        this.checkConfiguration();
        
        try {
            const params = new URLSearchParams({
                status: 'pinned',
                pageLimit: options.limit || 10,
                pageOffset: options.offset || 0
            });

            const response = await fetch(`${this.config.api.list}?${params}`, {
                headers: {
                    'Authorization': `Bearer ${this.config.jwt}`
                }
            });

            if (!response.ok) {
                throw new Error(`Error al listar archivos: ${response.statusText}`);
            }

            const result = await response.json();
            return result.rows;
        } catch (error) {
            console.error('Error listing pinned files:', error);
            throw error;
        }
    }

    // Desanclar archivo
    async unpinFile(hash) {
        this.checkConfiguration();
        
        try {
            const response = await fetch(`${this.config.api.unpin}/${hash}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.config.jwt}`
                }
            });

            if (!response.ok) {
                throw new Error(`Error al desanclar archivo: ${response.statusText}`);
            }

            return { success: true, hash };
        } catch (error) {
            console.error('Error unpinning file:', error);
            throw error;
        }
    }
}

// Crear instancia global del servicio
const pinataService = new PinataService(PINATA_CONFIG);

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PINATA_CONFIG, PinataService, pinataService };
}

// Hacer disponible globalmente en el navegador
if (typeof window !== 'undefined') {
    window.PINATA_CONFIG = PINATA_CONFIG;
    window.PinataService = PinataService;
    window.pinataService = pinataService;
}

console.log('🔧 Pinata configuration loaded');
console.log('📖 Para configurar Pinata, edita pinata-config.js con tu JWT token');
