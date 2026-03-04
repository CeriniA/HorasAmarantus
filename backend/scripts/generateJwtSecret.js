import crypto from 'crypto';

/**
 * Genera un JWT secret aleatorio y seguro
 * Mínimo 32 caracteres, recomendado 64
 */

console.log('\n🔑 Generador de JWT Secret\n');
console.log('='.repeat(80));

// Generar secret de 64 bytes (128 caracteres hexadecimales)
const secret64 = crypto.randomBytes(64).toString('hex');

// Generar secret de 32 bytes (64 caracteres hexadecimales)
const secret32 = crypto.randomBytes(32).toString('hex');

// Generar secret base64 (más compacto)
const secretBase64 = crypto.randomBytes(48).toString('base64');

console.log('\n📋 Opción 1: Secret Hexadecimal (64 bytes - RECOMENDADO)');
console.log('-'.repeat(80));
console.log(secret64);
console.log(`Longitud: ${secret64.length} caracteres`);

console.log('\n📋 Opción 2: Secret Hexadecimal (32 bytes - MÍNIMO)');
console.log('-'.repeat(80));
console.log(secret32);
console.log(`Longitud: ${secret32.length} caracteres`);

console.log('\n📋 Opción 3: Secret Base64 (48 bytes - COMPACTO)');
console.log('-'.repeat(80));
console.log(secretBase64);
console.log(`Longitud: ${secretBase64.length} caracteres`);

console.log('\n' + '='.repeat(80));
console.log('\n✅ Copia uno de los secrets de arriba y úsalo como JWT_SECRET');
console.log('\n⚠️  IMPORTANTE:');
console.log('   - NUNCA lo compartas públicamente');
console.log('   - NUNCA lo commitees en Git');
console.log('   - Úsalo solo en variables de entorno');
console.log('   - Guárdalo en un lugar seguro (password manager)');
console.log('\n💡 Para usar en Render:');
console.log('   Environment Variables → JWT_SECRET → [pegar secret aquí]');
console.log('\n');
