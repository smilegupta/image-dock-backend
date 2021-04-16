const {putItem,queryItems} = require("./db-helpers");
const {getInputParams} = require("./utils");
const uuid = require('uuid');

async function createCollection (input){
    const collectionId = uuid.v4();
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
        body: {collectionId}
    }
}

async function getCollection(userId, collectionId){
    const res = await queryItems({
        TableName: process.env.USER_IMAGES_TABLENAME,
        KeyConditionExpression: `userId=:userId and collectionId=:collectionId`, 
        IndexName: "userId-collectionId-index",
        ExpressionAttributeValues: {":userId": userId, ":collectionId": collectionId}
    });
    return{
        statusCode: 200,
        body: res.Items
    }
}

async function getCollectionsForUser(userId){
    const res = await queryItems({
        TableName: process.env.USER_IMAGES_TABLENAME,
        KeyConditionExpression: `userId=:userId`, 
        ExpressionAttributeValues: {":userId": userId}
    });
    return{
        statusCode: 200,
        body: res.Items
    }
}

async function addingImagetoCollection (input) {
    const createdAt = new Date().toISOString();
    const promises = [
        putItem({
            TableName: "AllImages",
            Item: {
                createdAt,
                imageUrl: input.imageUrl
            }
        }),
        putItem({
            TableName: process.env.USER_IMAGES_TABLENAME,
            Item: {
                userId: input.userId,
                collectionId: input.collectionId,
                createdAt,
                collectionName: input.collectionName,
                collectionDescription: input.collectionDescription,
                imageUrl: input.imageUrl
            }
        })
    ];
    await Promise.all(promises);
    return {
        statusCode : 200,
        body: "Added Successfully"
    }
}

exports.handler = async (event, context) => {
    console.log(event);
    const {resource, body, httpMethod, queryParams, pathParams } = getInputParams(event);
    if (httpMethod === "POST" && resource === "/collection"){
        return createCollection(body);
    }
    if (httpMethod === "GET" && resource === "/collection/{collectionId}"){
        const userId = queryParams.userId;
        const collectionId = pathParams.collectionId;
        console.log("query", queryParams)
        return getCollection(userId, collectionId);
    }
    if (httpMethod === "GET" && resource === "/collection"){
        const userId = queryParams.userId;
        return getCollectionsForUser(userId);
    }
    if (httpMethod === "POST" && resource === "/collection/image"){
        return addingImagetoCollection(body);
    }
    
}

