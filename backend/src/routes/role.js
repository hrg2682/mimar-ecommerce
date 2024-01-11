import express from 'express';
import { pool } from '../dbAccess/dbpool.js';
import { validateToken } from '../middlewares/validate-token.js';
import { logActions } from '../middlewares/log-actions.js';

const router = express.Router();

/*
  API end point to create new role.
*/
router.post('/', validateToken, async (req, res) => {
    const { role_id, role_name } = req.body;
  
    await pool
    .query(`insert into app_roles (role_id, role_name) values (?, ?)`, [role_id, role_name])
    .then(() => {
        res.status(200).send({ message: 'Role creation successfull.' });
    })
    .catch((error) => {
        res.status(500).send({ message: error.message });
    });
});

/*
Delete role.
*/
router.delete('/:id', validateToken, async (req, res) => {
    const { id } = req.params;

    await pool
    .query(`delete from app_roles where role_id = ?`, [id])
    .then(() => {
        res.status(200).send({ message: 'Role successfully deleted.' });
    })
    .catch((err) => {
        res.status(500).send({ message: err.message });
    });
});

/*
Update role name for the given role id
*/
router.patch('/:id', validateToken, async (req, res) => {
    const role_id = req.params.id;
    const { role_name } = req.body;

    await pool
    .query(`update app_roles set role_name = ? where role_id = ?`, [role_name, role_id])
    .then((result) => {
        res.status(200).send({ message: 'Role successfully updated.' });
    })
    .catch((error) => {
        res.status(500).send({ message: error.message });
    });
});

export { router as roleRouter };