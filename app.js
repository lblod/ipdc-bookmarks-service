import { app, errorHandler } from 'mu';
import { getSessionUri } from './utils';
import { bookmarkToJsonApi, createBookmark, deleteBookmark, getBookmark, getIPDCService, listBookmarks } from './bookmarks';

app.get('/bookmarks', async function(req, res) {
  const sessionUri = getSessionUri(req);
  const bookmarks = await listBookmarks(sessionUri);
  const data = bookmarks.map(bookmarkToJsonApi);
  res.send({ data });
});

app.post('/public-services/:id/bookmarks', async function(req, res) {
  const sessionUri = getSessionUri(req);
  const ipdcService = await getIPDCService(req.params.id);
  if (ipdcService) {
    const bookmark = await createBookmark(sessionUri, ipdcService);
    const data = bookmarkToJsonApi(bookmark);
    res.status(201).send({ data })
  } else {
    res.status(404).send();
  }
});

app.delete('/bookmarks/:id', async function(req, res) {
  const sessionUri = getSessionUri(req);
  const bookmark = await getBookmark(req.params.id, sessionUri);
  if (bookmark) {
    await deleteBookmark(bookmark.uri);
  }
  res.status(204).send();
});

app.use(errorHandler);
