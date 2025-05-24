import { uuid, sparqlEscapeUri, sparqlEscapeString, sparqlEscapeDateTime } from 'mu';
import { querySudo, updateSudo } from '@lblod/mu-auth-sudo';

const prefixes = `
  PREFIX nfo: <http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#>
  PREFIX muAccount: <http://mu.semte.ch/vocabularies/account/>
  PREFIX muSession: <http://mu.semte.ch/vocabularies/session/>
  PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
  PREFIX nie: <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#>
  PREFIX nco: <http://www.semanticdesktop.org/ontologies/2007/03/22/nco#>
  PREFIX foaf: <http://xmlns.com/foaf/0.1/>
`
const graph = process.env.MU_APPLICATION_GRAPH;

export async function getIPDCService(id) {
  const result = await querySudo(`
  ${prefixes}
  SELECT ?product
  WHERE {
    ?product mu:uuid ${sparqlEscapeString(id)} .
  } LIMIT 1
  `);

  return result.results.bindings[0]?.['product'].value;
}

export async function createBookmark(sessionUri, object) {
  const id = uuid();
  const uri = `http://lblod.data.gift/bookmarks/${id}`;
  const now = new Date();

  await updateSudo(`
  ${prefixes}
  INSERT {
    GRAPH ${sparqlEscapeUri(graph)} {
      ${sparqlEscapeUri(uri)} a nfo:Bookmark ;
        mu:uuid ${sparqlEscapeString(id)} ;
        nie:contentCreated ${sparqlEscapeDateTime(now)} ;
        nie:contentLastModified ${sparqlEscapeDateTime(now)} ;
        nfo:bookmarks ${sparqlEscapeUri(object)} ;
        nco:creator ?user .
    }
  } WHERE {
    ${sparqlEscapeUri(sessionUri)} muSession:account ?account .
    ?user foaf:account ?account .
  }`);

  return { id, uri, created: now, modified: now, object };
}

export async function getBookmark(id, sessionUri) {
  const result = await querySudo(`
  ${prefixes}
  SELECT ?bookmark ?created ?modified ?product
  WHERE {
    ${sparqlEscapeUri(sessionUri)} muSession:account ?account .
    ?user foaf:account ?account .
    GRAPH ${sparqlEscapeUri(graph)} {
      ?bookmark a nfo:Bookmark ;
        mu:uuid ${sparqlEscapeString(id)} ;
        nie:contentCreated ?created ;
        nie:contentLastModified ?modified ;
        nfo:bookmarks ?product ;
        nco:creator ?user .
    }
  } LIMIT 1
  `);

  if (result.results.bindings.length) {
    const binding = result.results.bindings[0];
    return {
      uri: binding['bookmark'].value,
      id,
      created: new Date(Date.parse(binding['created'].value)),
      modified: new Date(Date.parse(binding['modified'].value)),
      object: binding['product'].value,
    };
  } else {
    return null;
  };
}

export async function listBookmarks(sessionUri) {
  const result = await querySudo(`
  ${prefixes}
  SELECT DISTINCT ?bookmark ?uuid ?created ?modified ?product
  WHERE {
    ${sparqlEscapeUri(sessionUri)} muSession:account ?account .
    ?user foaf:account ?account .
    GRAPH ${sparqlEscapeUri(graph)} {
      ?bookmark a nfo:Bookmark ;
        mu:uuid ?uuid ;
        nie:contentCreated ?created ;
        nie:contentLastModified ?modified ;
        nfo:bookmarks ?product ;
        nco:creator ?user .
    }
  }
  `);

  return result.results.bindings.map((binding) => {
    return {
      uri: binding['bookmark'].value,
      id: binding['uuid'].value,
      created: new Date(Date.parse(binding['created'].value)),
      modified: new Date(Date.parse(binding['modified'].value)),
      object: binding['product'].value,
    };
  });
}

export async function deleteBookmark(bookmarkUri) {
  await updateSudo(`
  ${prefixes}
  DELETE {
    GRAPH ${sparqlEscapeUri(graph)} {
      ${sparqlEscapeUri(bookmarkUri)} ?p ?o .
    }
  } WHERE {
    GRAPH ${sparqlEscapeUri(graph)} {
      ${sparqlEscapeUri(bookmarkUri)} ?p ?o .
    }
  }`);
}

export function bookmarkToJsonApi(bookmark) {
  return {
    type: 'bookmarks',
    id: bookmark.id,
    attributes: {
      uri: bookmark.uri,
      created: bookmark.created.toISOString(),
      modified: bookmark.modified.toISOString(),
      object: bookmark.object
    }
  }
}
