import express from 'express';

import { mainRouter } from './routes/mainrouter.js';
const app = express();
app.use(express.json());

app.use('/api', mainRouter);
app.listen(3001, () => {
  console.log('Server is running on port 3000');
}   );

