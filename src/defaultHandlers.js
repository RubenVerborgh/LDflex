import AsyncIteratorHandler from './AsyncIteratorHandler';
import DataHandler from './DataHandler';
import DeleteFunctionHandler from './DeleteFunctionHandler';
import ExecuteQueryHandler from './ExecuteQueryHandler';
import GetHandler from './GetFunctionHandler';
import InsertFunctionHandler from './InsertFunctionHandler';
import MutationExpressionsHandler from './MutationExpressionsHandler';
import PathExpressionHandler from './PathExpressionHandler';
import PredicateHandler from './PredicateHandler';
import PredicatesHandler from './PredicatesHandler';
import PreloadHandler from './PreloadHandler';
import PropertiesHandler from './PropertiesHandler';
import ReplaceFunctionHandler from './ReplaceFunctionHandler';
import SetFunctionHandler from './SetFunctionHandler';
import SortHandler from './SortHandler';
import SparqlHandler from './SparqlHandler';
import StringToLDflexHandler from './StringToLDflexHandler';
import SubjectHandler from './SubjectHandler';
import SubjectsHandler from './SubjectsHandler';
import ThenHandler from './ThenHandler';
import ToArrayHandler from './ToArrayHandler';
import { termToPrimitive } from './valueUtils';

/**
 * A map with default property handlers.
 */
export default {
  // Flag to loaders that exported paths are not ES6 modules
  __esModule: () => undefined,

  // Add thenable and async iterable behavior
  then: new ThenHandler(),
  [Symbol.asyncIterator]: new AsyncIteratorHandler(),

  // Add read and query functionality
  get: new GetHandler(),
  subject: new SubjectHandler(),
  predicate: new PredicateHandler(),
  properties: new PropertiesHandler(),
  predicates: new PredicatesHandler(),
  pathExpression: new PathExpressionHandler(),
  sparql: new SparqlHandler(),
  subjects: new SubjectsHandler(),
  results: new ExecuteQueryHandler(),
  sort: new SortHandler('ASC'),
  sortDesc: new SortHandler('DESC'),
  preload: new PreloadHandler(),

  // Add write functionality
  mutationExpressions: new MutationExpressionsHandler(),
  add: new InsertFunctionHandler(),
  set: new SetFunctionHandler(),
  replace: new ReplaceFunctionHandler(),
  delete: new DeleteFunctionHandler(),

  // Add RDFJS term handling
  termType:    termPropertyHandler('termType'),
  value:       termPropertyHandler('value'),
  datatype:    termPropertyHandler('datatype'),
  language:    termPropertyHandler('language'),
  canonical:   termPropertyHandler('canonical'),
  equals:      DataHandler.sync('subject', 'equals'),
  toString:    DataHandler.syncFunction('subject', 'value'),
  valueOf:     subjectToPrimitiveHandler(),
  toPrimitive: subjectToPrimitiveHandler(),

  // Add iteration helpers
  toArray: new ToArrayHandler(),
  termTypes: handler((_, path) => path.toArray(term => term.termType)),
  values:    handler((_, path) => path.toArray(term => term.value)),
  datatypes: handler((_, path) => path.toArray(term => term.datatype)),
  languages: handler((_, path) => path.toArray(term => term.language)),

  // Parse a string into an LDflex object
  resolve: new StringToLDflexHandler(),
};

// Creates a handler from the given function
function handler(handle) {
  return { handle };
}

// Creates a handler for the given RDF/JS Term property
export function termPropertyHandler(property) {
  // If a resolved subject is present,
  // behave as an RDF/JS term and synchronously expose the property;
  // otherwise, return a promise to the property value
  return handler(({ subject }, path) =>
    subject && (property in subject) ? subject[property] :
      path.then && path.then(term => term?.[property]));
}

// Creates a handler that converts the subject into a primitive
function subjectToPrimitiveHandler() {
  return handler(({ subject }) => () =>
    typeof subject?.termType !== 'string' ?
      undefined : termToPrimitive(subject));
}
