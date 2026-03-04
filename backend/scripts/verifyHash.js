import bcrypt from 'bcrypt';

const password = process.argv[2];
const hash = process.argv[3];

if (!password || !hash) {
  console.log('Uso: npm run verify <password> <hash>');
  process.exit(1);
}

console.log('\n=================================');
console.log('Verificador de Hash bcrypt');
console.log('=================================\n');

console.log('Password:', password);
console.log('Hash:', hash);
console.log('\nVerificando...\n');

bcrypt.compare(password, hash, (err, result) => {
  if (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }

  if (result) {
    console.log('✅ HASH VÁLIDO - La password coincide con el hash');
  } else {
    console.log('❌ HASH INVÁLIDO - La password NO coincide con el hash');
  }

  console.log('\n=================================\n');
  process.exit(result ? 0 : 1);
});
