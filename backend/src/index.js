import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import { projectRouter } from './routes/project.js';
import { filesRouter } from './routes/files.js';
import { userRouter } from './routes/user.js';
import { companyRouter } from './routes/company.js';
import { roleRouter } from './routes/role.js';
import { riskRouter } from './routes/risk.js';

app.use('/api/user', userRouter);
app.use('/api/file', filesRouter);
app.use('/api/project', projectRouter);
app.use('/api/company', companyRouter);
app.use('/api/role', roleRouter);
app.use('/api/risk', riskRouter);

app.all('*', async (req, res) => {
  return res.status(500).send({ message: 'Request handler not found!'});
});

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }

  if (!process.env.MYSQL_PASSWORD) {
    throw new Error('MYSQL_PASSWORD must be defined');
  }

  if (!process.env.MYSQL_HOST) {
    throw new Error('MYSQL_HOST must be defined');
  }

  if (!process.env.EMAIL_PASSWORD) {
    throw new Error('EMAIL_PASSWORD must be defined');
  }

  app.listen(4000, () => {
    console.log('API Listening on port 4000');
  });
};

start();
