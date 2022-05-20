const axios = require('axios');

exports.handler = async function (event) {
  const {
    tkn, dbId, dbRegion, 
    ksName, reqBody
  } = JSON.parse(event.body);
  try {
      const {data} = await axios.post(
        `https://${dbId}-${dbRegion}.apps.astra.datastax.com/api/rest/v2/schemas/keyspaces/${ksName}/types`, 
        {...reqBody},
        {headers: {'X-Cassandra-Token': `${tkn}`}
      });
    return {
      statusCode: 200,
      body: JSON.stringify("Type creation initiated")
    };
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify("Couldn't create type")
    };
  }
};
