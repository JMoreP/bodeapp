const admin = require('firebase-admin');

// INSTRUCCIONES PARA EJECUTAR:
// 1. Ve a Firebase Console -> Project Settings -> Service Accounts
// 2. Haz clic en "Generate new private key", descárgala.
// 3. Renombra el archivo descargado a "serviceAccountKey.json" y ponlo en esta misma carpeta (bodeapp/)
// 4. Ejecuta: node migrate.js

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// TU UID DE SUPER ADMIN (El que proporcionaste)
const SUPER_ADMIN_UID = 'gDsYzOxufdV3KpoD3dwivVu5sM03';

async function migrateData() {
  console.log('Iniciando migración de datos al tenant del Super Admin...');

  const batch = db.batch();
  const tenantRef = db.collection('tenants').doc(SUPER_ADMIN_UID);
  
  // 1. Asegurarnos de que tu tenant existe
  batch.set(tenantRef, {
    email: 'admin@bodeapp.com', // Puedes cambiarlo si quieres
    status: 'active',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  // 2. Mover Configuración Global
  console.log('Migrando configuración global...');
  const configSnap = await db.collection('config').doc('global').get();
  if (configSnap.exists) {
    const configRef = tenantRef.collection('config').doc('global');
    batch.set(configRef, configSnap.data());
    // Borrar de raíz
    batch.delete(configSnap.ref);
  }

  // 3. Mover Productos
  console.log('Migrando productos...');
  const productsSnap = await db.collection('products').get();
  productsSnap.forEach(doc => {
    const newDocRef = tenantRef.collection('products').doc(doc.id);
    batch.set(newDocRef, doc.data());
    // Borrar de raíz
    batch.delete(doc.ref);
  });
  console.log(`- ${productsSnap.size} productos encolados.`);

  // 4. Mover Deudas
  console.log('Migrando deudas...');
  const debtsSnap = await db.collection('debts').get();
  debtsSnap.forEach(doc => {
    const newDocRef = tenantRef.collection('debts').doc(doc.id);
    batch.set(newDocRef, doc.data());
    // Borrar de raíz
    batch.delete(doc.ref);
  });
  console.log(`- ${debtsSnap.size} deudas encoladas.`);

  // 5. Crear usuario global (espejo)
  const globalUserRef = db.collection('global').doc('users').collection('list').doc(SUPER_ADMIN_UID);
  batch.set(globalUserRef, {
    email: 'admin@bodeapp.com',
    status: 'active',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  try {
    console.log('Ejecutando escrituras en la base de datos...');
    await batch.commit();
    console.log('¡Migración completada con éxito!');
  } catch (error) {
    console.error('Error durante la migración:', error);
  }
}

migrateData();
