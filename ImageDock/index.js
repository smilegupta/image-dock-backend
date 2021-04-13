const {putItem} = require("./db-helpers");
const uuid = require('uuid');

exports.handler = async (event, context) => {
    console.log(event);
    const collectionId = uuid.v4();
    const input = JSON.parse(event.body);
    console.log({TableName: process.env.USER_IMAGES_TABLENAME,
        Item: {
            userId: input.userId,
            collectionId: collectionId,
            createdAt: new Date().toISOString(),
            collectionName: input.collectionName,
            collectionDescription: input.collectionDescription
        }})
    await putItem({
        TableName: process.env.USER_IMAGES_TABLENAME,
        Item: {
            userId: input.userId,
            collectionId: collectionId,
            createdAt: new Date().toISOString(),
            collectionName: input.collectionName,
            collectionDescription: input.collectionDescription
        }
    });
    return {
        statusCode : 200,
        body: "Collection Created Successfully"
    }
}