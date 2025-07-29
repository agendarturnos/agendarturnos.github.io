// functions/index.js

const functions = require('firebase-functions');
const admin     = require('firebase-admin');
const sgMail    = require('@sendgrid/mail');

admin.initializeApp();
const db = admin.firestore();

// Carga tu SendGrid API Key:
sgMail.setApiKey(functions.config().sendgrid.key);

exports.sendAppointmentReminders = functions
  .pubsub
  .schedule('every 60 minutes')
  .onRun(async () => {
    const now   = admin.firestore.Timestamp.now();
    const in24h = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 24 * 60 * 60 * 1000)
    );

    const snap = await db.collection('appointments')
      .where('datetime', '>=', now)
      .where('datetime', '<=', in24h)
      .where('reminderSent', '!=', true)
      .get();

    if (snap.empty) {
      console.log('No hay recordatorios pendientes');
      return null;
    }

    const batch    = db.batch();
    const messages = [];

    snap.forEach(docSnap => {
      const a = docSnap.data();
      if (!a.clientEmail) return;

      const dt = a.datetime.toDate();
      const fmt = dt.toLocaleString('es-AR', {
        weekday: 'long', day: 'numeric', month: 'long',
        hour: '2-digit', minute: '2-digit'
      });

      messages.push({
        to: a.clientEmail,
        from: 'no-reply@tusalon.com',
        subject: 'Recordatorio de tu turno',
        text: `Recordatorio: ${a.serviceName} con ${a.stylistName} el ${fmt}.`,
        html: `<p>Recordatorio: <strong>${a.serviceName}</strong> con <strong>${a.stylistName}</strong> el <strong>${fmt}</strong>.</p>`
      });

      batch.update(db.doc(`appointments/${docSnap.id}`), { reminderSent: true });
    });

    await sgMail.send(messages);
    await batch.commit();
    console.log(`Enviados ${messages.length} recordatorios.`);
    return null;
  });

exports.createTenant = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }
  try {
    const { slug, projectName, email, password } = req.body;
    if (!slug || !email || !password) {
      res.status(400).send('Missing fields');
      return;
    }
    const docRef = db.collection('tenants').doc(slug);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      res.status(400).send('Slug already exists');
      return;
    }
    // create tenant document
    await docRef.set({ companyId: slug, projectName: projectName || '' });
    // create auth user
    const userRecord = await admin.auth().createUser({ email, password });
    // create user profile
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      companyId: slug,
      isAdmin: true,
      firstName: '',
      lastName: '',
      phone: ''
    });
    res.status(200).send('ok');
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});
