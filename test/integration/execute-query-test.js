import PathProxy from '../../src/PathProxy';
import ExecuteQueryHandler from '../../src/ExecuteQueryHandler';
import SparqlHandler from '../../src/SparqlHandler';
import PathExpressionHandler from '../../src/PathExpressionHandler';
import InsertFunctionHandler from '../../src/InsertFunctionHandler';
import DeleteFunctionHandler from '../../src/DeleteFunctionHandler';
import ReplaceFunctionHandler from '../../src/ReplaceFunctionHandler';
import SubjectsHandler from '../../src/SubjectsHandler';
import SetFunctionHandler from '../../src/SetFunctionHandler';
import DataHandler from '../../src/DataHandler';
import JSONLDResolver from '../../src/JSONLDResolver';
import LanguageResolver from '../../src/LanguageResolver';
import MutationExpressionsHandler from '../../src/MutationExpressionsHandler';
import { createQueryEngine, deindent } from '../util';
import { namedNode, literal } from '@rdfjs/data-model';
import { iterableToArray } from '../../src/iterableUtils';
import { termPropertyHandler } from '../../src/defaultHandlers';

import context from '../context';
import ThenHandler from '../../src/ThenHandler';

const subject = namedNode('https://example.org/#me');
const queryEngine = createQueryEngine([
  literal('Alice'),
  literal('Bob'),
  literal('Carol'),
]);

const multilingualQueryEngine = createQueryEngine([
  literal('Tomato', 'en'),
  literal('Tomaat', 'nl'),
  literal('Tomate', 'de'),
]);

const resolvers = [
  new LanguageResolver(),
  new JSONLDResolver(context),
];
const handlersPath = {
  then: new ThenHandler(),
  mutationExpressions: new MutationExpressionsHandler(),
  sparql: new SparqlHandler(),
  pathExpression: new PathExpressionHandler(),
  results: new ExecuteQueryHandler(),
  [Symbol.asyncIterator]: {
    handle(pathData, path) {
      return () => path.results[Symbol.asyncIterator]();
    },
  },
  language: termPropertyHandler('language'),
  toString: DataHandler.syncFunction('subject', 'value'),
};

const handlersMutation = {
  then: new ThenHandler(),
  mutationExpressions: new MutationExpressionsHandler(),
  sparql: new SparqlHandler(),
  pathExpression: new PathExpressionHandler(),
  results: new ExecuteQueryHandler(),
  [Symbol.asyncIterator]: {
    handle(pathData, path) {
      return () => path.results[Symbol.asyncIterator]();
    },
  },
  add: new InsertFunctionHandler(),
  delete: new DeleteFunctionHandler(),
  replace: new ReplaceFunctionHandler(),
  set: new SetFunctionHandler(),
  toString: DataHandler.syncFunction('subject', 'value'),
};

describe('when the query engine throws an error', () => {
  let person;
  beforeAll(() => {
    const failingQueryEngine = {
      async *execute() {
        throw new Error('Query engine error');
      },
    };
    const pathProxy = new PathProxy({ handlers: handlersPath, resolvers });
    person = pathProxy.createPath({ queryEngine: failingQueryEngine }, { subject });
  });

  it('rejects with an error to a calling iterator', async () => {
    await expect(iterableToArray(person.firstName)).rejects
      .toThrow('Query engine error');
  });
});

describe('a query path with a path expression handler', () => {
  let person;
  beforeAll(() => {
    const pathProxy = new PathProxy({ handlers: handlersPath, resolvers });
    person = pathProxy.createPath({ queryEngine }, { subject });
  });

  it('returns results for a path with 3 links', async () => {
    const names = await iterableToArray(person.friends.firstName);
    expect(names.map(n => `${n}`)).toEqual(['Alice', 'Bob', 'Carol']);
  });

  it('returns results for nested expression calls', async () => {
    const names = [];
    for await (const friend of person.friends) {
      for await (const firstName of friend.friends.firstName)
        names.push(firstName);
    }
    expect(names.map(n => `${n}`)).toEqual(['Alice', 'Bob', 'Carol', 'Alice', 'Bob', 'Carol', 'Alice', 'Bob', 'Carol']);
  });
});

