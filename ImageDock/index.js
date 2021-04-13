const {putItem} = require("./db-helpers");

exports.handler = (event, context) => {
    console.log(event);
    return {
        statusCode : 200,
        body: "Collection Created Successfully"
    }
}