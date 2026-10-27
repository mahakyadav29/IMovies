require('dotenv').config({
  path: require('path').resolve(__dirname, '../../.env'),
});

const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const { sampleMovies } = require('./seedData');

async function addMissingMovies() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error('MONGO_URI is missing from your server/.env file.');
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log('Connected to MongoDB.');

  let added = 0;
  let skipped = 0;

  for (const movie of sampleMovies) {
    const existingMovie = await Movie.findOne({
      title: movie.title,
    });

    if (existingMovie) {
      console.log(`Skipped (already exists): ${movie.title}`);
      skipped++;
      continue;
    }

    await Movie.create(movie);
    console.log(`Added: ${movie.title}`);
    added++;
  }

  console.log('\nMovie import completed!');
  console.log(`Added: ${added}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Total sample movies: ${sampleMovies.length}`);
}

addMissingMovies()
  .catch((error) => {
    console.error('Movie import failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });