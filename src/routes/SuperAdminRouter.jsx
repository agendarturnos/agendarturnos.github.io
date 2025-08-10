import React, { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../AuthProvider';
import { Navigate } from 'react-router-dom';

export default function SuperAdminRouter() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState('tenants');
  const [tenants, setTenants] = useState([]);
  const [users, setUsers] = useState([]);
  const [newTenant, setNewTenant] = useState({ slug: '', companyId: '', projectName: '' });
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [payments, setPayments] = useState([]);
  const [newPayment, setNewPayment] = useState({ companyId: '', amount: '', paidAt: '', transferCode: '' });
  const [paymentSearch, setPaymentSearch] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'tenants'), snap =>
      setTenants(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), snap =>
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'payments'), snap =>
      setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return unsub;
  }, []);

  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  if (user.email !== 'admin@agendarturnos.ar') return <Navigate to="/" replace />;

  const addTenant = async () => {
    if (!newTenant.slug) return;
    await setDoc(doc(db, 'tenants', newTenant.slug.trim()), {
      companyId: newTenant.companyId.trim(),
      projectName: newTenant.projectName.trim()
    });
    setNewTenant({ slug: '', companyId: '', projectName: '' });
  };

  const updateTenant = async (id, data) => {
    await updateDoc(doc(db, 'tenants', id), data);
  };

  const deleteTenant = async id => {
    if (window.confirm('¿Eliminar tenant?')) {
      await deleteDoc(doc(db, 'tenants', id));
    }
  };

  const startEditUser = uid => {
    const u = users.find(x => x.id === uid);
    setEditUser({ ...u });
  };

  const saveUser = async () => {
    const { firstName, lastName, phone, companyId, isAdmin, isProfesional } = editUser;
    await updateDoc(doc(db, 'users', editUser.id), {
      firstName: firstName || '',
      lastName: lastName || '',
      phone: phone || '',
      companyId: companyId || '',
      isAdmin: !!isAdmin,
      isProfesional: !!isProfesional
    });
    setEditUser(null);
  };

  const addPayment = async () => {
    if (!newPayment.companyId || !newPayment.amount || !newPayment.paidAt) return;
    await addDoc(collection(db, 'payments'), {
      companyId: newPayment.companyId.trim(),
      amount: parseFloat(newPayment.amount),
      paidAt: new Date(newPayment.paidAt),
      transferCode: newPayment.transferCode.trim()
    });
    setNewPayment({ companyId: '', amount: '', paidAt: '', transferCode: '' });
  };

  const deletePayment = async id => {
    if (window.confirm('¿Eliminar pago?')) {
      await deleteDoc(doc(db, 'payments', id));
    }
  };

  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPayments = payments.filter(p =>
    p.companyId?.toLowerCase().includes(paymentSearch.toLowerCase())
  );

  return (
    <div className="p-4 space-y-4">
      <div className="flex space-x-2">
        <button
          onClick={() => setTab('tenants')}
          className={`px-4 py-2 rounded ${tab === 'tenants' ? 'bg-[#f1bc8a] text-white' : 'bg-gray-200'}`}
        >
          Tenants
        </button>
        <button
          onClick={() => setTab('users')}
          className={`px-4 py-2 rounded ${tab === 'users' ? 'bg-[#f1bc8a] text-white' : 'bg-gray-200'}`}
        >
          Permisos
        </button>
        <button
          onClick={() => setTab('payments')}
          className={`px-4 py-2 rounded ${tab === 'payments' ? 'bg-[#f1bc8a] text-white' : 'bg-gray-200'}`}
        >
          Pagos
        </button>
      </div>

      {tab === 'tenants' && (
        <div className="space-y-4">
          <div className="flex space-x-2">
            <input
              className="border p-2 rounded"
              placeholder="slug"
              value={newTenant.slug}
              onChange={e => setNewTenant({ ...newTenant, slug: e.target.value })}
            />
            <input
              className="border p-2 rounded"
              placeholder="companyId"
              value={newTenant.companyId}
              onChange={e => setNewTenant({ ...newTenant, companyId: e.target.value })}
            />
            <input
              className="border p-2 rounded"
              placeholder="projectName"
              value={newTenant.projectName}
              onChange={e => setNewTenant({ ...newTenant, projectName: e.target.value })}
            />
            <button onClick={addTenant} className="px-3 py-2 bg-blue-500 text-white rounded">Agregar</button>
          </div>
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-1">Slug</th>
                <th className="border p-1">companyId</th>
                <th className="border p-1">projectName</th>
                <th className="border p-1">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map(t => (
                <TenantRow
                  key={t.id}
                  data={t}
                  onSave={updateTenant}
                  onDelete={deleteTenant}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'users' && (
        <div className="space-y-4">
          <input
            className="border p-2 rounded w-full"
            placeholder="Buscar usuario"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <ul className="space-y-2">
            {filteredUsers.map(u => (
              <li key={u.id} className="flex justify-between border p-2 rounded">
                <span>{u.email}</span>
                <button
                  onClick={() => startEditUser(u.id)}
                  className="px-2 py-1 bg-blue-500 text-white rounded"
                >
                  Editar
                </button>
              </li>
            ))}
          </ul>
          {editUser && (
            <div className="space-y-2 border-t pt-2">
              <h3 className="font-bold">Editar {editUser.email}</h3>
              <input
                className="border p-2 rounded w-full"
                placeholder="Nombre"
                value={editUser.firstName || ''}
                onChange={e => setEditUser({ ...editUser, firstName: e.target.value })}
              />
              <input
                className="border p-2 rounded w-full"
                placeholder="Apellido"
                value={editUser.lastName || ''}
                onChange={e => setEditUser({ ...editUser, lastName: e.target.value })}
              />
              <input
                className="border p-2 rounded w-full"
                placeholder="Teléfono"
                value={editUser.phone || ''}
                onChange={e => setEditUser({ ...editUser, phone: e.target.value })}
              />
              <input
                className="border p-2 rounded w-full"
                placeholder="companyId"
                value={editUser.companyId || ''}
                onChange={e => setEditUser({ ...editUser, companyId: e.target.value })}
              />
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={editUser.isAdmin || false}
                  onChange={e => setEditUser({ ...editUser, isAdmin: e.target.checked })}
                />
                <span>Es admin</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={editUser.isProfesional || false}
                  onChange={e =>
                    setEditUser({ ...editUser, isProfesional: e.target.checked })
                  }
                />
                <span>Es profesional</span>
              </label>
              <div className="space-x-2">
                <button onClick={saveUser} className="px-3 py-1 bg-blue-500 text-white rounded">Guardar</button>
                <button onClick={() => setEditUser(null)} className="px-3 py-1 bg-gray-300 rounded">Cancelar</button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'payments' && (
        <div className="space-y-4">
          <input
            className="border p-2 rounded w-full"
            placeholder="Buscar companyId"
            value={paymentSearch}
            onChange={e => setPaymentSearch(e.target.value)}
          />
          <div className="flex space-x-2">
            <input
              className="border p-2 rounded"
              placeholder="companyId"
              value={newPayment.companyId}
              onChange={e => setNewPayment({ ...newPayment, companyId: e.target.value })}
            />
            <input
              type="number"
              className="border p-2 rounded"
              placeholder="Monto"
              value={newPayment.amount}
              onChange={e => setNewPayment({ ...newPayment, amount: e.target.value })}
            />
            <input
              className="border p-2 rounded"
              placeholder="Código de transferencia"
              value={newPayment.transferCode}
              onChange={e => setNewPayment({ ...newPayment, transferCode: e.target.value })}
            />
            <input
              type="date"
              className="border p-2 rounded"
              value={newPayment.paidAt}
              onChange={e => setNewPayment({ ...newPayment, paidAt: e.target.value })}
            />
            <button onClick={addPayment} className="px-3 py-2 bg-blue-500 text-white rounded">Agregar</button>
          </div>
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-1">companyId</th>
                <th className="border p-1">Monto</th>
                <th className="border p-1">Código</th>
                <th className="border p-1">Fecha</th>
                <th className="border p-1">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map(p => (
                <tr key={p.id}>
                  <td className="border p-1">{p.companyId}</td>
                  <td className="border p-1">{p.amount}</td>
                  <td className="border p-1">{p.transferCode}</td>
                  <td className="border p-1">{p.paidAt ? new Date(p.paidAt.seconds ? p.paidAt.seconds * 1000 : p.paidAt).toLocaleDateString() : ''}</td>
                  <td className="border p-1">
                    <button onClick={() => deletePayment(p.id)} className="px-2 py-1 bg-red-500 text-white rounded">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TenantRow({ data, onSave, onDelete }) {
  const [companyId, setCompanyId] = useState(data.companyId || '');
  const [projectName, setProjectName] = useState(data.projectName || '');
  return (
    <tr>
      <td className="border p-1">{data.id}</td>
      <td className="border p-1">
        <input
          className="border p-1 rounded w-full"
          value={companyId}
          onChange={e => setCompanyId(e.target.value)}
        />
      </td>
      <td className="border p-1">
        <input
          className="border p-1 rounded w-full"
          value={projectName}
          onChange={e => setProjectName(e.target.value)}
        />
      </td>
      <td className="border p-1 space-x-2">
        <button
          onClick={() => onSave(data.id, { companyId, projectName })}
          className="px-2 py-1 bg-blue-500 text-white rounded"
        >
          Guardar
        </button>
        <button
          onClick={() => onDelete(data.id)}
          className="px-2 py-1 bg-red-500 text-white rounded"
        >
          Eliminar
        </button>
      </td>
    </tr>
  );
}
