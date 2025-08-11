const fs = require('fs');
const { initializeTestEnvironment, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const { doc, setDoc, getDoc } = require('firebase/firestore');

let testEnv;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-project',
    firestore: {
      rules: fs.readFileSync('firestore.rules', 'utf8'),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

test('allows access within same company', async () => {
  const db = testEnv.authenticatedContext('userA', { companyId: 'A' }).firestore();
  await assertSucceeds(setDoc(doc(db, 'items/itemA'), { companyId: 'A' }));
  await assertSucceeds(getDoc(doc(db, 'items/itemA')));
});

test('denies cross-tenant access', async () => {
  const dbA = testEnv.authenticatedContext('userA', { companyId: 'A' }).firestore();
  const dbB = testEnv.authenticatedContext('userB', { companyId: 'B' }).firestore();

  await assertSucceeds(setDoc(doc(dbB, 'items/itemB'), { companyId: 'B' }));
  await assertFails(setDoc(doc(dbA, 'items/itemB'), { companyId: 'B' }));
  await assertFails(getDoc(doc(dbA, 'items/itemB')));
});
