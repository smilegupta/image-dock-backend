const AWS = require("aws-sdk");
// Configure AWS with bucket.
const { S3_BUCKET } = process.env;
// Create an s3 instance
const s3 = new AWS.S3();

// List of headers to be passed in the response
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true
}

async function uploadImage(params) {
  // Function to upload image to s3.
  try {
    const Location = await s3.upload(params).promise();
    location = Location.Location;
  } catch (error) {
    console.error(error);
  }
  return location;
}

/*
 * @apiName Upload image to S3
 * @apiGroup Upload Image
 * @api {post} /upload    Upload images to S3
 *
 * @apiParam {String} url The base64 encoded data of the image
 */
exports.handler = async event => {
  console.log(event);
  const base64EncodedData = event.body.url;

  // Ensure that you POST a base64 data to your server.
  const base64Data = new Buffer.from(
    base64EncodedData.replace(/^data:image\/\w+;base64,/, ""),
    "base64"
  );

  // Getting the file type, ie: jpeg, png or gif
  const type = base64EncodedData.split(";")[0].split("/")[1];
  const currentDate = new Date().toISOString();

  // With this setup, uploads an image.
  const params = {
    Bucket: `${S3_BUCKET}`, // required
    Key: `image.${currentDate}`, // required
    Body: base64Data,
    ACL: "public-read",
    ContentEncoding: "base64", // required
    ContentType: `image/${type}` // required(type is image type).
  };
  const response = await uploadImage(params);
  console.log("response", response);
  return {
    headers,
    statusCode: 200,
    body: response
  };
};
