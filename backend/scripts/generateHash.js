import bcrypt from 'bcryptjs';

// Script para generar hash de password
const password = process.argv[2] || 'ContraseñaSegura123!';

bcrypt.hash(password, 10).then(hash => {
  console.log('\n=================================');
  console.log('Password Hash Generator');
  console.log('=================================\n');
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\n=================================');
  console.log('Copia el hash y úsalo en el INSERT de users');
  console.log('=================================\n');
});
