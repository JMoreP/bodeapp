"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleUserStatus = exports.onUserCreated = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();
const SUPER_ADMIN_UID = 'gDsYzOxufdV3KpoD3dwivVu5sM03';
// 1. Trigger when a new user registers
exports.onUserCreated = functions.auth.user().onCreate(async (user) => {
    const uid = user.uid;
    const email = user.email || '';
    // Super Admin bypasses creation of a new regular tenant (they are already set up)
    // But we can create it anyway for uniformity
    const tenantData = {
        email,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'active'
    };
    const batch = db.batch();
    // Create tenant doc
    const tenantRef = db.collection('tenants').doc(uid);
    batch.set(tenantRef, tenantData);
    // Create global user doc for admin listing
    const globalUserRef = db.collection('global').doc('users').collection('list').doc(uid);
    batch.set(globalUserRef, tenantData);
    // Default config for the new tenant
    const configRef = db.collection('tenants').doc(uid).collection('config').doc('global');
    batch.set(configRef, { exchangeRate: 36.50 }); // Placeholder default rate
    try {
        await batch.commit();
        console.log(`Successfully initialized tenant for user: ${uid}`);
    }
    catch (error) {
        console.error(`Error initializing tenant for user ${uid}:`, error);
    }
});
// 2. Callable function to suspend or activate a user (Super Admin only)
exports.toggleUserStatus = functions.https.onCall(async (data, context) => {
    // Check if caller is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    // Check if caller is Super Admin
    if (context.auth.uid !== SUPER_ADMIN_UID) {
        throw new functions.https.HttpsError('permission-denied', 'Only Super Admin can toggle user status.');
    }
    const { targetUid, newStatus } = data;
    if (!targetUid || !newStatus || !['active', 'suspended'].includes(newStatus)) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid parameters provided.');
    }
    if (targetUid === SUPER_ADMIN_UID) {
        throw new functions.https.HttpsError('invalid-argument', 'Cannot suspend the Super Admin.');
    }
    const batch = db.batch();
    const tenantRef = db.collection('tenants').doc(targetUid);
    batch.update(tenantRef, { status: newStatus });
    const globalUserRef = db.collection('global').doc('users').collection('list').doc(targetUid);
    batch.update(globalUserRef, { status: newStatus });
    try {
        await batch.commit();
        return { success: true, message: `User ${targetUid} status updated to ${newStatus}` };
    }
    catch (error) {
        console.error(`Error updating status for ${targetUid}:`, error);
        throw new functions.https.HttpsError('internal', 'Internal error occurred while updating status.');
    }
});
//# sourceMappingURL=index.js.map