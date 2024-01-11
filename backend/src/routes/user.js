import express from 'express';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { Password } from '../services/password.js';
import { pool } from '../dbAccess/dbpool.js';
import { validateToken } from '../middlewares/validate-token.js';
import { logActions } from '../middlewares/log-actions.js';
import { sendGmail } from '../services/emailConfig.js';

const router = express.Router();

/*
  API end point to sign up new users on request.
*/
router.post('/signup', async (req, res) => {
  const { first_name, last_name, email, phone_no,
          userpass, comments } = req.body;
  const userid = randomBytes(8).toString('hex');
  const password = await Password.toHash(userpass);

  await pool
    .query(
      `insert into users (userid, first_name, last_name, email, is_admin, phone_no, userpass, comments, signedup, active, signup_date)
       values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, now())`,
      [userid, first_name, last_name, email, 'no',
       phone_no, password, comments, 'yes', 'yes'])
    .then(() => {
      res.status(200).send({ message: 'User signup successfull.' });
    })
    .catch((error) => {
      res.status(500).send({ message: error.message });
    });
});

/*
  API end point to create new users on admin's request.
*/
router.post('/create', validateToken, logActions, async (req, res) => {
  const { first_name, last_name, email, 
          phone_no, userpass, is_admin, company_id, project_id, comments, active } = req.body;
  const userid = randomBytes(8).toString('hex');
  const password = await Password.toHash(userpass);

  await pool
    .query(
      `insert into users (userid, first_name, last_name, email, is_admin, 
        company_id, project_id, phone_no, userpass, comments, signedup, active)
       values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userid, first_name, last_name, email, is_admin,
        company_id, project_id, phone_no, password, comments, 'no', 'yes'])
    .then(() => {
      res.status(200).send({ message: 'User successfully created.' });
    })
    .catch((error) => {
      res.status(500).send({ message: error.message });
    });
});

router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  let existingUser = null;

  try {
    let [rows] = await pool.query(
      `select userid, first_name, last_name, email, userpass, is_admin 
       from users 
       where active = 'yes' and email = ? `,
      [email]
    );

    if (rows.length) {
      existingUser = rows[0];
    }

    if (!existingUser) {
      throw new Error('Invalid credentials');
    }

    const passwordsMatch = await Password.compare(
      existingUser.userpass,
      password
    );

    if (!passwordsMatch) {
      throw new Error('Invalid credentials');
    }

    delete existingUser.userpass;

    await pool
    .query(`select role_id from user_roles where userid = ?`, [existingUser.userid])
    .then((result) => {

      let userRoles = new Array();
      let newArray = result[0];

      for (let i = 0; i < newArray.length; i++) {
        userRoles.push(newArray[i].role_id);
      }

      existingUser.roles = userRoles;
    })
    .catch((error) => {
      existingUser.roles = [];
    });

    const userJwt = jwt.sign(existingUser, process.env.JWT_KEY, {
      expiresIn: '180m',
    });

    res.status(200).json({ user: existingUser, token: userJwt });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
});

router.post('/changepass', validateToken, logActions, async (req, res) => {
  const { userid, password } = req.body;
  const passwordHash = await Password.toHash(password);

  await pool
    .query(`update users set userpass = ? where userid = ?`, [
      passwordHash,
      userid,
    ])
    .then((result) => {
      res.status(200).send({ message: 'Password successfully changed.' });
    })
    .catch((error) => {
      res.status(500).send({ message: error.message });
    });
});

/*
  Forgot password
*/
router.post('/forgotpass', async (req, res) => {
  const { email } = req.body;
  let user = {};

  await pool
    .query('select userid, first_name, last_name, email, userpass, is_admin, active from users where email = ? ', [ email ])
    .then(async (rows) => {
      const { userid, first_name } = rows[0][0];

      const temporaryPass = randomBytes(8).toString('hex');
      const userpass = await Password.toHash(temporaryPass);

      await pool
      .query(`update users set userpass = ? where userid = ?`, [
        userpass,
        userid,
      ])
      .then((data) => {
        sendGmail(
            'imrankhakwani@gmail.com',
            email,
            'Password Reset Request',
            `Hi ${first_name}, We received a password reset request from you. Please note the new password: ${temporaryPass} . Please signin and change your password immediately.`
        );
        res.status(200).send({ message: 'Password generated and email sent.' });
      })
      .catch((error) => {
        return res.status(500).send({ message: error.message });
      });
  
    })
    .catch((error) => {
      return res.status(500).send({ message: error.message });
    });
});

/*
  API to approve signed-up users.
*/
router.patch('/activate/:id', validateToken, logActions, async (req, res) => {
  const userid = req.params.id;

  await pool
    .query(`update users set active = 'yes',
                           signedup = 'no',
                           approval_date = CURRENT_TIMESTAMP
            where userid = ?`, [userid])
    .then((result) => {
      return res.status(200).send({ message: 'User activation approved.' });
    })
    .catch((error) => {
      return res.status(500).send({ message: error.message });
    });
});

router.patch('/resetpass/:id', validateToken, logActions, async (req, res) => {
  const userid = req.params.id;
  const { userpass } = req.body;
  const password = await Password.toHash(userpass);

  await pool
    .query(`update users set userpass = ? where userid = ?`, [password, userid])
    .then((result) => {
      res.status(200).send({ message: 'Password reset for the given user.' });
    })
    .catch((error) => {
      res.status(500).send({ message: error.message });
    });
});

/*
  Update user status on the basis of user_id
*/
router.patch('/status/:id', validateToken, logActions, async (req, res) => {
  const userid = req.params.id;
  const { active } = req.body;

  await pool
    .query(
      `update users set
         active = ?
       where userid = ?`,
      [ active, userid ]
    )
    .then((result) => {
      return res.status(200).send({ message: 'User status successfully updated.' });
    })
    .catch((error) => {
      return res.status(500).send({ message: error.message });
    });
});

/*
  Update user details on the basis of user_id
*/
router.patch('/:id', validateToken, logActions, async (req, res) => {
  const userid = req.params.id;
  const { first_name, last_name, email, active, is_admin, project_id, company_id, phone_no, comments } = req.body;

  await pool
    .query(
      `update users set
         first_name = ?,
         last_name = ?,
         email = ?,
         active = ?,
         is_admin = ?,
         project_id = ?,
         company_id = ?,
         phone_no = ?,
         comments = ?
       where userid = ?`,
      [first_name, last_name, email, active, is_admin, project_id, company_id, phone_no, comments, userid]
    )
    .then((result) => {
      res.status(200).send({ message: 'User successfully updated.' });
    })
    .catch((error) => {
      res.status(500).send({ message: error.message });
    });
});

/*
  Delete user.
*/
router.delete('/:id', validateToken, async (req, res) => {
  const { id } = req.params;

  await pool
    .query(`delete from users where userid = ?`, [id])
    .then(() => {
      res.status(200).send({ message: 'User successfully deleted.' });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
});

/*
  API to assign projects to users.
*/
router.post('/assign-projects', validateToken, async (req, res) => {
  const { userId, projects } = req.body;

  await pool
  .query(`delete from user_projects where userid = ?`, [userId])
  .then((result) => {
  })
  .catch((error) => {
    return res.status(500).send({ message: error.message });
  });

  projects.forEach(async element => {
    await pool
    .query(`insert into user_projects values(?, ?)`, [userId, element.project_id])
    .then((result) => {
    })
    .catch((error) => {
      return res.status(500).send({ message: error.message });
    });
  });

  return res.status(200).send({ message: 'Projects successfully saved.'});
});

/*
  Get list of projects assigned to single user.
*/
router.get('/assigned-projects/:id', validateToken, async (req, res) => {
  const id = req.params.id;

  await pool.query(
    ` select b.project_id, b.proj_title, if(isnull(a.project_id)=0, 'Yes', 'No' ) as assigned
      from 
      (select a.userid, c.project_id, c.proj_title
      from user_projects a 
      right outer join users b on a.userid = b.userid
      right outer join projects c on a.project_id = c.project_id
      where a.userid = ? ) a
      right outer join projects b
      on a.project_id = b.project_id`, [id]
  )
  .then((rows) => {
    return res.status(200).send(rows[0])
  })
  .catch ((err) => {
    return res.status(500).send({ message: err.message });
  });
});

/*
  Get list of projects assigned to all users.
*/
router.get('/assigned-projects', validateToken, async (req, res) => {
  await pool.query(
    `select users.userid as userid, users.first_name as first_name, users.last_name as last_name,
      users.email as email, proj.projects as proj_list
      from
      ( select a.userid, group_concat(b.proj_title) projects
        from users a, projects b, user_projects c
        where c.userid = a.userid
        and c.project_id = b.project_id
        group by a.userid ) proj
      right outer join users
      on users.userid = proj.userid`
  )
  .then((rows) => {
    return res.status(200).send({ users: rows[0] })
  })
  .catch ((err) => {
    return res.status(500).send({ message: err.message });
  });
});

/*
  API to assign roles to users.
*/
router.post('/assign-roles', validateToken, async (req, res) => {
  const { userId, roles } = req.body;

  await pool
  .query(`delete from user_roles where userid = ?`, [userId])
  .then((result) => {
  })
  .catch((error) => {
    return res.status(500).send({ message: error.message });
  });

  roles.forEach(async element => {
    await pool
    .query(`insert into user_roles values(?, ?)`, [userId, element.role_id])
    .then((result) => {
    })
    .catch((error) => {
      return res.status(500).send({ message: error.message });
    });
  });

  return res.status(200).send({ message: 'Roles successfully saved.'});
});

/*
  Get list of roles assigned to single user.
*/
router.get('/assigned-roles/:id', validateToken, async (req, res) => {
  const id = req.params.id;

  await pool.query(
    ` select b.role_id, b.role_name, if(isnull(a.role_id)=0, 'Yes', 'No' ) as assigned
      from 
      (select a.userid, c.role_id, c.role_name
      from user_roles a 
      right outer join users b on a.userid = b.userid
      right outer join app_roles c on a.role_id = c.role_id
      where a.userid = ? ) a
      right outer join app_roles b
      on a.role_id = b.role_id`, [id]
  )
  .then((rows) => {
    return res.status(200).send(rows[0])
  })
  .catch ((err) => {
    return res.status(500).send({ message: err.message });
  });
});

/*
  Get list of roles assigned to all users.
*/
router.get('/assigned-roles', validateToken, async (req, res) => {
  await pool.query(
    `select users.userid as userid, users.first_name as first_name, users.last_name as last_name,
      users.email as email, a.roles as role_list
     from
      ( select a.userid, group_concat(b.role_name) roles
      from users a, app_roles b, user_roles c
      where c.userid = a.userid
      and c.role_id = b.role_id
      group by a.userid ) a
     right outer join users
     on users.userid = a.userid`
  )
  .then((rows) => {
    return res.status(200).send({ users: rows[0] })
  })
  .catch ((err) => {
    return res.status(500).send({ message: err.message });
  });
});

/*
  Get list of signed up users awaiting admin's approval.
*/
router.get('/signedup', validateToken, async (req, res) => {
  await pool.query(
    `select userid, first_name, last_name, email, is_admin,
     phone_no, comments, signedup, active
     from users
     where signedup = 'yes'
     and active = 'no'`
  )
  .then((rows) => {
    res.status(200).send({ users: rows[0] })
  })
  .catch ((err) => {
    res.status(500).send({ message: err.message });
  });
});

//selected user data
router.get('/:id', validateToken, async (req, res) => {
  const { id } = req.params;

  try {
    let [rows] = await pool.query(
      `select userid, first_name, last_name, email,
              company_id, project_id, phone_no, comments, signedup, active
       from users where userid = ?`, [id]
    );

    res.status(200).send({ users: rows });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

/*
  Get list of all users.
*/
router.get('/', validateToken, async (req, res) => {
  try {
    let [rows] = await pool.query(
      `select users.userid as userid, users.first_name as first_name, users.last_name as last_name,
      users.email as email, ifnull(c.company_name, '-') as company_name,
      users.is_admin, users.phone_no, users.comments, users.signedup, users.active,
      DATE_FORMAT(users.signup_date, '%d-%b-%Y') as signup_date, DATE_FORMAT(users.approval_date, '%d-%b-%Y')
      as approval_date, proj.projects as proj_list
      from
      ( select a.userid, group_concat(b.proj_title) projects
        from users a, projects b, user_projects c
        where c.userid = a.userid
        and c.project_id = b.project_id
        group by a.userid ) proj
      right outer join users on users.userid = proj.userid
      left outer join companies c on c.company_id = users.company_id
      where users.userid not in 
      (select userid from users where signedup = 'yes' and active = 'no')`
    );

    return res.status(200).send({ users: rows });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
});

export { router as userRouter };
