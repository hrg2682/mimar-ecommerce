import { pool } from '../dbAccess/dbpool.js';

const logActions = async (req, res, next) => {
  const user = req.user;

  if (!user) {
    return res.status(400).send({ message: "User information is missing in request." });
  }

  const requested_api = req.baseUrl + req.route.path;
  await pool
    .query(`insert into action_log
            (action, action_by, requested_api, requested_method, request_params) 
            values (?, ?, ?, ?, ?)`, 
            ['Approve Signup', user.userid, requested_api, req.method, req.params.id])
    .then(() => {
    })
    .catch((error) => {
      console.log(error);
    });

  next();
}

export { logActions }
