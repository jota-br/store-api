const fs = require('fs');
const path = require('path');
const https = require('https');

const { app } = require('./app');
const { mongoConnect } = require('./utils/mongo.db');

const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');

const { loadFilesSync } = require('@graphql-tools/load-files');
const { makeExecutableSchema } = require('@graphql-tools/schema');

const typesArray = loadFilesSync('**/*', {
    extensions: ['graphql'],
});
const resolversArray = loadFilesSync(path.join(__dirname, '**/*.resolvers.js'));

const PORT = process.env.PORT || 3000;

const server = https.createServer({
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem'),
}, app);

async function startServer() {
    try {

        const schema = makeExecutableSchema({
            typeDefs: typesArray,
            resolvers: resolversArray,
        });

        const apollo = new ApolloServer({
            schema
        });

        await mongoConnect();
        await apollo.start();

        app.use('/graphql', expressMiddleware(apollo));
        app.use('/', (req, res) => {
            res.send('msg');
        });

        server.listen(PORT, () => {
            console.log(`Server listening to port ${PORT}...`);
            console.log(`https://localhost:${PORT}/graphql`);
        });
    } catch (err) {
        console.error(err.message);
        return { success: false, error: err.message };
    }
}

startServer();