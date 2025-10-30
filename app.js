import { app, errorHandler } from 'mu';
import bodyParser from 'body-parser';
import { getSessionUri } from './utils';
import { bookmarkToJsonApi, createBookmark, deleteBookmark, getBookmark, getIPDCService, listBookmarks, hasAccountPrepopulatedBookmarks, setAccountPrepopulatedBookmarks, prepopulateBookmarksForSession } from './bookmarks';

app.use(
  bodyParser.json({
    type: function (req) {
      return /^application\/json/.test(req.get('Content-Type'));
    },
    limit: '50MB',
  }),
);

app.get('/bookmarks', async function(req, res, next) {
  try {
    const sessionUri = getSessionUri(req);
    const bookmarks = await listBookmarks(sessionUri);
    const data = bookmarks.map(bookmarkToJsonApi);
    res.send({ data });
  } catch (error) {
    console.error(error.message);
    next(error);
  }
});

app.post('/public-services/:id/bookmarks', async function(req, res, next) {
  try {
    const sessionUri = getSessionUri(req);
    const ipdcService = await getIPDCService(req.params.id);
    if (ipdcService) {
      const bookmark = await createBookmark(sessionUri, ipdcService);
      const data = bookmarkToJsonApi(bookmark);
      res.status(201).send({ data })
    } else {
      res.status(404).send();
    }
  } catch (error) {
    console.error(error.message);
    next(error);
  }
});

app.delete('/bookmarks/:id', async function(req, res, next) {
  try {
    const sessionUri = getSessionUri(req);
    const bookmark = await getBookmark(req.params.id, sessionUri);
    if (bookmark) {
      await deleteBookmark(bookmark.uri);
    }
    res.status(204).send();
  } catch (error) {
    console.error(error.message);
    next(error);
  }
});

app.post('/delta', async function (req, res, next) {
  try {
    const sessions = new Set();
    req.body.forEach((changeset) => {
      changeset.inserts.forEach((insert) => {
        if (insert.predicate.value === 'http://mu.semte.ch/vocabularies/ext/sessionRole') {
          sessions.add(insert.subject.value);
        }
      });
    });
    for (const session of sessions) {
      const hasPrepopulated = await hasAccountPrepopulatedBookmarks(session);
      if (!hasPrepopulated) {
        await prepopulateBookmarksForSession(session);
        await setAccountPrepopulatedBookmarks(session);
      }
    }
  } catch (error) {
    console.error(error.message);
    next(error);
  }
});

app.use(errorHandler);
