import ComunicaEngine from '@ldflex/comunica';
import { namedNode } from '@rdfjs/data-model';
import { Store, Parser } from 'n3';
import PathFactory from '../../src/PathFactory';

const Jesse = namedNode('http://example.org/Jesse');

const context = {
  '@context': {
    ex: 'http://example.org/',
  },
};

describe('Testing .list', () => {
  const parser = new Parser();
  const store = new Store(
    parser.parse(`
      @prefix ex: <http://example.org/> .
      @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .

      ex:Jesse ex:myList ( 1 2 3 4 5 ) ;
               ex:mySeq [ a rdf:Seq ;
                rdf:_1 0 ;
                rdf:_2 1 ;
                rdf:_3 2 ;
                rdf:_4 3 ;
                ] ;
               ex:myBag [ a rdf:Bag ;
                rdf:_1 0 ;
                rdf:_2 1 ;
                rdf:_3 2 ;
                rdf:_4 3 ;
                ] ;
               ex:myAlt [ a rdf:Alt ;
                rdf:_1 0 ;
                rdf:_2 1 ;
                rdf:_3 2 ;
                rdf:_4 3 ;
                ] .
    `)
  );
  const queryEngine = new ComunicaEngine(store);

  const factory = new PathFactory({ context, queryEngine });
  const person = factory.create({ subject: Jesse });
  it('.list Should return a list in the correct order (with subject resolved)', async () => {
    expect(await (await person['ex:myList']).list).toBeInstanceOf(Array);
    expect(await (await person['ex:myList']).list).toHaveLength(5);
    expect((await (await person['ex:myList']).list).map(x => x.toPrimitive())).toEqual([1, 2, 3, 4, 5]);
  });

  it('.list Should return a list in the correct order (with subject unresolved)', async () => {
    expect(await person['ex:myList'].list).toBeInstanceOf(Array);
    expect(await person['ex:myList'].list).toHaveLength(5);
    expect((await person['ex:myList'].list).map(x => x.toPrimitive())).toEqual([1, 2, 3, 4, 5]);
  });

  it('.container Should return a list in the correct order (with subject resolved)', async () => {
    expect(await (await person['ex:mySeq']).container).toBeInstanceOf(Array);
    expect(await (await person['ex:mySeq']).container).toHaveLength(4);
    expect((await (await person['ex:mySeq']).container).map(x => x.toPrimitive())).toEqual([0, 1, 2, 3]);
  });

  it('.container Should return a list in the correct order (with subject unresolved)', async () => {
    expect(await person['ex:mySeq'].container).toBeInstanceOf(Array);
    expect(await person['ex:mySeq'].container).toHaveLength(4);
    expect((await person['ex:mySeq'].container).map(x => x.toPrimitive())).toEqual([0, 1, 2, 3]);
  });

  it('.containerAsSet Should return a list in the correct order (with subject resolved)', async () => {
    const r = await (await person['ex:mySeq']).containerAsSet;
    expect(r).toBeInstanceOf(Set);
    expect(r.size).toEqual(4);
    const arr = [];
    r.forEach(x => {
      arr.push(x.toPrimitive());
    });
    expect(arr.sort()).toEqual([0, 1, 2, 3]);
  });

  it('.containerAsSet Should return a list in the correct order (with subject unresolved)', async () => {
    const r = await person['ex:mySeq'].containerAsSet;
    expect(r).toBeInstanceOf(Set);
    expect(r.size).toEqual(4);
    const arr = [];
    r.forEach(x => {
      arr.push(x.toPrimitive());
    });
    expect(arr.sort()).toEqual([0, 1, 2, 3]);
  });

  it('.collection Should return a list in the correct order (with subject resolved)', async () => {
    expect(await (await person['ex:mySeq']).collection).toBeInstanceOf(Array);
    expect(await (await person['ex:mySeq']).collection).toHaveLength(4);
    expect((await (await person['ex:mySeq']).collection).map(x => x.toPrimitive())).toEqual([0, 1, 2, 3]);
  });

  it('.collection Should return a list in the correct order (with subject unresolved)', async () => {
    expect(await person['ex:mySeq'].collection).toBeInstanceOf(Array);
    expect(await person['ex:mySeq'].collection).toHaveLength(4);
    expect((await person['ex:mySeq'].collection).map(x => x.toPrimitive())).toEqual([0, 1, 2, 3]);
  });

  it('.collection Should return a list in the correct order (with subject resolved) (rdf:Alt)', async () => {
    expect(await (await person['ex:myAlt']).collection).toBeInstanceOf(Array);
    expect(await (await person['ex:myAlt']).collection).toHaveLength(4);
    expect((await (await person['ex:myAlt']).collection).map(x => x.toPrimitive())).toEqual([0, 1, 2, 3]);
  });

  it('.collection Should return a list in the correct order (with subject unresolved) (rdf:Alt)', async () => {
    expect(await person['ex:myAlt'].collection).toBeInstanceOf(Array);
    expect(await person['ex:myAlt'].collection).toHaveLength(4);
    expect((await person['ex:myAlt'].collection).map(x => x.toPrimitive())).toEqual([0, 1, 2, 3]);
  });

  it('.collection Should return a set in the correct order (with subject resolved)', async () => {
    const r = await (await person['ex:myBag']).collection;
    expect(r).toBeInstanceOf(Set);
    expect(r.size).toEqual(4);
    const arr = [];
    r.forEach(x => {
      arr.push(x.toPrimitive());
    });
    expect(arr.sort()).toEqual([0, 1, 2, 3]);
  });

  it('.collection Should return a set in the correct order (with subject unresolved)', async () => {
    const r = await person['ex:myBag'].collection;
    expect(r).toBeInstanceOf(Set);
    expect(r.size).toEqual(4);
    const arr = [];
    r.forEach(x => {
      arr.push(x.toPrimitive());
    });
    expect(arr.sort()).toEqual([0, 1, 2, 3]);
  });
});
