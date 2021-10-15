const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const mongoose = require('mongoose');
const app = require('./app');

// connecting our database with mongoose
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
  })
  .then(() => console.log('Database connected successfully.....!'));

const PORT = process.env.PORT || 3000;
// app listening to our random port number
const server = app.listen(PORT, () => {
  console.log(`The server is running on http://localhost:${PORT}`);
});

// unhandled rejection error handling
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Unhandled Rejection Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
