const cassandra = require('cassandra-driver');
const client = new cassandra.Client({ contactPoints: ['127.0.0.1'], localDataCenter: 'datacenter1' });

async function resetDb() {
    try {
        await client.connect();
        await client.execute("DROP KEYSPACE IF EXISTS saude_app;");
        console.log("Keyspace 'saude_app' exclu\u00eddo com sucesso.");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

resetDb();
