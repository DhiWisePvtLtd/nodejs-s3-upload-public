const express = require('express');
const fs = require('fs');
const AWS = require('aws-sdk');
const formidable = require('formidable'); // formidable : A Node.js module for parsing form data, especially file uploads.
require('dotenv').config();
const app = express();

// API Endpoint for uploading file
app.post('/upload', async (req, res) => {
    try {
        const form = formidable.IncomingForm();

        // Parsing
        form.parse(req, async (err, fields, files) => {
            if (err) {
                return res.status(503).json({
                    status: false,
                    message: 'There was an error parsing the files.',
                    error: err
                });
            }

            // Check if multiple files or a single file
            if (!files.myFile.length) {
                //Single file
                const file = files.myFile;
                let fileName = file.name;
                let tempPath = file.path;

                /* upload file to S3 */
                //S3 Configuration
                const s3 = new AWS.S3({
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                    region: process.env.AWS_REGION, //Optional
                });

                //Set Parameters for s3
                let params = {
                    Bucket: process.env.AWS_S3_BUCKET_NAME,
                    Body: fs.createReadStream(tempPath),
                    Key: fileName
                };

                await s3.putObject(params, function (err, data) {
                    if (err) {
                        return res
                            .status(503)
                            .json({
                                status: false,
                                error: err,
                                message: 'Something Wrong.'
                            });
                    } else {
                        //let fileUrl = "https://" + process.env.AWS_S3_BUCKET_NAME + ".s3." + process.env.AWS_REGION + ".amazonaws.com/" + newPath
                        return res
                            .status(200)
                            .json({
                                status: true,
                                data: data,
                                message: 'File Successfully Uploaded.'
                            });
                    }
                });
            } else {
                //Multiple
            }
        });
    } catch (e) {
        return res.status(400).json({ status: 400, message: e.message });
    }
});

app.listen(3000, function () {
    console.log('listening on 3000');
});
