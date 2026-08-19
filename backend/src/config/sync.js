const schemas = require('../models');

async function syncAll() {
    for (const modelName of Object.keys(schemas)) {
        console.log(`Sincronizando tabela para: ${modelName}`);
        await schemas[modelName].syncDBAsync();
    }
    console.log('Todas as tabelas foram criadas/sincronizadas com sucesso!');
    process.exit(0);
}

syncAll().catch(err => {
    console.error(err);
    process.exit(1);
});
