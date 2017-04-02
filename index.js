"use strict";
const path = require('path');
const cv = require('opencv');
const jimp = require('jimp');
const Hapi = require('hapi');
const server = new Hapi.Server();

server.connection({
  port: process.env.PORT || 5000
});

const getBuffer = async (image) => {
  return new Promise((resolve, reject) => {
    image.getBuffer(jimp.MIME_JPEG, (err, im) => {
      if (err) {
        console.log(err);
        return reject();
      }

      return resolve(im);
    });
  });
};

const getFaces = async (image) => {
  return new Promise((resolve, reject) => {
    cv.readImage(image, async function(err, im){
        if (err) {
          console.log(err);
          return reject();
        }
        console.log('Loaded image in OpenCV');

        im.detectObject(cv.FACE_CASCADE, {}, async function(err, faces){
          if (err) {
            console.log('Failed to get faces');
            return reject();
          }

          console.log(`Got ${faces.length} faces`);
          return resolve(faces);
        });
    });
  });
}

server.register(require('inert'), err => {
  if (err) {
    throw err;
  }

  server.route({
    method: 'GET',
    path:'/',
    handler: async (request, reply) => {
      try {
        const imageUrl = request.query.image;
        if (imageUrl) {
          console.log(`Image URL: ${imageUrl}`);
          const inputImage = await jimp.read(imageUrl);
          const faces = await getFaces(await getBuffer(inputImage));

          for (const face of faces){
            const ben = await jimp.read('https://placeholder.benadventure.club/face');
            console.log(face);
            await ben.resize(face.width*2, face.height*2);
            inputImage.composite(ben, face.x - (face.width / 2), face.y - (face.height / 2));
          }

          return reply(await getBuffer(inputImage))
            .type('image/jpg');
        } else {
          console.log(`Fetching index page`);
          return reply.file(`./public/index.html`);
        }
      } catch (err) {
        console.log(err);
        return reply().statusCode(500);
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: 'public'
        }
    }
  });

  server.start((err) => {
    if (err) {
      throw err;
    }
    console.log('Server running at:', server.info.uri);
  });
});
