import bcrypt from 'bcrypt';

const password = process.argv[2];

if (!password) {
  console.error('Por favor, forneça uma senha como argumento.');
  console.error('Exemplo: npm run generate-password minhasenha123');
  process.exit(1);
}

async function generateHash() {
  const hash = await bcrypt.hash(password, 10);
  console.log('\nSenha original:', password);
  console.log('Hash gerado:', hash);
  console.log('\nVocê pode usar este hash para atualizar o banco de dados manualmente.\n');
}

generateHash(); 