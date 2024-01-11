/*
  API for

  File upload and parsing
  File download
  List of all files
*/

import express from 'express';
import path from 'path';
import fs from 'fs';
import fileUpload from 'express-fileupload';
import { randomBytes } from 'crypto';
import { pool } from '../dbAccess/dbpool.js';
import { validateToken } from '../middlewares/validate-token.js';
import processData from '../services/parser.js';
import { sendGmail } from '../services/emailConfig.js';
import { logActions } from '../middlewares/log-actions.js';

const __dirname = path.resolve();
const router = express.Router();

router.use(fileUpload());

/*
  File download link endpoint
*/
router.get('/download/:id', validateToken, logActions, async (req, res) => {
  const { id } = req.params;
  const file = `${__dirname}/uploads/${id}`;

  fs.access(file, fs.F_OK, (err) => {
    if (err) {
      return res.status(404).send({ message: 'The file you are looking for, does not exist on this server.'});
    }

    res.download(file);
  })
});

/*
  Get single file information endpoint
*/
router.get('/:id', validateToken, logActions, async (req, res) => {
  await pool
    .query(
      ` select file_id,file_name,proj_title,file_path,files.project_id,
        DATE_FORMAT(project_month, '%Y-%m-%d') as project_month, program_type,user_id,parsing_status,upload_date
        from files, projects, user_projects
        where files.project_id = projects.project_id
          and user_projects.userid = ?
          and files.project_id = user_projects.project_id
          and files.file_id = ?`, [req.user.userid, req.params.id]
    )
    .then(result => {
      return res.status(200).send({ file: result[0] });
    })
    .catch (err => {
      return res.status(500).send({ message: err.message });
    });
});

/*
  Get list of all files endpoint
*/
router.get('/', validateToken, logActions, async (req, res) => {
  await pool
    .query(
      `select file_id,file_name,proj_title,file_path,files.project_id, 
        DATE_FORMAT(project_month, '%d-%m-%Y') as project_month, 
        program_type,user_id,parsing_status, 
        DATE_FORMAT(upload_date, '%d-%b-%Y') as upload_date 
      from files, projects, user_projects
      where files.project_id = projects.project_id
        and user_projects.userid = ?
        and files.project_id = user_projects.project_id
      order by upload_date desc`, [req.user.userid]
    )
    .then(result => {
      return res.status(200).send({ files: result[0] });
    })
    .catch (err => {
      return res.status(500).send({ message: err.message });
    });
});

/*
  File upload and parsing endpoint
*/
router.post('/upload', validateToken, logActions, (req, res) => {

  if (!req.files || Object.keys(req.files).length === 0) {
    throw new Error('No files were uploaded.');
  }

  let projectTitle='';
  const fileName = req.files.file.name;
  const file = req.files.file;
  const fileid = randomBytes(8).toString('hex');
  const uploadPath = __dirname + '/uploads/' + fileid + '.' + fileName;
  const fileRelativePath = '/uploads/' + fileid + '.' + fileName;

  pool.query(`select proj_title from projects where project_id = ?`, [req.body.projid])
  .then((result) => {
    projectTitle = result[0][0].proj_title;
  });

  file.mv(uploadPath, async (err) => {
    if (err) {
      throw new Error(err.message);
    }

    try {
      await pool.query(
        `insert into files
        (file_id,
         file_name,
         file_path,
         project_id,
         project_month,
         program_type,
         user_id,
         parsing_status)
         values (?,?,?,?,?,?,?,?)`,
        [
          fileid,
          fileName,
          fileRelativePath,
          req.body.projid,
          req.body.projectMonth,
          req.body.programType,
          req.body.userid,
          'Processing',
        ]
      ).then(async () => {
        await processData(uploadPath, req.body.projid, fileid)
        .then(async () => {
          await pool.query(`select first_name, last_name, email from users where active='yes'`)
          .then(async (result) => {
            result[0].map((user) => {
              sendGmail(
                'imrankhakwani@gmail.com',
                user.email,
                'New file uploaded in the system.',
                `Hi ${user.first_name}, A new file was uploaded in the system with the following details:
                  Project Name: ${projectTitle}
                  File Name:  ${fileName}
                  Project Month: ${req.body.projectMonth}
                  Project Type: ${req.body.programType}`
              );
            })
          })
          .catch((err) => {
            console.error(err);
          });
        })
        .catch((err) => {
          console.log(err);
        });
      })
      .catch((error) => {
        return res.status(409).send({ message: error.message });
      });

      return res.status(200).send({ message: 'Program successfully uploaded.' });
    } catch (err) {
      return res.status(500).send({ message: err.message });
    }
  });
});

