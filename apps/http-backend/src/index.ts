import express from 'express';
import { Router } from 'express';
import { mainRouter } from './routes/mainrouter';
const app = express();
app.use(express.json());

app.use('/api', mainRouter);
app.listen(3000, () => {
  console.log('Server is running on port 3000');
}   );

