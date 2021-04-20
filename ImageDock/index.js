const uuid = require("uuid");
const { putItem, queryItems, deleteItem, updateItem } = require("./db-helpers");
const { getInputParams } = require("./utils");

// List of headers to be passed in the response
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true
};

/**
 * @apiName Create collection
 * @apiGroup Collection
 * @api {post} /collection    Create collection for a user
 *
 * @apiParam {String} userId   userId of the person from whom the collection is getting created
 * @apiParam {String} collectionName   name of the collection
 * @apiParam {String} [collectionDescription]   collection's description
 * @apiContentType application/json
 * @apiSampleRequest https://xlpyxuiddk.execute-api.ap-south-1.amazonaws.com/dev/collection
 */
async function createCollection(input) {
  const collectionId = uuid.v4();
  console.log(collectionId);
  await putItem({
    TableName: "UserCollections",
    Item: {
      userId: input.userId,
      collectionId,
      createdAt: new Date().toISOString(),
      collectionName: input.collectionName,
      collectionDescription: input.collectionDescription
    }
  });
  return {
    headers,
    statusCode: 200,
    body: JSON.stringify({ collectionId })
  };
}

/**
 * @apiName Get collection
 * @apiGroup Collection
 * @api {get} /collection/{collectionId}   Get collection details and images in a collection
 *
 * @apiParam {String} collectionId     id of the collection for which the data is requested for
 * @apiParam {String} userId           userId of the person logged-in
 * @apiContentType application/json
 * @apiSampleRequest https://xlpyxuiddk.execute-api.ap-south-1.amazonaws.com/dev/collection/{collectionId}
 */
async function getCollection(userId, collectionId) {
  const res = await queryItems({
    TableName: process.env.USER_IMAGES_TABLENAME,
    KeyConditionExpression: `userId=:userId and collectionId=:collectionId`,
    IndexName: "userId-collectionId-index",
    ExpressionAttributeValues: {
      ":userId": userId,
      ":collectionId": collectionId
    }
  });
  return {
    headers,
    statusCode: 200,
    body: JSON.stringify(res.Items)
  };
}

/**
 * @apiName Get list of collections of the user
 * @apiGroup Collection
 * @api {get} /collection    Get collection details which a user have
 * @apiParam {String} collectionId     id of the collection for which the data is requested for
 * @apiParam {String} userId           userId of the person logged-in
 * @apiContentType application/json
 * @apiSampleRequest https://xlpyxuiddk.execute-api.ap-south-1.amazonaws.com/dev/collection
 */
async function getCollectionsForUser(userId) {
  const res = await queryItems({
    TableName: "UserCollections",
    KeyConditionExpression: `userId=:userId`,
    ExpressionAttributeValues: { ":userId": userId }
  });
  return {
    headers,
    statusCode: 200,
    body: JSON.stringify(res.Items)
  };
}

/**
 * @apiName Add image to collection
 * @apiGroup Collection
 * @api {post} /collection    Adding an image to a collection
 *
 * @apiParam {String} collectionId     id of the collection for which the data is requested for
 * @apiParam {String} userId           userId of the person logged-in
 * @apiParam {String} collectionName   name of the collection to which the image is getting added
 * @apiParam {String} collectionDescription   description of the collection to which the image is getting added
 * @apiParam {String} imageUrl         image URL getting added to the collection
 * @apiContentType application/json
 * @apiSampleRequest https://xlpyxuiddk.execute-api.ap-south-1.amazonaws.com/dev/collection
 */
async function addingImagetoCollection(input) {
  const createdAt = new Date().toISOString();
  const promises = [
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
    headers,
    statusCode: 201,
    body: "Added Successfully"
  };
}

/**
 * @apiName Get recent uploads
 * @apiGroup Recent Uploads
 * @api {get} /recent-uploads    Get the recent image uploads
 * @apiContentType application/json
 * @apiSampleRequest https://xlpyxuiddk.execute-api.ap-south-1.amazonaws.com/dev/recent-uploads
 */
