"use strict";
const Koa = require('koa');
const app = new Koa();
const cv = require('opencv');
const jimp = require('jimp');

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

app.use(async (ctx) => {
  console.log('Got request');
  try {
    const imageUrl = ctx.query.image;
    if (imageUrl) {
      console.log(`Image URL: ${imageUrl}`);

      const inputImage = await jimp.read(imageUrl);
      const benImage = await jimp.read('https://placeholder.benadventure.club/face');

      const faces = await getFaces(await getBuffer(inputImage));

      for (const face of faces){
        const ben = benImage.clone();
        console.log(face);
        await ben.resize(face.width*2, face.height*2);
        inputImage.composite(ben, face.x - (face.width / 2), face.y - (face.height / 2));
      }

      ctx.type = 'image/jpg';
      ctx.body = await getBuffer(inputImage);
    } else {
      ctx.status = 404;
    }
  } catch (err) {
    ctx.status = 500;
  }
});

app.listen(process.env.PORT || 5000);
console.log(`Listening on port ${process.env.PORT || 5000}`);
