# 📌 Configuración de Pinata para BlockHub

## 🚀 Instrucciones de Configuración

### 1. Crear cuenta en Pinata
1. Ve a [pinata.cloud](https://pinata.cloud)
2. Crea una cuenta gratuita
3. Verifica tu email

### 2. Obtener JWT Token
1. Inicia sesión en tu dashboard de Pinata
2. Ve a **API Keys** en el menú lateral
3. Haz clic en **New Key**
4. Selecciona los permisos:
   - ✅ `pinFileToIPFS`
   - ✅ `pinJSONToIPFS`
   - ✅ `unpin`
   - ✅ `userPinPolicy`
5. Ponle un nombre (ej: "BlockHub Key")
6. Haz clic en **Create Key**
7. **¡IMPORTANTE!** Copia y guarda el JWT token (solo se muestra una vez)

### 3. Configurar BlockHub
1. Abre el archivo `pinata-config.js`
2. Reemplaza `'TU_JWT_TOKEN_AQUI'` con tu JWT token real:

```javascript
const PINATA_CONFIG = {
    jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', // Tu token aquí
    gateway: 'https://gateway.pinata.cloud/ipfs/',
    // ... resto de la configuración
};
```

### 4. Verificar Configuración
1. Abre `editor-archivos.html` en tu navegador
2. Abre la consola del navegador (F12)
3. Deberías ver: `🔧 Pinata configuration loaded`
4. Verifica que `window.pinataService.isConfigured` sea `true`

## 📁 Uso del Editor de Archivos

### Crear y Guardar Archivos
1. **Crear nuevo archivo**: Ingresa nombre y selecciona tipo
2. **Escribir código**: Usa el editor de texto
3. **Guardar en IPFS**: Haz clic en "💾 Guardar en IPFS" o usa Ctrl+S
4. **Hash IPFS**: Se guarda automáticamente en `window.BLOCKHUB_CURRENT_FILE_HASH`

### Cargar Archivos
- **Desde lista**: Haz clic en archivos guardados en el sidebar
- **Por hash**: Ingresa hash IPFS en el campo "Cargar por Hash"

### Acceder al Hash desde Consola
```javascript
// El hash del archivo actual está disponible en:
console.log(window.BLOCKHUB_CURRENT_FILE_HASH);

// También puedes ver todos los archivos guardados:
console.log(JSON.parse(localStorage.getItem('blockhub_files')));
```

## 🔒 Seguridad

### ⚠️ **IMPORTANTE - Protección del JWT Token**

**NUNCA** hagas lo siguiente con tu JWT token:
- ❌ No lo subas a repositorios públicos
- ❌ No lo compartas en chat/email
- ❌ No lo hardcodees en archivos que van a producción

### ✅ **Mejores Prácticas**
- 🔐 Usa variables de entorno en producción
- 🔄 Rota el token regularmente
- 👥 Usa diferentes tokens para desarrollo/producción
- 📝 Mantén un registro de dónde usas cada token

### 🛡️ **Para Producción**
En un entorno de producción, considera:
1. **Variables de entorno**: `process.env.PINATA_JWT`
2. **Proxy backend**: Manejar las llamadas a Pinata desde el servidor
3. **Rate limiting**: Controlar el uso de la API
4. **Validación**: Verificar archivos antes de subir

## 🌍 Gateway Personalizado (Opcional)

Si tienes un gateway personalizado de Pinata:
```javascript
const PINATA_CONFIG = {
    jwt: 'tu-token',
    gateway: 'https://tu-gateway.mypinata.cloud/ipfs/', // Tu gateway personalizado
    // ...
};
```

## 🐛 Resolución de Problemas

### Error: "Pinata no está configurado"
- ✅ Verifica que el JWT token esté configurado
- ✅ Asegúrate de que el token no esté expirado
- ✅ Revisa que el archivo `pinata-config.js` se esté cargando

### Error: "Authorization failed"
- 🔑 Verifica que el JWT token sea correcto
- 📋 Confirma que el token tenga los permisos necesarios
- 🔄 Intenta regenerar el token en Pinata

### Error: "File not found"
- 🌐 Verifica que el hash IPFS sea correcto
- ⏱️ Espera unos minutos (propagación en IPFS)
- 🔄 Intenta con un gateway diferente

## 📞 Soporte

Si encuentras problemas:
1. 🔍 Revisa la consola del navegador para errores
2. 📖 Consulta la [documentación de Pinata](https://docs.pinata.cloud/)
3. 🎯 Verifica el status de Pinata en [status.pinata.cloud](https://status.pinata.cloud/)

---

## 🎉 ¡Listo!

Una vez configurado, BlockHub podrá:
- ✅ Subir archivos a IPFS usando Pinata
- ✅ Leer archivos desde IPFS
- ✅ Almacenar metadatos en blockchain
- ✅ Crear repositorios descentralizados

**El hash IPFS de cada archivo se almacena en `window.BLOCKHUB_CURRENT_FILE_HASH` para fácil acceso desde la consola del navegador.**
