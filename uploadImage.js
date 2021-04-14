const AWS = require("aws-sdk");
// Configure AWS with bucket.
const { S3_BUCKET } = process.env;
// Create an s3 instance
const s3 = new AWS.S3();

exports.handler = async (event, context, callback) => {
  console.log(event)
  const base64EncodedData = event.body["url"];

  // Ensure that you POST a base64 data to your server.
  const base64Data = new Buffer.from(
    base64EncodedData.replace(/^data:image\/\w+;base64,/, ""),
    "base64"
  );

  // Getting the file type, ie: jpeg, png or gif
  const type = base64EncodedData.split(";")[0].split("/")[1];
  const current_date = new Date().toISOString();

  // With this setup, uploads an image.
  const params = {
    Bucket: `${S3_BUCKET}`, // required
    Key: `image.${current_date}`, // required
    Body: base64Data,
    ACL: "public-read",
    ContentEncoding: "base64", // required
    ContentType: `image/${type}` // required(type is image type).
  };
  const response = await uploadImage(params);
  console.log("response", response);
  return response;
};

async function uploadImage(params) {
  // Function to upload image to s3.
  try {
    const Location = await s3.upload(params).promise();
    location = Location["Location"];
  } catch (error) {
    console.error(error);
  }
  return location;
}
