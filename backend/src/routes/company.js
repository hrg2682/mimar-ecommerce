import express from 'express';
import { randomBytes } from 'crypto';
import { pool } from '../dbAccess/dbpool.js';
import { validateToken } from '../middlewares/validate-token.js';
import { logActions } from '../middlewares/log-actions.js';

const router = express.Router();

router.post('/', validateToken, async (req, res) => {
    const { company_name } = req.body;
    const company_id = randomBytes(8).toString('hex');

    await pool
        .query(`insert into companies (company_id, company_name) values (?, ?)`, [company_id, company_name])
        .then(() => {
            res.status(200).send({ message: 'Company successfully created.' });
        })
        .catch((error) => {
            res.status(500).send({ message: error.message });
        });
});

router.get('/', async (req, res) => {
    try {
      let [rows] = await pool.query(`select company_id, company_name from companies`);
  
      res.status(200).send({ companies: rows });
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
});

router.patch('/:id', validateToken, async (req, res) => {

  const company_id = req.params.id;
  const { company_name } = req.body;

  await pool
    .query(`update companies set company_name = ? where company_id = ?`, [company_name, company_id])
    .then(() => {
      res.status(200).send({ message: 'Company details successfully updated.'});
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
});

router.delete('/:id', validateToken, async (req, res) => {

  const company_id = req.params.id;
  await pool
    .query(`delete from companies where company_id = ?`, [company_id])
    .then(() => {
      res.status(200).send({ message: 'Company successfully deleted.'});
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
});

export { router as companyRouter }