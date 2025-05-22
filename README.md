# IPDC bookmarks service
Microservice managing user's bookmarks for IPDC products.

## Getting started
### Adding the service to your stack
Add the following snippet to your `docker-compose.yml` to include the IPDC bookmarks service in your project.

```yml
ipdc-bookmarks:
  image: lblod/ipdc-bookmarks-service
```

## Reference
### Configured
The following environment variables can be configured on the service.

- **MU_APPLICATION_GRAPH** (default: `http://mu.semte.ch/graphs/ipdc/bookmarks`)

### Data model
#### Prefixes
| Prefix | URI                                                         |
|--------|-------------------------------------------------------------|
| nfo    | http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#   |
| nie    | http://www.semanticdesktop.org/ontologies/2007/01/19/nie#   |
| nco    | http://www.semanticdesktop.org/ontologies/2007/03/22/nco#   |
| ipdc   | https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc# |
| foaf   | http://xmlns.com/foaf/0.1/                                  |
| xsd    | http://www.w3.org/2001/XMLSchema#                           |

#### Bookmark
##### Class
`nfo:Bookmark`
##### Properties
| Name     | Predicate                 | Range                        | Definition                               |
|----------|---------------------------|------------------------------|------------------------------------------|
| created  | `nie:contentCreated`      | `xsd:dateTime`               | Date/time the bookmark was created       |
| modified | `nie:contentLastModified` | `xsd:dateTime`               | Date/time the bookmark was last modified |
| object   | `nfo:bookmarks`           | `ipdc:PublicServiceSnapshot` | Bookmarked IPDC product                  |
| creator  | `nco:creator`             | `foaf:Person`                | User that created the bookmark           |

### API
#### GET /bookmarks
Lists all bookmarks of the requesting user (without pagination).
#### POST /public-services/:id/bookmarks
Creates a new bookmark for the given public service for the requesting user.
#### DELETE /bookmarks/:id
Deletes the given bookmark of the requesting user.

## Discussion
### Why not use regular mu-cl-resources
Bookmarks are user specific. In an ideal world access would be handled by mu-authorization storing the bookmarks in user-specific graphs. However, such configuration will break caching as it stands today in the [app-digitaal-loket](https://github.com/lblod/app-digitaal-loket) application. Therefore we opt for this custom service which manages bookmarks on a per user basis using sudo-queries.
