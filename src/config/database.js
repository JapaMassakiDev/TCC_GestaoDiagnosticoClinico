const ExpressCassandra = require('express-cassandra');
require('dotenv').config();

const models = ExpressCassandra.createClient({
    clientOptions: {
        contactPoints: [process.env.CASSANDRA_HOST || '127.0.0.1'],
        protocolOptions: { port: parseInt(process.env.CASSANDRA_PORT) || 9042 },
        keyspace: process.env.CASSANDRA_KEYSPACE || 'saude_app',
        localDataCenter: process.env.CASSANDRA_DATACENTER || 'datacenter1',
        queryOptions: { consistency: ExpressCassandra.consistencies.one }
    },
    ormOptions: {
        defaultReplicationStrategy: {
            class: 'SimpleStrategy',
            replication_factor: 1
        },
        migration: 'safe'
    }
});

const connectDB = async () => {
    try {
        await models.orm.initAsync();
        console.log(`Conexão estabelecida com Apache Cassandra (keyspace: ${process.env.CASSANDRA_KEYSPACE || 'saude_app'})!`);
        return models;
    } catch (err) {
        throw err;
    }
};

module.exports = { models, connectDB };