/*
  API to edit uploaded programs.
*/
router.patch('/:id', validateToken, logActions, async (req, res) => {
  const file_id = req.params.id;
  const { projid, programType, projectMonth, userid } = req.body;

  let projectTitle = ' ';

  pool.query(`select proj_title from projects where project_id = ?`, [projid])
  .then((result) => {
    projectTitle = result[0][0].proj_title;
  });

  if (req.files) {
    const fileName = req.files.file.name;
    const uploadPath = __dirname + '/uploads/' + file_id + '.' + fileName;
    const fileRelativePath = '/uploads/' + file_id + '.' + fileName;

    await pool
    .query(`update files 
            set file_name = ?,
                file_path = ?,
                project_id = ?,
                program_type = ?,
                project_month = ?,
                user_id = ?
                where file_id = ?`, 
                [fileName, fileRelativePath, projid, programType, projectMonth, userid, file_id])
    .then(async () => {
      await deleteFile(file_id);

      await processData(uploadPath, req.body.projid, file_id)
      .then(async () => {
        await pool.query(`select first_name, last_name, email from users where active='yes'`)
        .then(async (result) => {
          result[0].map((user) => {
            sendGmail(
              'imrankhakwani@gmail.com',
              user.email,
              'A file was updated in the system.',
              `Hi ${user.first_name}, A file was updated in the system with the following details:

                Project Name: ${projectTitle}
                File Name:  ${fileName}
                Project Month: ${req.body.projectMonth}
                Project Type: ${req.body.programType}`
            );
          })
        })
        .catch((err) => {
          console.error(err);
        });
      })
      .catch((err) => {
        console.log(err);
      });
    })
    .catch((error) => {
      return res.status(500).send({ message: error.message });
    });

    return res.status(200).send({ message: 'Program successfully updated.' });
  }
  else {
    await pool
    .query(`update files
            set project_id = ?,
                program_type = ?,
                project_month = ?,
                user_id = ?
                where file_id = ?`,
                [projid, programType, projectMonth, userid, file_id])
    .then(async(result) => {
      await pool.query(`select first_name, last_name, email from users where active='yes'`)
      .then(async (result) => {
        result[0].map((user) => {
          sendGmail(
            'imrankhakwani@gmail.com',
            user.email,
            'A file was updated in the system.',
            `Hi ${user.first_name}, A file was updated in the system with the following details:

              Project Name: ${projectTitle}
              Project Month: ${req.body.projectMonth}
              Project Type: ${req.body.programType}`
          );
        })
      })
      .catch((err) => {
        console.error(err);
      });
      
      return res.status(200).send({ message: 'Program successfully updated.' });
    })
    .catch((error) => {
      return res.status(500).send({ message: error.message });
    });
  }
});

/*
  Delete all records associated with a file. The id parameter contains file_id.
*/
router.delete('/:id', validateToken, logActions, async (req, res) => {
  const { id } = req.params;

  await deleteFile(id);

  return res.status(200).send({ message: 'Project successfully deleted.'});
});

const deleteFile = (async (id) => {
  /*
    Physically delete the file from OS
  */
  await pool.query(`select file_path from files where file_id = ?`, [id])
  .then(result => {
    result[0].map(data => {
      const filePath = __dirname + data.file_path;
      fs.unlink(filePath, (err) => {
        if (err)
          console.log(err.message);
      }); 
    });
  })
  .catch (err => { 
    console.log(err.message); 
  });

  await pool.query(`delete from files where file_id = ?`, [id])
  .then(result => {})
  .catch (err => { console.log(err.message); });

  await pool.query(`delete from actvcode where file_id = ?`,[id])
  .then(result => { })
  .catch (err => { console.log(err.message); });

  await pool.query(`delete from applyactoptions where file_id = ?`, [id])
  .then(result => { })
  .catch (err => { console.log(err.message); });

  await pool.query(`delete from actvtype where file_id = ?`, [id])
  .then(result => { })
  .catch (err => { console.log(err.message); });

  await pool.query(`delete from calendar where file_id = ?`, [id])
  .then(result => { })
  .catch (err => { console.log(err.message); });
  
  await pool.query(`delete from currtype where file_id = ?`, [id])
  .then(result => { })
  .catch (err => { console.log(err.message); });

  await pool.query(`delete from fintmpl where file_id = ?`, [id])
  .then(result => { })
  .catch (err => { console.log(err.message); });
  
  await pool.query(`delete from nonwork where file_id = ?`, [id])
  .then(result => { })
  .catch (err => { console.log(err.message); });
  
  await pool.query(`delete from obs where file_id = ?`, [id])
  .then(result => { })
  .catch (err => { console.log(err.message); });
  
  await pool.query(`delete from project where file_id = ?`, [id])
  .then(result => { })
  .catch (err => { console.log(err.message); });
  
  await pool.query(`delete from projwbs where file_id = ?`, [id])
  .then(result => { })
  .catch (err => { console.log(err.message); });
  
  await pool.query(`delete from task where file_id = ?`, [id])
  .then(result => { })
  .catch (err => { console.log(err.message); });
  
  await pool.query(`delete from projwbs where file_id = ?`, [id])
  .then(result => { })
  .catch (err => { console.log(err.message); });
  
  await pool.query(`delete from taskactv where file_id = ?`, [id])
  .then(result => { })
  .catch (err => { console.log(err.message); });
  
  await pool.query(`delete from taskpred where file_id = ?`, [id])
  .then(result => { })
  .catch (err => { console.log(err.message); });
  
  await pool.query(`delete from udftype where file_id = ?`, [id])
  .then(result => { })
  .catch (err => { console.log(err.message); });
  
  await pool.query(`delete from udfvalue where file_id = ?`, [id])
  .then(result => { })
  .catch (err => { console.log(err.message); });
})


export { router as filesRouter };
