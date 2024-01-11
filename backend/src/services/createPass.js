import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

// const scryptAsync = promisify(scrypt);

// const toHash = async (password) => {
//   const salt = randomBytes(8).toString('hex');
//   const buf = await scryptAsync(password, salt, 64);

//   return `${buf.toString('hex')}.${salt}`;
// };

// toHash('12345').then((data) => {
//   console.log(data);
// });

// const test = async (pass) => {
//   const res = await toHash(pass);
//   console.Console.log(res);
// };

console.log(randomBytes(8).toString('hex'))
// console.log(randomBytes(4).toString('hex'))
// console.log(randomBytes(4).toString('hex'))
// console.log(randomBytes(4).toString('hex'))
// console.log(randomBytes(4).toString('hex'))
// console.log(randomBytes(4).toString('hex'))

