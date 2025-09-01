// functions/index.js

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");
const { MercadoPagoConfig, Customer } = require("mercadopago");

admin.initializeApp();
const db = admin.firestore();

// Carga tu SendGrid API Key:
sgMail.setApiKey(functions.config().sendgrid.key);
const mpClient = new MercadoPagoConfig({
  accessToken: functions.config().mercadopago.token,
});
const mpCustomer = new Customer(mpClient);

exports.notifyAppointmentCreated = functions.firestore
  .document("appointments/{id}")
  .onCreate(async (snap) => {
    const a = snap.data();
    if (!a) return null;
    const dt = a.datetime.toDate();
    const fmt = dt.toLocaleString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
    const messages = [];
    if (a.clientEmail) {
      messages.push({
        to: a.clientEmail,
        from: "no-reply@tusalon.com",
        subject: "Confirmación de turno",
        text: `Has reservado ${a.serviceName} con ${a.stylistName} el ${fmt}.`,
        html: `<p>Has reservado <strong>${a.serviceName}</strong> con <strong>${a.stylistName}</strong> el <strong>${fmt}</strong>.</p>`,
      });
    }
    if (a.stylistEmail) {
      messages.push({
        to: a.stylistEmail,
        from: "no-reply@tusalon.com",
        subject: "Nuevo turno reservado",
        text: `${a.clientEmail} reservó ${a.serviceName} el ${fmt}.`,
        html: `<p><strong>${a.clientEmail}</strong> reservó <strong>${a.serviceName}</strong> el <strong>${fmt}</strong>.</p>`,
      });
    }
    if (messages.length > 0) {
      await sgMail.send(messages);
    }
    return null;
  });

exports.sendAppointmentReminders = functions.pubsub
  .schedule("every 60 minutes")
  .onRun(async () => {
    const now = admin.firestore.Timestamp.now();
    const in24h = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 24 * 60 * 60 * 1000),
    );

    const snap = await db
      .collection("appointments")
      .where("datetime", ">=", now)
      .where("datetime", "<=", in24h)
      .where("reminderSent", "!=", true)
      .get();

    if (snap.empty) {
      console.log("No hay recordatorios pendientes");
      return null;
    }

    const batch = db.batch();
    const messages = [];

    snap.forEach((docSnap) => {
      const a = docSnap.data();
      if (!a.clientEmail) return;

      const dt = a.datetime.toDate();
      const fmt = dt.toLocaleString("es-AR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      });

      messages.push({
        to: a.clientEmail,
        from: "no-reply@tusalon.com",
        subject: "Recordatorio de tu turno",
        text: `Recordatorio: ${a.serviceName} con ${a.stylistName} el ${fmt}.`,
        html: `<p>Recordatorio: <strong>${a.serviceName}</strong> con <strong>${a.stylistName}</strong> el <strong>${fmt}</strong>.</p>`,
      });

      batch.update(db.doc(`appointments/${docSnap.id}`), {
        reminderSent: true,
      });
    });

    await sgMail.send(messages);
    await batch.commit();
    console.log(`Enviados ${messages.length} recordatorios.`);
    return null;
  });

exports.createTenant = functions.https.onRequest(async (req, res) => {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    res.status(401).send("Unauthorized");
    return;
  }
  try {
    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    if (
      decoded.email !== "admin@agendarturnos.ar" &&
      decoded.role !== "admin"
    ) {
      res.status(403).send("Forbidden");
      return;
    }
  } catch (err) {
    res.status(401).send("Unauthorized");
    return;
  }
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }
  try {
    const { slug: rawSlug, companyId: rawCompanyId, projectName, email, password } = req.body;
    const slug = (rawSlug || "").trim().toLowerCase();
    const companyId = (rawCompanyId || "").trim().toLowerCase();
    const slugRegex = /^[a-z0-9-]{3,}$/;
    if (
      !slug ||
      !companyId ||
      !email ||
      !password ||
      !slugRegex.test(slug) ||
      !slugRegex.test(companyId)
    ) {
      res.status(400).send("Invalid or missing fields");
      return;
    }
    const docRef = db.collection("tenants").doc(slug);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      res.status(400).send("Slug already exists");
      return;
    }
    // create tenant document
    await docRef.set({
      companyId,
      projectName: projectName || "",
    });
    // create auth user
    const userRecord = await admin.auth().createUser({ email, password });
    // create user profile
    await db.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      companyId,
      isAdmin: true,
      isProfesional: false,
      firstName: "",
      lastName: "",
      phone: "",
    });
    try {
      const mpResp = await mpCustomer.create({
        body: { email, first_name: projectName || "" },
      });
      const mpId = mpResp.id || (mpResp.response && mpResp.response.id);
      if (mpId) {
        await docRef.update({ mercadopagoCustomerId: mpId });
      }
    } catch (mpErr) {
      console.error("MercadoPago:", mpErr);
    }
    res.status(200).send("ok");
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

exports.markUserAsProfessional = functions.firestore
  .document("users/{uid}")
  .onCreate(async (snap) => {
    const data = snap.data();
    if (!data.email) return null;
    const profSnap = await db
      .collection("stylists")
      .where("email", "==", data.email)
      .limit(1)
      .get();
    if (!profSnap.empty) {
      const profData = profSnap.docs[0].data();
      await snap.ref.update({
        isProfesional: true,
        companyId: profData.companyId,
      });
    }
    return null;
  });

exports.syncProfessionalEmail = functions.firestore
  .document("stylists/{id}")
  .onWrite(async (change) => {
    const after = change.after.exists ? change.after.data() : null;
    if (!after || !after.email) return null;
    const userSnap = await db
      .collection("users")
      .where("email", "==", after.email)
      .get();
    if (userSnap.empty) return null;
    const batch = db.batch();
    userSnap.forEach((u) => {
      if (
        !u.data().isProfesional ||
        u.data().companyId !== after.companyId
      ) {
        batch.update(u.ref, {
          isProfesional: true,
          companyId: after.companyId,
        });
      }
    });
    await batch.commit();
    return null;
  });