describe('a query path with a subjects handler', () => {
  let person;
  beforeAll(() => {
    const pathProxy = new PathProxy({ handlers: { ...handlersPath, subjects: new SubjectsHandler() }, resolvers });
    person = pathProxy.createPath({ queryEngine }, { subject });
  });

  it('returns results, with executeQuery being called with the right query', async () => {
    const subjects = await iterableToArray(person.subjects);
    expect(queryEngine.execute).toBeCalledWith(deindent(`
      SELECT DISTINCT ?subject WHERE {
        ?subject ?predicate ?object.
      }`));
    expect(subjects.map(s => `${s}`)).toEqual(['Alice', 'Bob', 'Carol']);
  });
});

describe('a query path with a path and mutation expression handler', () => {
  let person;
  beforeAll(() => {
    const pathProxy = new PathProxy({ handlers: handlersMutation, resolvers });
    person = pathProxy.createPath({ queryEngine }, { subject });
  });

  it('returns results for a path with 3 links', async () => {
    const names = await iterableToArray(person.friends.firstName);
    expect(names.map(n => `${n}`)).toEqual(['Alice', 'Bob', 'Carol']);
  });

  it('returns results for a path with 4 links and fixed values', async () => {
    const names = await iterableToArray(
      person.friends.friends(namedNode('http://ex.org/John')).firstName);
    expect(names.map(n => `${n}`)).toEqual(['Alice', 'Bob', 'Carol']);
  });

  it('returns true for an addition with 3 links', async () => {
    expect(await person.friends.firstName.add('Ruben')).toBeTruthy();
  });

  it('returns true for an set with 3 links', async () => {
    expect(await person.friends.firstName.set('Ruben')).toBeTruthy();
  });

  it('returns true for an replace with 3 links', async () => {
    expect(await person.friends.firstName.set('ruben', 'Ruben')).toBeTruthy();
  });
});


describe('a query path with a language part', () => {
  let tomato;
  beforeAll(() => {
    const pathProxy = new PathProxy({ handlers: handlersPath, resolvers });
    tomato = pathProxy.createPath({ queryEngine: multilingualQueryEngine }, { subject });
  });

  it('returns the specified language', async () => {
    const dutchLabel = await tomato.label['@nl'];
    expect(`${dutchLabel}`).toBe('Tomaat');
  });

  it('returns the specified language when using dollar sign', async () => {
    const dutchLabel = await tomato.label.$nl;
    expect(`${dutchLabel}`).toBe('Tomaat');
  });

  it('returns undefined when the language is not available', async () => {
    const frenchLabel = await tomato.label.$fr;
    expect(`${frenchLabel}`).toBe('undefined');
  });
});

describe('a query path with a language part and @language in the context', () => {
  let tomato;
  beforeAll(() => {
    const pathProxy = new PathProxy({ handlers: handlersPath, resolvers: [
      new LanguageResolver(),
      new JSONLDResolver(context),
    ] });
    tomato = pathProxy.createPath({
      queryEngine: multilingualQueryEngine,
      context: {
        '@language': 'nl',
      },
    }, { subject });
  });

  it('returns the default language if available', async () => {
    const dutchLabel = await tomato.label;
    expect(`${dutchLabel}`).toBe('Tomaat');
  });
});

describe('a query path with a language part and an unavailable @language in the context', () => {
  let tomato;
  beforeAll(() => {
    const pathProxy = new PathProxy({ handlers: handlersPath, resolvers: [
      new LanguageResolver(),
      new JSONLDResolver(context),
    ] });
    tomato = pathProxy.createPath({
      queryEngine: multilingualQueryEngine,
      context: {
        '@language': 'fr',
      },
    }, { subject });
  });

  it('returns the the first item if the default language is not available', async () => {
    const defaultLabel = await tomato.label;
    expect(`${defaultLabel}`).toBe('Tomato');
  });
});
