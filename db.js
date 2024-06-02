import mongoose from 'mongoose';

const conn = () => {
  mongoose
    .connect(process.env.DB_URI, {
      dbName: 'bitirmeProjesi',
    })
    .then(() => {
      console.log('Connected to the DB succesully');
    })
    .catch((err) => {
      console.log(`DB connection err:, ${err}`);
    });
};

export default conn;