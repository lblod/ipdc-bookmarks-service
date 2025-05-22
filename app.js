import { app, query, errorHandler } from 'mu';

app.get('/bookmarks', function(req, res) {
  res.send('TODO: list bookmarks of a user');
  // Get session URI from header
  // Query bookmarks with service for user/session
  // Return JSON:API response
});

app.post('/public-services/:id/bookmarks', function(req, res) {
  res.send('TODO: create bookmark for a service for requesting user');
  // Get session URI from header
  // Create bookmark for service for user/session
  // Return JSON:API response
});

app.delete('/bookmarks/:id', function(req, res) {
  res.send('TODO: remove bookmark iff belongs to requesting user');
  // Get session URI from header
  // Check if bookmark belongs to user/session
  // If so, remove bookmark for service for user/session
  // Return JSON:API response
});

app.use(errorHandler);
