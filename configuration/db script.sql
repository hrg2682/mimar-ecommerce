/*
 12th March 2023
 Lists
 */

create table rr_lists (list_id varchar(8), list_name varchar(100));

create table rr_list_items (
    list_id varchar(8),
    item_id varchar(8),
    item_name varchar(100)
);

insert into rr_lists (list_id, list_name)
values ('419b2488', 'Group');
insert into rr_lists (list_id, list_name)
values ('8677614e', 'Sub-Group');
insert into rr_lists (list_id, list_name)
values ('9742614e', 'Costing Logic');
insert into rr_lists (list_id, list_name)
values ('5212614e', 'Risk Type');
insert into rr_lists (list_id, list_name)
values ('763ec198', 'Category');
insert into rr_lists (list_id, list_name)
values ('d2126a3e', 'Sub Category');
insert into rr_lists (list_id, list_name)
values ('5e7d314e', 'Cost Code');
insert into rr_list_items (list_id, item_id, item_name)
values ('419b2488', 'e912bbe2', 'Commercial');
insert into rr_list_items (list_id, item_id, item_name)
values ('419b2488', '9edaf699', 'Subcontractors');
insert into rr_list_items (list_id, item_id, item_name)
values ('419b2488', '7777281e', 'Delivery');
insert into rr_list_items (list_id, item_id, item_name)
values ('419b2488', '70cf09d1', 'Programme');
insert into rr_list_items (list_id, item_id, item_name)
values ('419b2488', 'fbe0c7f8', 'Design / Technical');
insert into rr_list_items (list_id, item_id, item_name)
values ('419b2488', 'e4b921fe', 'Financial');
insert into rr_list_items (list_id, item_id, item_name)
values ('419b2488', '71c06368', 'Legal');
insert into rr_list_items (list_id, item_id, item_name)
values ('419b2488', 'ea0ea622', 'Social');
insert into rr_list_items (list_id, item_id, item_name)
values ('419b2488', '98236c0d', 'Logistics');
insert into rr_list_items (list_id, item_id, item_name)
values ('419b2488', 'b1b0ce9d', 'Contractual');
insert into rr_list_items (list_id, item_id, item_name)
values (
        '419b2488',
        '1ff83601',
        'Management / Leadership'
    );
insert into rr_list_items (list_id, item_id, item_name)
values ('419b2488', '97a62eb7', 'Environmental');
insert into rr_list_items (list_id, item_id, item_name)
values ('419b2488', '6d07bca9', 'Procurement');
insert into rr_list_items (list_id, item_id, item_name)
values ('419b2488', '1aa1ee15', 'Other');
/*
 Script 15 March 2023
 */
create table rr_logics (logic_id varchar(8), logic_name varchar(100));
create table rr_logic_items (
    logic_id varchar(8),
    item_id varchar(8),
    likelyhood varchar(100),
    probability varchar(100)
);
create table rr_logics2 (logic_id varchar(8), logic_name varchar(100));
create table rr_logic2_items (
    logic_id varchar(8),
    item_id varchar(8),
    likelyhood varchar(100),
    insignificant varchar(100),
    minor varchar(100),
    moderate varchar(100),
    major varchar(100),
    catastrophic varchar(100)
);
insert into rr_logics2 (logic_id, logic_name)
values ('d4c371f0', 'Project Impact');
insert into rr_logics2 (logic_id, logic_name)
values ('e851a1fc', 'Opportunity Impact');
insert into rr_logic2_items (
        logic_id,
        item_id,
        likelyhood,
        insignificant,
        minor,
        moderate,
        major,
        catastrophic
    )
values (
        'd4c371f0',
        'fedabeb9',
        'A - Almost Certain',
        'Moderate',
        'High',
        'Very High',
        'Extreme',
        'Extreme'
    );
insert into rr_logic2_items (
        logic_id,
        item_id,
        likelyhood,
        insignificant,
        minor,
        moderate,
        major,
        catastrophic
    )
values (
        'd4c371f0',
        '99b0472c',
        'B - Likely',
        'Moderate',
        'Moderate',
        'High',
        'Very High',
        'Extreme'
    );
insert into rr_logic2_items (
        logic_id,
        item_id,
        likelyhood,
        insignificant,
        minor,
        moderate,
        major,
        catastrophic
    )
values (
        'd4c371f0',
        'feeffff6',
        'C - Possible',
        'Moderate',
        'Moderate',
        'High',
        'High',
        'Very High'
    );
insert into rr_logic2_items (
        logic_id,
        item_id,
        likelyhood,
        insignificant,
        minor,
        moderate,
        major,
        catastrophic
    )
values (
        'd4c371f0',
        '75c5c48e',
        'D - Unlikely',
        'Low',
        'Low',
        'Moderate',
        'High',
        'Very High'
    );
insert into rr_logic2_items (
        logic_id,
        item_id,
        likelyhood,
        insignificant,
        minor,
        moderate,
        major,
        catastrophic
    )
values (
        'd4c371f0',
        '75db8825',
        'E - Rare',
        'Low',
        'Low',
        'Moderate',
        'Moderate',
        'High'
    );
insert into rr_logic2_items (
        logic_id,
        item_id,
        likelyhood,
        insignificant,
        minor,
        moderate,
        major,
        catastrophic
    )
values (
        'e851a1fc',
        '2ea5cd1f',
        'A - Almost Certain',
        'Moderate',
        'High',
        'Very High',
        'Extreme',
        'Extreme'
    );
insert into rr_logic2_items (
        logic_id,
        item_id,
        likelyhood,
        insignificant,
        minor,
        moderate,
        major,
        catastrophic
    )
values (
        'e851a1fc',
        '4fa89091',
        'B - Likely',
        'Moderate',
        'Moderate',
        'High',
        'Very High',
        'Extreme'
    );
insert into rr_logic2_items (
        logic_id,
        item_id,
        likelyhood,
        insignificant,
        minor,
        moderate,
        major,
        catastrophic
    )
values (
        'e851a1fc',
        '5ba09539',
        'C - Possible',
        'Moderate',
        'Moderate',
        'High',
        'High',
        'Very High'
    );
insert into rr_logic2_items (
        logic_id,
        item_id,
        likelyhood,
        insignificant,
        minor,
        moderate,
        major,
        catastrophic
    )
values (
        'e851a1fc',
        'bc199eee',
        'D - Unlikely',
        'Low',
        'Low',
        'Moderate',
        'High',
        'Very High'
    );
insert into rr_logic2_items (
        logic_id,
        item_id,
        likelyhood,
        insignificant,
        minor,
        moderate,
        major,
        catastrophic
    )
values (
        'e851a1fc',
        '710961e8',
        'E - Rare',
        'Low',
        'Low',
        'Moderate',
        'Moderate',
        'High'
    );

/*
    4th April 2023
*/
drop table risk_info;

drop table rr_risk_register;

create table rr_risk_register (
  file_id varchar(16),
  risk_reg_id varchar(16),
  submission_notes text,
  creation_date datetime default CURRENT_TIMESTAMP,
  submission_date datetime
);

ALTER TABLE rr_risk_register ADD COLUMN register_month date;
ALTER TABLE rr_risk_register ADD COLUMN status varchar(20) default 'Not submitted';

drop table rr_risk;

create table rr_risk (
  risk_reg_id varchar(16) not null,
  risk_key varchar(16) not null,
  risk_id text,
  title text,
  status varchar(8),
  risk_type varchar(8),
  responsible varchar(16),
  risk_group varchar(8),
  subgroup varchar(8),
  margin_impact text,
  cost_revenue varchar(8),
  description text,
  causes text,
  impact text,
  probability text,
  timeframe text,
  likelihood varchar(8),
  risk_rating varchar(8),
  fin_best_case text,
  fin_impact text,
  fin_most_likely text,
  fin_worst_case text,
  sched_best_case text,
  sched_impact text,
  sched_most_likely text,
  sched_worst_case text,
  explanation text,
  target text,
  target_notes text
);

/*
    9th April 2023
*/
CREATE TABLE rr_risk_action (
  risk_key varchar(16) DEFAULT NULL,
  action_key varchar(16) DEFAULT NULL,
  responsible varchar(8) DEFAULT NULL,
  status varchar(8) DEFAULT NULL,
  description text,
  due_date date DEFAULT NULL,
  raised_date datetime DEFAULT CURRENT_TIMESTAMP,
  notes text,
  action_id varchar(100) DEFAULT NULL
)
