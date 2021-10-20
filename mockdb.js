import {connectPostgres} from './src/server/db/databaseLocalPG.js'
process.env.pghost = 'testPostgres'
console.log('setting up temp database:', process.env.pghost)
connectPostgres(true)
// .then(()=>{
// console.log('temp db setup complete')
// process.exit(1)
// })
