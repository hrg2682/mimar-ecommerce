import { pool } from "../dbAccess/dbpool.js";

// constructor
const User = function(user) {
  this.userid = user.userid;
  this.username = user.username;
  this.email = user.email;
  this.password = user.userpass;
};

// User.create = (newUser, result) => {
//   sql.query("INSERT INTO USERS SET ?", newUser, (err, res) => {
//     if (err) {
//       console.log("error: ", err);
//       result(err, null);
//       return;
//     }

//     console.log("created user: ", { id: res.insertId, ...newUser });
//     result(null, { id: res.insertId, ...newUser });
//   });
// };

User.findOne = (email) => {
  pool.query(`SELECT USERID, USERNAME, EMAIL, PASSWORD FROM USERS WHERE EMAIL = ?`,
      [email],
      (err, res, fields) => {
        if (err) {
          console.log(err);
          return null;
        }

        if (res.length) {
          console.log('found user: ', res[0]);
          return {
            userid: res[0].userid,
            username: res[0].username,
            email: res[0].email,
            password: res[0].password,
          };
        }

        return null;
      }
    );
};

// User.getAll = (title, result) => {
//   let query = "SELECT * FROM USERS";

//   sql.query(query, (err, res) => {
//     if (err) {
//       console.log("error: ", err);
//       result(null, err);
//       return;
//     }

//     console.log("users: ", res);
//     result(null, res);
//   });
// };

// User.getAllPublished = result => {
//   sql.query("SELECT * FROM USERS WHERE published=true", (err, res) => {
//     if (err) {
//       console.log("error: ", err);
//       result(null, err);
//       return;
//     }

//     console.log("users: ", res);
//     result(null, res);
//   });
// };

// User.updateById = (id, user, result) => {
//   sql.query(
//     "UPDATE users SET title = ?, description = ?, published = ? WHERE id = ?",
//     [user.title, user.description, user.published, id],
//     (err, res) => {
//       if (err) {
//         console.log("error: ", err);
//         result(null, err);
//         return;
//       }

//       if (res.affectedRows == 0) {
//         // not found User with the id
//         result({ kind: "not_found" }, null);
//         return;
//       }

//       console.log("updated user: ", { id: id, ...user });
//       result(null, { id: id, ...user });
//     }
//   );
// };

// User.remove = (id, result) => {
//   sql.query("DELETE FROM users WHERE id = ?", id, (err, res) => {
//     if (err) {
//       console.log("error: ", err);
//       result(null, err);
//       return;
//     }

//     if (res.affectedRows == 0) {
//       // not found User with the id
//       result({ kind: "not_found" }, null);
//       return;
//     }

//     console.log("deleted user with id: ", id);
//     result(null, res);
//   });
// };

// User.removeAll = result => {
//   sql.query("DELETE FROM users", (err, res) => {
//     if (err) {
//       console.log("error: ", err);
//       result(null, err);
//       return;
//     }

//     console.log(`deleted ${res.affectedRows} users`);
//     result(null, res);
//   });
// };

export { User }