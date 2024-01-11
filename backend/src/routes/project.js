import express from 'express';
import { pool } from '../dbAccess/dbpool.js';
import { randomBytes } from 'crypto';
import { validateToken } from '../middlewares/validate-token.js';

const router = express.Router();

router.get('/list', validateToken, async (req, res) => {

  await pool
    .query(`select a.project_id, a.proj_title 
      from projects a, user_projects b, users c
      where a.project_id = b.project_id
      and b.userid = c.userid
      and c.userid = ?`, [req.user.userid])
    .then(result => {
      res.status(200).send(result[0]);
    })
    .catch (err => {
      res.status(500).send({ message: err.message });
    });
});

router.get('/', async (req, res) => {

  await pool
    .query(`select project_id, proj_title from projects`)
    .then(result => {
      res.status(200).send(result[0]);
    })
    .catch (err => {
      res.status(500).send({ message: err.message });
    });
});

router.post('/', validateToken, async (req, res) => {

  const { projectname } = req.body;
  const projectId = randomBytes(8).toString('hex');

  await pool
    .query(`insert into projects (project_id, proj_title) values (?, ?)`, [projectId, projectname])
    .then(() => { 
      res.status(200).send({ message: 'Success'})
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
});

router.patch('/:id', validateToken, async (req, res) => {

  const projectId = req.params.id;
  const { proj_title } = req.body;

  await pool
    .query(`update projects set proj_title = ? where project_id = ?`, [proj_title, projectId])
    .then(() => {
      res.status(200).send({ message: 'Project details successfully updated.'});
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
});

router.delete('/:id', validateToken, async (req, res) => {

  const projectId = req.params.id;
  await pool
    .query(`delete from projects where project_id = ?`, [projectId])
    .then(() => {
      res.status(200).send({ message: 'Project successfully deleted.'});
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
});

export { router as projectRouter };