async function getRecentUploads() {
  const res = await queryItems({
    TableName: "PublicImages",
    KeyConditionExpression: `client=:client`,
    ExpressionAttributeValues: { ":client": "ImageDock" },
    Limit: 12,
    ScanIndexForward: false
  });
  return {
    headers,
    statusCode: 200,
    body: JSON.stringify(res.Items.map(r => r.imageUrl))
  };
}

/**
 * @apiName Get recent uploads
 * @apiGroup Recent Uploads
 * @api {get} /recent-uploads    Get the recent image uploads
 * @apiContentType application/json
 * @apiSampleRequest https://xlpyxuiddk.execute-api.ap-south-1.amazonaws.com/dev/recent-uploads
 */
async function storeImage(imageUrl) {
  const createdAt = new Date().toISOString();
  const promises = [
    putItem({
      TableName: "PublicImages",
      Item: {
        client: "ImageDock",
        createdAt,
        imageUrl
      }
    })
  ];
  await Promise.all(promises);
  return {
    headers,
    statusCode: 201,
    body: "Added Successfully"
  };
}

/**
 * @apiName Delete Collection
 * @apiGroup Collection
 * @api {delete} /collection/{collectionId}   Delete user's Collections
 * @apiContentType application/json
 * @apiSampleRequest https://xlpyxuiddk.execute-api.ap-south-1.amazonaws.com/dev/collection/{collectionId}
 */

async function deleteCollection(collectionId, userId) {
  await deleteItem({
    TableName: "UserCollections",
    Key: {
      collectionId,
      userId
    }
  });
  return {
    headers,
    statusCode: 204,
    body: "Collection Deleted Successfully"
  };
}

/**
 * @apiName Update Collection
 * @apiGroup Collection
 * @api {put} /collection/{collectionId}   Update user's Collections
 * @apiContentType application/json
 * @apiSampleRequest https://xlpyxuiddk.execute-api.ap-south-1.amazonaws.com/dev/collection/{collectionId}
 */

async function updateCollection(collectionId, body) {
  await updateItem({
    TableName: "UserCollections",
    Key: {
      collectionId,
      userId: body.userId
    },
    UpdateExpression:
      "set collectionName = :collectionName, collectionDescription=:collectionDescription",
    ExpressionAttributeValues: {
      ":collectionName": body.collectionName,
      ":collectionDescription": body.collectionDescription
    },
    ReturnValues: "UPDATED_NEW"
  });
  return {
    headers,
    statusCode: 200,
    body: "Collection Updated Successfully"
  };
}

exports.handler = async (event) => {
  console.log("Input to the lambda function", event);
  const {
    resource,
    body,
    httpMethod,
    queryParams,
    pathParams
  } = getInputParams(event);

  // creating a new collection
  if (httpMethod === "POST" && resource === "/collection") {
    console.log("I m getting hit");
    return createCollection(body);
  }

  // Get details of a specific collection
  if (httpMethod === "GET" && resource === "/collection/{collectionId}") {
    const { userId } = queryParams;
    const { collectionId } = pathParams;
    console.log("query", queryParams);
    return getCollection(userId, collectionId);
  }

  // Get list of collections for a user
  if (httpMethod === "GET" && resource === "/collection") {
    const { userId } = queryParams;
    return getCollectionsForUser(userId);
  }

  // Add an image to a collection
  if (httpMethod === "POST" && resource === "/collection/image") {
    return addingImagetoCollection(body);
  }

  // Get list of recently uploaded public images
  if (httpMethod === "GET" && resource === "/recent-uploads") {
    return getRecentUploads();
  }

  // Store the publicly uploaded images for fetching under "recent uploads"
  if (httpMethod === "POST" && resource === "/image-store") {
    return storeImage(body.imageURL);
  }

  // Deleting a Collection
  if (httpMethod === "DELETE" && resource === "/collection/{collectionId}") {
    const { collectionId } = pathParams;
    const { userId } = queryParams;
    return deleteCollection(collectionId, userId);
  }

  // Updating a Collection
  if (httpMethod === "PUT" && resource === "/collection/{collectionId}") {
    const { collectionId } = pathParams;
    return updateCollection(collectionId, body);
  }
};
