// Génère les hash bcrypt à coller dans database/seed.sql à la place de __HASH__
import bcrypt from 'bcrypt';

const password = process.argv[2] || 'Password123!';
const hash = await bcrypt.hash(password, 10);
console.log(`Mot de passe : ${password}`);
console.log(`Hash bcrypt  : ${hash}`);
