import mongoose from "mongoose";

const conn = () => {
    mongoose
        .connect(process.env.DB_URI, {
            dbName: 'bitirmeProjesi',
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        .then(() => {
            console.log("Veritabanina basarilayla bağlanildi")
        })
        .catch((err) => {
            console.log(`DB bağlanti hatasi:, ${err}`)
        });
};

export default conn;
