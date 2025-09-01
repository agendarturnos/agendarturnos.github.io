import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { COUNTRY_CODES, AREA_CODES } from "../data/phone";

export default function TenantSignup() {
  const navigate = useNavigate();
  const { plan } = useParams();
  const [slug, setSlug] = useState("");
  const [projectName, setProjectName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneCode, setPhoneCode] = useState(COUNTRY_CODES[0].code);
  const [phoneArea, setPhoneArea] = useState(AREA_CODES[0].code);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [confirmedPayment, setConfirmedPayment] = useState(false);

  const plans = {
    estandar: {
      label: "estandar",
      link:
        import.meta.env.VITE_MP_ESTANDAR_LINK || "https://mpago.la/2m39qhv",
    },
    avanzado: {
      label: "avanzado",
      link:
        import.meta.env.VITE_MP_AVANZADO_LINK || "https://mpago.la/2pcxNWm",
    },
    ilimitado: {
      label: "ilimitado",
      link:
        import.meta.env.VITE_MP_ILIMITADO_LINK || "https://mpago.la/2RFmtV4",
    },
  };

  const selectedPlan = plans[plan];
  const mpLink =
    selectedPlan?.link ||
    import.meta.env.VITE_MERCADOPAGO_LINK ||
    "https://mpago.la/1NLEpxk";
  const slugRegex = /^[a-z0-9-]{3,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    if (!firstName || !lastName || !phone) {
      setMessage("Completa nombre, apellido y teléfono");
      setIsError(true);
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden");
      setIsError(true);
      setLoading(false);
      return;
    }
    const cleanSlug = slug.trim().toLowerCase();
    if (!slugRegex.test(cleanSlug)) {
      setMessage("Slug inválido");
      setIsError(true);
      setLoading(false);
      return;
    }

    try {
      // 1) Crear cuenta Auth
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;

      // 2) Guardar tenant
      await setDoc(
        doc(db, "tenants", cleanSlug),
        {
          companyId: cleanSlug,
          projectName: projectName.trim(),
          ownerUid: uid,
          ownerEmail: email.trim(),
          createdAt: new Date(),
        }
      );

      // 3) Registrar usuario admin con datos completos
      await setDoc(
        doc(db, "users", uid),
        {
          uid,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: `${phoneCode}${phoneArea}${phone.trim()}`,
          email: email.trim(),
          companyId: cleanSlug,
          isAdmin: true,
          createdAt: new Date(),
        }
      );

      setMessage("Registro exitoso");
      setIsError(false);

      localStorage.setItem('showTutorial', 'true');

      // Redirigir tras 5s
      const newSlug = cleanSlug;
      setTimeout(() => navigate(`/${newSlug}`), 3000);

      // Reset campos
      setSlug("");
      setProjectName("");
      setFirstName("");
      setLastName("");
      setPhoneCode(COUNTRY_CODES[0].code);
      setPhoneArea(AREA_CODES[0].code);
      setPhone("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setConfirmedPayment(false);
    } catch (err) {
      setMessage(
        err.code === 'auth/email-already-in-use'
          ? 'Correo ya en uso'
          : err.message
      );
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSlugChange = (e) => {
    const v = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "");
    setSlug(v);
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h1 className="text-center mb-3">
        Crear Cuenta{selectedPlan ? ` plan ${selectedPlan.label}` : ""}
      </h1>

      <form onSubmit={handleSubmit}>

        <div className="mb-2 input-group">
          <span className="input-group-text">agendarturnos.ar/</span>
          <input
            type="text"
            className="form-control"
            value={slug}
            onChange={handleSlugChange}
            placeholder="tumarca"
            required
          />
        </div>

        <div className="mb-2">
          <input
            type="text"
            className="form-control"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Nombre del proyecto"
          />
        </div>

        {/* Campos de registro de usuario */}
        <div className="mb-2">
          <input
            type="text"
            className="form-control"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Nombre"
            required
          />
        </div>
        <div className="mb-2">
          <input
            type="text"
            className="form-control"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Apellido"
            required
          />
        </div>
        <div className="d-flex mb-2">
          <select
            className="form-select me-1 w-75"
            value={phoneCode}
            onChange={(e) => setPhoneCode(e.target.value)}
            required
          >
            {COUNTRY_CODES.map(cc => (
              <option key={cc.code} value={cc.code}>
                {cc.label}  {cc.code}
              </option>
            ))}
          </select>
          <input
            type="text"
            className="form-control me-1"
            placeholder="Prefijo"
            value={phoneArea}
            onChange={(e) => setPhoneArea(e.target.value.replace(/\D/, ""))}
            required
          />
          <input
            type="text"
            className="form-control"
            placeholder="Celular"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/, ""))}
            required
          />
        </div>

        <div className="mb-2">
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
        </div>

        <div className="mb-2">
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            required
          />
        </div>

        <div className="mb-4">
          <input
            type="password"
            className="form-control"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repetir contraseña"
            required
          />
        </div>

        <div className="d-grid mb-2">
          <a
            href={mpLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-info"
          >
            Pagar con Mercado Pago
          </a>
        </div>

        <div className="form-check mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            id="confirmPayment"
            checked={confirmedPayment}
            onChange={(e) => setConfirmedPayment(e.target.checked)}
            required
          />
          <label className="form-check-label" htmlFor="confirmPayment">
            Declaro haber realizado el pago.
          </label>
        </div>

        <div className="d-grid">
          <button
            type="submit"
            className="btn btn-warning"
            disabled={loading || !confirmedPayment}
          >
            {loading && (
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
            )}
            {loading ? "Procesando..." : "Dar de alta mi cuenta"}
          </button>
        </div>
      </form>

      {message && (
        <p className={`text-center mt-3 ${isError ? "text-danger" : "text-success"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
