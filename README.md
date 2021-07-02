# LDflex makes Linked Data in JavaScript fun
LDflex is a domain-specific language
for querying Linked Data on the Web
as if you were browsing a local JavaScript graph.

[![npm version](https://img.shields.io/npm/v/ldflex.svg)](https://www.npmjs.com/package/ldflex)
[![Build Status](https://travis-ci.com/LDflex/LDflex.svg?branch=master)](https://travis-ci.com/LDflex/LDflex)
[![Coverage Status](https://coveralls.io/repos/github/LDflex/LDflex/badge.svg?branch=master)](https://coveralls.io/github/LDflex/LDflex?branch=master)
[![Dependency Status](https://david-dm.org/LDflex/LDflex.svg)](https://david-dm.org/LDflex/LDflex)
[![DOI](https://zenodo.org/badge/148931900.svg)](https://zenodo.org/badge/latestdoi/148931900)

You can write things like `person.friends.firstName`
to get a list of your friends.
Thanks to the power of [JSON-LD contexts](https://www.w3.org/TR/json-ld/#the-context)
and [JavaScript's Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy),
these properties are not hard-coded in LDflex,
but can be chosen at runtime.
They feel as if you're traversing a local object,
while you're actually querying the Web—without
pulling in all data first.

[Tim Berners-Lee](https://www.w3.org/People/Berners-Lee/)
came up with the idea for such a fluid JavaScript interface to Linked Data,
in a discussion on how to make Linked Data easier for developers.

## Articles and tutorials
- [Tutorial slides](https://comunica.github.io/Tutorial-ISWC2019-Slides-LDflex/)
  and [walkthrough](https://github.com/comunica/Tutorial-ISWC2019-LDflex-on-React/wiki/Tutorial-Walkthrough)
- [Cheatsheet](https://vincenttunru.gitlab.io/tripledoc/docs/cheatsheet)
- [Designing a Linked Data developer experience](https://ruben.verborgh.org/blog/2018/12/28/designing-a-linked-data-developer-experience/),
  discussing the design of LDflex
- [Solid Chess](https://pieterheyvaert.com/blog/2019/02/10/solid-world-summary),
  an app built with LDflex

## Installation
```bash
npm install ldflex
```

In order to execute queries,
you will also need a query engine:
```bash
npm install @ldflex/comunica
```

## Usage
When you have obtained a starting subject,
you can navigate through its properties
using standard JavaScript dot property syntax.

In order to query for the result,
use `await` if you want a single value,
or `for await` to iterate over all values.

### Initialization
```javascript
const { PathFactory } = require('ldflex');
const { default: ComunicaEngine } = require('@ldflex/comunica');
const { namedNode } = require('@rdfjs/data-model');

// The JSON-LD context for resolving properties
const context = {
  "@context": {
    "@vocab": "http://xmlns.com/foaf/0.1/",
    "friends": "knows",
    "label": "http://www.w3.org/2000/01/rdf-schema#label",
  }
};
// The query engine and its source
const queryEngine = new ComunicaEngine('https://ruben.verborgh.org/profile/');
// The object that can create new paths
const path = new PathFactory({ context, queryEngine });
```

### Looking up data on the Web
```javascript
const ruben = path.create({ subject: namedNode('https://ruben.verborgh.org/profile/#me') });
showPerson(ruben);

async function showPerson(person) {
  console.log(`This person is ${await person.name}`);

  console.log(`${await person.givenName} is interested in:`);
  for await (const name of person.interest.label)
    console.log(`- ${name}`);

  console.log(`${await person.givenName} is friends with:`);
  for await (const name of person.friends.givenName)
    console.log(`- ${name}`);
}
```

### Inspecting the generated path expression
```javascript
(async person => {
  console.log(await person.friends.givenName.pathExpression);
})(ruben);

```

### Getting all subjects of a document
```javascript
(async document => {
  for await (const subject of document.subjects)
    console.log(`${subject}`);
})(ruben);
```

### Getting all properties of a subject
```javascript
(async subject => {
  for await (const property of subject.properties)
    console.log(`${property}`);
})(ruben);

```

### Converting an LDflex expression into a SPARQL query
```javascript
(async person => {
  console.log(await person.friends.givenName.sparql);
})(ruben);

```

### Sorting path results
```javascript
(async person => {
  for await (const uri of person.interest.sort('label'))
    console.log(`- ${uri}`);
})(ruben);

```

The sort function takes multiple arguments,
creating a path that sorts on the last argument.
The path can also continue after the sort:
`person.friends.sort('country', 'label').givenName`
will sort the friends based on the label of their country,
and then return their names.

### Accessing collections
Handle `rdf:List`, `rdf:Bag`, `rdf:Alt`, `rdf:Seq` and `rdf:Container`.
```javascript
(async publication => {
  const authors = await publication['bibo:authorList'].list;
})(ordonez_medellin_2014);

```

## Additional Handlers

The following libraries provide handlers that extend the functionality of LDflex:
 - [async-iteration-handlers](https://github.com/LDflex/async-iteration-handlers) Provides methods such as `.map`, `.filter` and `.reduce` for the async-iterable results returned by LDflex.

## License
©2018–present
[Ruben Verborgh](https://ruben.verborgh.org/),
[Ruben Taelman](https://www.rubensworks.net/),
[Jesse Wright](https://github.com/jeswr/).
[MIT License](https://github.com/LDflex/LDflex/blob/master/LICENSE.md).
