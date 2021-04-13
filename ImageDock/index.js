const {putItem} = require("./db-helpers");
const uuid = require('uuid');

exports.handler = async (event, context) => {
    console.log(event);
    const collectionId = uuid.v4();
    console.log({TableName: process.env.USER_IMAGES_TABLENAME,
        Item: {
            userId: event.body.userId,
            collectionId: collectionId,
            createdAt: new Date().toISOString(),
            collectionName: event.body.collectionName,
            collectionDescription: event.body.collectionDescription
        }})
    await putItem({
        TableName: process.env.USER_IMAGES_TABLENAME,
        Item: {
            userId: event.body.userId,
            collectionId: collectionId,
            createdAt: new Date().toISOString(),
            collectionName: event.body.collectionName,
            collectionDescription: event.body.collectionDescription
        }
    });
    return {
        statusCode : 200,
        body: "Collection Created Successfully"
    }
}