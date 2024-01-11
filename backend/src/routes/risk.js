import express from 'express';
import { randomBytes } from 'crypto';
import { pool } from '../dbAccess/dbpool.js';
import { validateToken } from '../middlewares/validate-token.js';
import { logActions } from '../middlewares/log-actions.js';

const router = express.Router();

/*
  Add new Risk Register.
*/
router.post('/risk-register', validateToken, async (req, res) => {
  const { file_id } = req.body

  let riskRegisterId = randomBytes(8).toString('hex');
  await pool
  .query(`insert into rr_risk_register (file_id, risk_reg_id) values (?, ?)`,
    [file_id, riskRegisterId])
  .then((result) => {
    
  })
  .catch((error) => {
    return res.status(500).send({ message: error.message });
  });

  return res.status(200).send(
    { 
      risk_reg_id: riskRegisterId, 
      message: 'Risk register successfully added.' 
    });
});

/*
  Get risk register for given file_id.
*/
router.get('/risk-register/:fileId', validateToken, async (req, res) => {
  const fileId = req.params.fileId;

  try {
    let [rows] = await pool.query(`select risk_reg_id from rr_risk_register where file_id = ?`, [fileId]);

    res.status(200).send({ rows });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

/*
  Update risk register with submission data.
*/
router.patch('/risk-register/:riskRegId', validateToken, logActions, async (req, res) => {
  const riskRegId = req.params.riskRegId;
  const { submissionData } = req.body

  await pool
  .query(`update rr_risk_register
          set submission_notes = ?,
              submission_date = now(),
              register_month = ?,
              status = ?
          where risk_reg_id = ?`,
          [submissionData.submission_notes, submissionData.register_month, submissionData.status, riskRegId])
  .then((result) => {
    return res.status(200).send({ message: 'Risk register successfully submitted' });
  })
  .catch((error) => {
    return res.status(500).send({ message: error.message });
  });

});

/*
  Add new Risk to the register.
*/
router.post('/risk-entry', validateToken, async (req, res) => {
  const { risk_reg_id,
    risk_id,
    title,
    status,
    risk_type,
    responsible,
    risk_group,
    subgroup,
    margin_impact,
    cost_revenue,
    description,
    causes,
    impact,
    probability,
    timeframe,
    likelihood,
    risk_rating,
    fin_best_case,
    fin_impact,
    fin_most_likely,
    fin_worst_case,
    sched_best_case,
    sched_impact,
    sched_most_likely,
    sched_worst_case,
    explanation,
    target,
    target_notes } = req.body

  let riskKey = randomBytes(8).toString('hex');

  await pool
  .query(`insert into rr_risk (
          risk_reg_id,
          risk_key,
          risk_id,
          title,
          status,
          risk_type,
          responsible,
          risk_group,
          subgroup,
          margin_impact,
          cost_revenue,
          description,
          causes,
          impact,
          probability,
          timeframe,
          likelihood,
          risk_rating,
          fin_best_case,
          fin_impact,
          fin_most_likely,
          fin_worst_case,
          sched_best_case,
          sched_impact,
          sched_most_likely,
          sched_worst_case,
          explanation,
          target,
          target_notes) 
          values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [ risk_reg_id,
      riskKey,
      risk_id,
      title,
      status,
      risk_type,
      responsible,
      risk_group,
      subgroup,
      margin_impact,
      cost_revenue,
      description,
      causes,
      impact,
      probability,
      timeframe,
      likelihood,
      risk_rating,
      fin_best_case,
      fin_impact,
      fin_most_likely,
      fin_worst_case,
      sched_best_case,
      sched_impact,
      sched_most_likely,
      sched_worst_case,
      explanation,
      target,
      target_notes])
  .then((result) => {
    return res.status(200).send({ risk_key: riskKey, message: 'Risk successfully added.' });
  })
  .catch((error) => {
    return res.status(500).send({ message: error.message });
  });
});

/*
  Get all risk entries for a risk register.
*/
router.get('/risk-entry/:riskRegId', validateToken, async (req, res) => {
  const riskRegId = req.params.riskRegId;

  try {
    let [rows] = await pool
      .query(
         `select 
            risk_key,
            risk_id,
            title,
            l1.item_name as status,
            l2.item_name as risk_type,
            l3.item_name as responsible,
            l4.item_name as risk_group,
            l5.item_name as subgroup,
            margin_impact,
            l6.item_name as cost_revenue,
            description,
            causes,
            impact,
            probability,
            timeframe,
            likelihood,
            risk_rating,
            fin_best_case,
            fin_impact,
            fin_most_likely,
            fin_worst_case,
            sched_best_case,
            sched_impact,
            sched_most_likely,
            sched_worst_case,
            explanation,
            target,
            target_notes 
          from 
            rr_risk rs
            left outer join rr_list_items l1 on (rs.status = l1.item_id)
            left outer join rr_list_items l2 on (rs.risk_type = l2.item_id)
            left outer join rr_list_items l3 on (rs.responsible = l3.item_id)
            left outer join rr_list_items l4 on (rs.risk_group = l4.item_id)
            left outer join rr_list_items l5 on (rs.subgroup = l5.item_id)
            left outer join rr_list_items l6 on (rs.cost_revenue = l6.item_id)
          where 
            rs.risk_reg_id = ?`, [riskRegId]);

    res.status(200).send({ risks: rows });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

/*
  Get single risk entry for a given risk register id and risk key.
*/
router.get('/risk-entry/:riskRegId/:riskKey', validateToken, async (req, res) => {
  const riskRegId = req.params.riskRegId;
  const riskKey = req.params.riskKey;

  try {
    let [rows] = await pool
      .query(`select 
              risk_reg_id,
              risk_key,
              risk_id,
              title,
              status,
              risk_type,
              responsible,
              risk_group,
              subgroup,
              margin_impact,
              cost_revenue,
              description,
              causes,
              impact,
              probability,
              timeframe,
              likelihood,
              risk_rating,
              fin_best_case,
              fin_impact,
              fin_most_likely,
              fin_worst_case,
              sched_best_case,
              sched_impact,
              sched_most_likely,
              sched_worst_case,
              explanation,
              target,
              target_notes
              from rr_risk 
              where risk_reg_id = ?
                and risk_key = ?`, [riskRegId, riskKey]);

    res.status(200).send({ risk: rows });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

/*
  Update risk entry for a given risk register and risk.
*/
router.patch('/risk-entry/:riskRegId/:riskKey', validateToken, logActions, async (req, res) => {
  const riskRegId = req.params.riskRegId;
  const riskKey = req.params.riskKey;
  const { risk_id,
    title,
    status,
    risk_type,
    responsible,
    risk_group,
    subgroup,
    margin_impact,
    cost_revenue,
    description,
    causes,
    impact,
    probability,
    timeframe,
    likelihood,
    risk_rating,
    fin_best_case,
    fin_impact,
    fin_most_likely,
    fin_worst_case,
    sched_best_case,
    sched_impact,
    sched_most_likely,
    sched_worst_case,
    explanation,
    target,
    target_notes } = req.body

  await pool
  .query(`update rr_risk
          set risk_id = ?,
          title = ?,
          status = ?,
          risk_type = ?,
          responsible = ?,
          risk_group = ?,
          subgroup = ?,
          margin_impact = ?,
          cost_revenue = ?,
          description = ?,
          causes = ?,
          impact = ?,
          probability = ?,
          timeframe = ?,
          likelihood = ?,
          risk_rating = ?,
          fin_best_case = ?,
          fin_impact = ?,
          fin_most_likely = ?,
          fin_worst_case = ?,
          sched_best_case = ?,
          sched_impact = ?,
          sched_most_likely = ?,
          sched_worst_case = ?,
          explanation = ?,
          target = ?,
          target_notes = ?
          where risk_reg_id = ?
            and risk_key = ?`,
          [ risk_id,
            title,
            status,
            risk_type,
            responsible,
            risk_group,
            subgroup,
            margin_impact,
            cost_revenue,
            description,
            causes,
            impact,
            probability,
            timeframe,
            likelihood,
            risk_rating,
            fin_best_case,
            fin_impact,
            fin_most_likely,
            fin_worst_case,
            sched_best_case,
            sched_impact,
            sched_most_likely,
            sched_worst_case,
            explanation,
            target,
            target_notes,
            riskRegId,
            riskKey])
  .then((result) => {
    return res.status(200).send({ message: 'Risk successfully updated.' });
  })
  .catch((error) => {
    return res.status(500).send({ message: error.message });
  });

});

/*
  Get list id for a given list name.
*/
router.get('/list/:name', validateToken, async (req, res) => {
    const name = req.params.name;

    try {
      let [rows] = await pool.query(`select list_id from rr_lists where list_name = ?`, [name]);

      res.status(200).send({ rows });
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
});

/*
  Get list items for given list name.
*/
router.get('/list-items/:name', validateToken, async (req, res) => {
  const name = req.params.name;

  try {
    let [rows] = await pool
    .query(`select list_id, item_id, item_name
            from rr_list_items
            where list_id = (select list_id from rr_lists where list_name = ?)`, [name]);
    res.status(200).send({ list: rows });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

/*
  Risk Actions add
*/
router.post('/risk-action', validateToken, async (req, res) => {
  const { 
    risk_key,
    action_id,
    responsible,
    status,
    description,
    due_date,
    raised_date,
    notes
   } = req.body;

  let riskActionKey = randomBytes(8).toString('hex');

  await pool
  .query(`insert into rr_risk_action (
          risk_key,
          action_key,
          action_id,
          responsible,
          status,
          description,
          due_date,
          notes) values (?,?,?,?,?,?,?,?)`,
    [risk_key,
     riskActionKey,
     action_id,
     responsible,
     status,
     description,
     due_date,
     notes])
  .then((result) => {
    return res.status(200).send(
      { 
        action_key: riskActionKey, 
        message: 'Risk action successfully added.' 
      }
    );    
  })
  .catch((error) => {
    return res.status(500).send({ message: error.message });
  });

});

/*
  Get single Risk Action
*/
router.get('/risk-action/:riskKey/:actionKey', validateToken, async (req, res) => {
  const riskKey = req.params.riskKey;
  const riskActionKey = req.params.actionKey;

  console.log(riskActionKey, riskKey)

  await pool
  .query(`select 
            risk_key,
            action_key,
            action_id,
            responsible,
            status,
            description,
            DATE_FORMAT(due_date, '%Y-%m-%d') as due_date,
            DATE_FORMAT(raised_date, '%Y-%m-%d') as raised_date,
            notes
          from
            rr_risk_action 
          where 
            risk_key = ?
            and action_key = ?`, [riskKey, riskActionKey])
  .then((result) => {
    return res.status(200).send({ action: result[0] });    
  })
  .catch((error) => {
    return res.status(500).send({ message: error.message });
  });
});

/*
  Get all Risk Actions
*/
router.get('/risk-action/:riskKey', validateToken, async (req, res) => {
  const riskKey = req.params.riskKey;

  await pool
  .query(`select 
            risk_key,
            action_key,
            action_id,
            l1.item_name as responsible,
            l2.item_name as status,
            description,
            DATE_FORMAT(due_date, '%d-%m-%Y') as due_date,
            DATE_FORMAT(raised_date, '%d-%m-%Y') as raised_date,
            notes
          from
            rr_risk_action ra
            left outer join rr_list_items l1 on (ra.responsible = l1.item_id)
            left outer join rr_list_items l2 on (ra.status = l2.item_id)
          where
            risk_key = ?`, [riskKey])
  .then((result) => {
    return res.status(200).send({ actions: result });    
  })
  .catch((error) => {
    return res.status(500).send({ message: error.message });
  });
});

/*
  Update list items.
*/
router.patch('/risk-action/:riskKey/:actionKey', validateToken, logActions, async (req, res) => {

  const riskKey = req.params.riskKey;
  const actionKey = req.params.actionKey;
  const { 
    action_id,
    responsible,
    status,
    description,
    due_date,
    notes } = req.body

  await pool
  .query(`update
            rr_risk_action
          set
            action_id = ?,
            responsible = ?,
            status = ?,
            description = ?,
            due_date = ?,
            notes = ?
          where
            risk_key = ? 
            and action_key = ?`,
        [ action_id,
          responsible,
          status,
          description,
          due_date,
          notes,
          riskKey,
          actionKey
        ])
  .then((result) => {
    return res.status(200).send({ message: 'Action successfully updated' });
  })
  .catch((error) => {
    return res.status(500).send({ message: error.message });
  });
});

/*
  Add list items.
*/
router.post('/list-items-add/:listId', validateToken, logActions, async (req, res) => {
  const listId = req.params.listId;
  const { listItems } = req.body

  listItems.forEach(async item => {
    let itemId = randomBytes(4).toString('hex');
    await pool
    .query(`insert into rr_list_items (list_id, item_id, item_name) values (?, ?, ?)`,
      [listId, itemId, item.item_name])
    .then((result) => {
    })
    .catch((error) => {
      return res.status(500).send({ message: error.message });
    });
  });

  return res.status(200).send({ message: 'List items successfully added' });

});

/*
  Delete list items.
*/
router.delete('/list-items-delete/:id', validateToken, async (req, res) => {
  const listId = req.params.id;
  const { listItems } = req.body

  listItems.forEach(async item => {
    await pool
    .query(`delete from rr_list_items where list_id = ? and item_id = ?`,
      [listId, item.item_id])
    .then((result) => {
    })
    .catch((error) => {
      return res.status(500).send({ message: error.message });
    });
  });

  return res.status(200).send({ message: 'List items successfully deleted' });
});

/*
  Update list items.
*/
router.patch('/list/:id', validateToken, logActions, async (req, res) => {
  const listId = req.params.id;
  const { listItems } = req.body

  listItems.forEach(async item => {
    await pool
    .query(`update rr_list_items set item_name = ? where list_id = ? and item_id = ?`,
      [item.item_name, listId, item.item_id])
    .then((result) => {
    })
    .catch((error) => {
      return res.status(500).send({ message: error.message });
    });
  });

  return res.status(200).send({ message: 'List successfully updated' });

});

/*
  Get logic id for a given logic name.
*/
router.get('/logic/:name', validateToken, async (req, res) => {
  const name = req.params.name;

  try {
    let [rows] = await pool.query(`select logic_id from rr_logics where logic_name = ?`, [name]);

    res.status(200).send({ rows });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

/*
  Get logic items.
*/
router.get('/logic-items/:id', validateToken, async (req, res) => {
  const id = req.params.id;

  try {
    let [rows] = 
      await pool.query(`select item_id, likelyhood, probability
        from rr_logic_items
        where logic_id = ?`, [id]);

    res.status(200).send({ logic: rows });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

/*
  Update logic items.
*/
router.patch('/logic/:id', validateToken, logActions, async (req, res) => {
  const logicId = req.params.id;
  const { logicItems } = req.body

  logicItems.forEach(async item => {
    await pool
    .query(`update rr_logic_items set likelyhood = ?, probability = ?
            where logic_id = ? and item_id = ?`,
      [item.likelyhood, item.probability, logicId, item.item_id])
    .then((result) => {
    })
    .catch((error) => {
      return res.status(500).send({ message: error.message });
    });
  });

  return res.status(200).send({ message: 'Logic successfully updated' });

});

/*
  Add logic items.
*/
router.post('/logic-items-add/:id', validateToken, async (req, res) => {
  const logicId = req.params.id;
  const { logicItems } = req.body

  logicItems.forEach(async item => {
    let itemId = randomBytes(4).toString('hex');
    await pool
    .query(`insert into rr_logic_items (logic_id, item_id, likelyhood, probability) values (?, ?, ?, ?)`,
      [logicId, itemId, item.likelyhood, item.probability])
    .then((result) => {
    })
    .catch((error) => {
      //return res.status(500).send({ message: error.message });
      console.log("error is: ", error)
    });
  });

  return res.status(200).send({ message: 'Logic items successfully added' });

});

/*
  Delete logic items.
*/
router.post('/logic-items-delete/:id', validateToken, async (req, res) => {
  const logicId = req.params.id;
  const { logicItems } = req.body

  logicItems.forEach(async item => {
    await pool
    .query(`delete from rr_logic_items where logic_id = ? and item_id = ?`,
      [logicId, item.item_id])
    .then((result) => {
    })
    .catch((error) => {
      return res.status(500).send({ message: error.message });
    });
  });

  return res.status(200).send({ message: 'Logic items successfully deleted' });

});

/*
  Logics Part 2
*/

/*
  Get logic2 id for a given logic name.
*/
router.get('/logic2/:name', validateToken, async (req, res) => {
  const name = req.params.name;

  try {
    let [rows] = await pool.query(`select logic_id from rr_logics2 where logic_name = ?`, [name]);

    return res.status(200).send({ rows });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
});

/*
  Get logic 2 items.
*/
router.get('/logic2-items/:id', validateToken, async (req, res) => {
  const id = req.params.id;

  try {
    let [rows] = 
      await pool.query(`select item_id, likelyhood, insignificant, minor, moderate, major, catastrophic
                        from rr_logic2_items
                        where logic_id = ?`, [id]);

    return res.status(200).send({ logic: rows });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
});

/*
  Update logic 2 items.
*/
router.patch('/logic2/:id', validateToken, logActions, async (req, res) => {
  const logicId = req.params.id;
  const { logicItems } = req.body

  let sqlError = false;

  logicItems.forEach(async item => {
    await pool
    .query(`update rr_logic2_items set likelyhood = ?, insignificant = ?, minor = ?,
            moderate = ?, major = ?, catastrophic = ?
            where logic_id = ? and item_id = ?`,
      [item.likelyhood, item.insignificant, item.minor, item.moderate,
       item.major, item.catastrophic, logicId, item.item_id])
    .then((result) => {
    })
    .catch((error) => {
      sqlError = true;
    });
  });

  if (sqlError) {
    return res.status(500).send({ message: error.message });
  }

  return res.status(200).send({ message: 'Logic successfully updated' });
});

/*
  Add logic 2 items.
*/
router.post('/logic2-items-add/:id', validateToken, async (req, res) => {
  const logicId = req.params.id;
  const { logicItems } = req.body

  logicItems.forEach(async item => {
    let itemId = randomBytes(4).toString('hex');
    await pool
    .query(`insert into rr_logic2_items (logic_id,item_id,likelyhood,
              insignificant,minor,moderate,major,catastrophic)
            values (?, ?, ?, ?, ?, ?, ?, ?)`,
      [logicId, itemId, item.likelyhood, item.insignificant, item.minor,
       item.moderate, item.major, item.catastrophic])
    .then((result) => {
    })
    .catch((error) => {
      return res.status(500).send({ message: error.message });
    });
  });

  return res.status(200).send({ message: 'Logic items successfully added' });

});

/*
  Delete logic 2 items.
*/
router.post('/logic2-items-delete/:id', validateToken, async (req, res) => {
  const logicId = req.params.id;
  const { logicItems } = req.body

  logicItems.forEach(async item => {
    await pool
    .query(`delete from rr_logic2_items where logic_id = ? and item_id = ?`,
      [logicId, item.item_id])
    .then((result) => {
    })
    .catch((error) => {
      return res.status(500).send({ message: error.message });
    });
  });

  return res.status(200).send({ message: 'Logic items successfully deleted' });

});

/*
  Get list of projects with last submission date for the user.
*/
router.get('/projects/:id', validateToken, async (req, res) => {
  const userid = req.params.id;

  try {
    let [rows] = await pool.query(`select fl.file_id, proj.* from
    (select s.project_id, s.proj_title, s.project_month
            from
              (select p.project_id, p.proj_title,
                      max(project_month) as project_month
              from files f, projects p
              where f.project_id = p.project_id
              group by p.project_id, p.proj_title) s,
              (select p.project_id
              from projects p, user_projects u
              where p.project_id = u.project_id
                and u.userid = ?) p
            where s.project_id = p.project_id) proj, files fl
    where fl.project_id = proj.project_id
      and fl.project_month = proj.project_month`, [userid]);
    return res.status(200).send({ projects: rows });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
});

export { router as riskRouter }