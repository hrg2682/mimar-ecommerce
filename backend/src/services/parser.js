import fs from 'fs';
import readline from 'readline';
import { pool } from '../dbAccess/dbpool.js';

let tName = '';
let colNames = '';
let dataValues = [];

let parseRow = (str) => {
  if (str.length === 0) {
    return [];
  }

  let wordArray = [];
  let word = '';
  let prevCharCode = 0;

  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) === 9) {
      if (prevCharCode === 9) {
        wordArray.push('');
      } else {
        wordArray.push(word);
        word = '';
      }
    } else {
      word = word.concat(str.charAt(i));
    }

    prevCharCode = str.charCodeAt(i);
  }

  if (word.length > 0) {
    wordArray.push(word);
  }

  if (str.charCodeAt(str.length - 1) === 9) {
    wordArray.push('');
  }

  return wordArray;
};

const processData = async (filePath, projectId, fileId) => {
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath, 'utf8'),
  });

  rl.on('line', async (line) => {
    let rowToWord = parseRow(line);

    if (rowToWord[0] === '%T') {
      tName = rowToWord[1];
    }

    if (rowToWord[0] === '%F') {
      let [, ...cols] = rowToWord;
      colNames = cols.join(',');
      colNames += ',project_id,file_id';
    }

    if (rowToWord[0] === '%R') {
      dataValues = [];
      const [, ...recordValues] = rowToWord;
      recordValues.push(projectId);
      recordValues.push(fileId);
      dataValues.push(recordValues);

      await pool
        .query(
          `INSERT INTO ${tName.toLocaleLowerCase()} (${colNames}) VALUES (?)`,
          dataValues
        )
        .then(() => {})
        .catch((error) => {
          console.log(error);
        });
    }

    if (rowToWord[0] === '%E') {
      await pool
        .query(
          `update files set parsing_status = 'Processed' where file_id = ?`,
          [fileId]
        )
        .then(() => {})
        .catch((error) => {
          console.log(error);
        });
    }
  });

  rl.on('close', () => {
    console.log('Done processing file.');
  });

  rl.on('error', () => {
    console.log(err.stack);
  });
};

export default processData;
