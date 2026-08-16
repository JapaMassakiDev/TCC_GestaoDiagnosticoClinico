require('dotenv').config();
const app = require('./src/app');
const { connectDB } = require('./src/config/database');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
        });
    } catch (error) {
        console.error('Falha ao iniciar o servidor: Erro na conexão com Apache Cassandra', error.message);
        process.exit(1); // O servidor não deve iniciar caso não consiga se conectar ao banco
    }
};

startServer();
