import React, { useState } from "react";

export default function TenantSignup() {
  const [slug, setSlug] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [projectName, setProjectName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmedPayment, setConfirmedPayment] = useState(false);

  const mpLink = import.meta.env.VITE_MERCADOPAGO_LINK || "#";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/createTenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: slug.trim(),
          companyId: companyId.trim(),
          projectName: projectName.trim(),
          email: email.trim(),
          password,
        }),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text);
      setMessage("Cuenta creada correctamente");
      setSlug("");
      setCompanyId("");
      setProjectName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <h2 className="text-2xl font-bold text-center">Crear Cuenta</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center space-x-2">
          <span>agendarturnos.ar/</span>
          <input
            className="border p-2 rounded flex-grow"
            value={slug}
            onChange={(e) => setSlug(e.target.value.replace(/\s+/g, ""))}
            placeholder="slug"
            required
          />
        </div>
        <input
          className="border p-2 rounded w-full"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          placeholder="companyId"
          required
        />
        <input
          className="border p-2 rounded w-full"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Nombre del Proyecto"
        />
        <input
          type="email"
          className="border p-2 rounded w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          className="border p-2 rounded w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          required
        />
        <a
          href={mpLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-[#009ee3] text-white py-2 rounded-full text-center"
        >
          Pagar con Mercado Pago
        </a>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={confirmedPayment}
            onChange={(e) => setConfirmedPayment(e.target.checked)}
          />
          <span>Declaro haber realizado el pago del servicio.</span>
        </label>
        <button
          type="submit"
          disabled={loading || !confirmedPayment}
          className="w-full bg-[#f1bc8a] text-white py-2 rounded-full disabled:opacity-50"
        >
          {loading ? "Procesando..." : "Dar de alta mi cuenta"}
        </button>
      </form>
      {message && <p className="text-center text-red-500">{message}</p>}
    </div>
  );
}
