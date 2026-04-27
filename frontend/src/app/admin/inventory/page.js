"use client";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/utils/api";
import { Search, Plus, Minus, Crown, Sparkles, Zap, Save, Package, ArrowLeft, Settings, Flame, RotateCcw } from "lucide-react";

const ITEM_TYPES = [
  { value: "flash", label: "Destellos Flash", icon: Zap, color: "text-yellow-500", bgColor: "bg-yellow-500/10", borderColor: "border-yellow-500/30" },
  { value: "clasico", label: "Destellos Clásicos", icon: Sparkles, color: "text-blue-500", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/30" },
  { value: "estelar", label: "Destellos Estelares", icon: Sparkles, color: "text-purple-500", bgColor: "bg-purple-500/10", borderColor: "border-purple-500/30" },
  { value: "rompehielos", label: "Rompehielos", icon: Flame, color: "text-green-500", bgColor: "bg-green-500/10", borderColor: "border-green-500/30" },
];

export default function AdminInventoryPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    itemType: "flash",
    count: 1,
    isPrime: false,
    days: 30,
  });
  const [inventoryChanges, setInventoryChanges] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  const limit = 20;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get(`/admin/inventory?page=${page}&limit=${limit}&search=${search}`);
      const newUsers = data.users || [];
      setUsers(newUsers);
      setTotal(data.total || 0);
      
      if (selectedUserId) {
        const updatedUser = newUsers.find(u => u.id === selectedUserId);
        if (updatedUser) {
          setSelectedUser(updatedUser);
        }
      }
      
      return newUsers;
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedUserId]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const openModal = (user, type) => {
    setSelectedUserId(user.id);
    setSelectedUser(user);
    setModalType(type);
    setFormData({
      itemType: "flash",
      count: 1,
      isPrime: user.is_prime,
      days: 30,
    });
    setShowModal(true);
  };

  const totalPages = Math.ceil(total / limit);

  // Desvinculación total: Cada item consulta su propio contador exacto
  const getCountForType = (user, itemType) => {
    if (!user) return 0;
    const key = `${user.id}_${itemType}`;
    const localChange = inventoryChanges[key] || 0;
    const baseCount = user[`${itemType}_count`] || 0;
    
    return baseCount + localChange;
  };

  const handleLocalChange = (userId, itemType, delta) => {
    const key = `${userId}_${itemType}`;
    setInventoryChanges(prev => {
      const newChanges = { ...prev, [key]: (prev[key] || 0) + delta };
      setHasChanges(Object.values(newChanges).some(v => v !== 0));
      return newChanges;
    });
  };

  // Función para restablecer exactamente a 0 un item
  const handleSetZero = (userId, itemType) => {
    const baseCount = selectedUser[`${itemType}_count`] || 0;
    const key = `${userId}_${itemType}`;
    setInventoryChanges(prev => {
      // El delta exacto para llegar a 0 es el negativo del monto base
      const newChanges = { ...prev, [key]: -baseCount };
      setHasChanges(Object.values(newChanges).some(v => v !== 0));
      return newChanges;
    });
  };

  const handleSaveChanges = async () => {
    if (!selectedUserId || !hasChanges) return;
    setProcessing(true);
    try {
      for (const [key, delta] of Object.entries(inventoryChanges)) {
        if (delta === 0) continue;
        const [userIdStr, itemType] = key.split('_');
        const userId = parseInt(userIdStr);
        if (delta > 0) {
          await api.post('/admin/inventory/add', {
            user_id: userId,
            item_type: itemType,
            count: Math.abs(delta),
          });
        } else {
          await api.post('/admin/inventory/remove', {
            user_id: userId,
            item_type: itemType,
            count: Math.abs(delta),
          });
        }
      }
      setInventoryChanges({});
      setHasChanges(false);
      const data = await api.get(`/admin/inventory?page=${page}&limit=${limit}&search=${search}`);
      const newUsers = data.users || [];
      setUsers(newUsers);
      const updatedUser = newUsers.find(u => u.id === selectedUserId);
      if (updatedUser) {
        setSelectedUser(updatedUser);
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Error al guardar cambios');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-subtle pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Gestión de Inventario</h1>
          <p className="text-sm text-muted mt-1">Administra destellos, rompehielos y VIP de los usuarios de forma independiente</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Buscar por nombre, usuario o ID..."
            value={search}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 bg-card border border-subtle text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent-primary transition-none"
          />
        </div>
      </div>

      <div className="bg-card border border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-card-hover text-muted font-bold border-b border-subtle text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-4">ID</th>
                <th className="text-left px-5 py-4">Usuario</th>
                <th className="text-center px-5 py-4">VIP</th>
                <th className="text-center px-5 py-4">Rompehielos</th>
                <th className="text-center px-5 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-10 font-medium text-muted">
                    Cargando...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-10 font-medium text-muted">
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-card-hover transition-none">
                    <td className="px-5 py-4 text-primary font-bold">#{user.id}</td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-bold text-primary">{user.name}</p>
                        <p className="text-muted text-xs font-medium">@{user.username}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {user.is_prime ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-xs font-bold uppercase">
                          <Crown size={12} /> VIP
                        </span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-500/10 text-green-500 border border-green-500/20 text-xs font-bold">
                        <Flame size={12} />
                        {getCountForType(user, "rompehielos")}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal(user, "manage")}
                          className="px-4 py-2 bg-accent-primary/10 text-accent-primary border border-transparent hover:border-accent-primary/30 text-xs font-bold uppercase tracking-wide transition-none flex items-center gap-1.5"
                          disabled={processing}
                        >
                          <Package size={14} />
                          Gestionar
                        </button>
                        <button
                          onClick={() => openModal(user, "vip")}
                          className="p-2 bg-yellow-500/10 text-yellow-500 border border-transparent hover:border-yellow-500/30 transition-none"
                          title="Gestionar VIP"
                        >
                          <Crown size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-subtle">
            <p className="text-xs text-muted">
              Mostrando {users.length} de {total} usuarios
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-xs font-bold uppercase bg-card-hover border border-subtle disabled:opacity-50 hover:bg-subtle transition-none"
              >
                Anterior
              </button>
              <span className="text-sm font-bold text-muted px-2">
                {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-xs font-bold uppercase bg-card-hover border border-subtle disabled:opacity-50 hover:bg-subtle transition-none"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

        {showModal && selectedUser && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => { setShowModal(false); setSelectedUserId(null); setSelectedUser(null); }}
          >
            <div
              className="bg-card border border-subtle p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              {modalType === "manage" ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-primary">Inventario de {selectedUser.name}</h2>
                      <p className="text-sm font-medium text-muted mt-1">@{selectedUser.username}</p>
                    </div>
                    <button
                      onClick={() => { setShowModal(false); setSelectedUserId(null); setSelectedUser(null); }}
                      className="p-2 bg-card-hover border border-subtle hover:bg-subtle transition-none"
                    >
                      <ArrowLeft size={20} />
                    </button>
                  </div>

                   <div className="grid grid-cols-2 gap-4 mb-6">
                     {ITEM_TYPES.map((item) => {
                       const count = getCountForType(selectedUser, item.value);
                       const hasLocalChange = inventoryChanges[`${selectedUser.id}_${item.value}`];
                       
                       return (
                         <div
                           key={item.value}
                           className={`p-4 rounded-xl border ${item.borderColor} ${item.bgColor} relative overflow-hidden`}
                         >
                           {hasLocalChange !== undefined && hasLocalChange !== 0 && (
                             <span className="absolute top-2 right-2 text-xs bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded">
                               {hasLocalChange > 0 ? '+' : ''}{hasLocalChange}
                             </span>
                           )}
                           <div className="flex items-start justify-between mb-3">
                             <item.icon size={24} className={item.color} />
                             <div className="flex items-center gap-1">
                               <button
                                 onClick={() => handleLocalChange(selectedUser.id, item.value, 1)}
                                 className="p-1 bg-green-500/20 text-green-500 rounded hover:bg-green-500/30 transition-colors"
                                 title="Agregar 1"
                               >
                                 <Plus size={12} />
                               </button>
                               <button
                                 onClick={() => handleLocalChange(selectedUser.id, item.value, -1)}
                                 disabled={count <= 0}
                                 className="p-1 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30 transition-colors disabled:opacity-50"
                                 title="Remover 1"
                               >
                                 <Minus size={12} />
                               </button>
                               <button
                                 onClick={() => {
                                   setModalType("add");
                                   setFormData({ ...formData, itemType: item.value });
                                 }}
                                 className="p-1 bg-blue-500/20 text-blue-500 rounded hover:bg-blue-500/30 transition-colors"
                                 title="Cantidad personalizada"
                               >
                                 <Settings size={12} />
                               </button>
                               {/* BOTON DE RESETEAR A 0 */}
                               <button
                                 onClick={() => handleSetZero(selectedUser.id, item.value)}
                                 className="p-1 ml-1 bg-gray-500/20 text-gray-400 rounded hover:bg-gray-500/40 hover:text-white transition-colors"
                                 title="Restablecer a 0"
                               >
                                 <RotateCcw size={12} />
                               </button>
                             </div>
                           </div>
                           <p className="text-2xl font-bold text-primary">{count}</p>
                           <p className="text-xs text-muted mt-1">{item.label}</p>
                         </div>
                       );
                     })}
                   </div>

                   {hasChanges && (
                     <div className="mb-6 p-5 bg-yellow-500/10 border border-yellow-500/30">
                       <div className="flex items-center justify-between">
                         <p className="text-sm font-bold text-yellow-500">Tienes cambios sin guardar</p>
                         <button
                           onClick={handleSaveChanges}
                           disabled={processing}
                           className="px-5 py-2.5 bg-accent-primary text-white text-sm font-bold hover:bg-accent-primary/90 transition-none flex items-center gap-2 disabled:opacity-50"
                         >
                           <Save size={16} />
                           {processing ? 'Guardando...' : 'Guardar Cambios'}
                         </button>
                       </div>
                     </div>
                   )}

                  <div className="bg-card-hover/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown size={16} className="text-yellow-500" />
                      <h3 className="text-sm font-semibold text-primary">Estado VIP</h3>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-primary">
                          {selectedUser.is_prime ? "VIP Activo" : "VIP Inactivo"}
                        </p>
                        {selectedUser.is_prime && selectedUser.prime_expires_at && (
                          <p className="text-xs text-muted">
                            Expira: {new Date(selectedUser.prime_expires_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setModalType("vip");
                          setFormData({ ...formData, isPrime: selectedUser.is_prime });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          selectedUser.is_prime
                            ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/30"
                            : "bg-card-hover border border-subtle text-muted hover:text-primary"
                        }`}
                      >
                        Gestionar VIP
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-semibold text-primary mb-1">
                    {modalType === "add" ? "Agregar Items" : modalType === "remove" ? "Remover Items" : "Gestionar VIP"}
                  </h2>
                  <p className="text-sm text-muted mb-4">
                    Usuario: {selectedUser?.name} (@{selectedUser?.username})
                  </p>

                  <form onSubmit={(e) => {
                     e.preventDefault();
                     const delta = modalType === "add" ? formData.count : -formData.count;
                     handleLocalChange(selectedUser.id, formData.itemType, delta);
                     setModalType("manage");
                   }} className="space-y-4">
                     {(modalType === "add" || modalType === "remove") && (
                       <>
                         <div className="grid grid-cols-2 gap-4">
                           <div>
                             <label className="block text-xs font-medium text-muted mb-1.5">Acción</label>
                             <select
                               value={modalType}
                               onChange={(e) => setModalType(e.target.value)}
                               className="w-full px-3 py-2 bg-card-hover border border-subtle rounded-lg text-sm text-primary focus:outline-none focus:border-accent-primary"
                             >
                               <option value="add">Agregar (+)</option>
                               <option value="remove">Remover (-)</option>
                             </select>
                           </div>
                           <div>
                             <label className="block text-xs font-medium text-muted mb-1.5">Tipo de Item</label>
                             <select
                               value={formData.itemType}
                               onChange={(e) => setFormData({ ...formData, itemType: e.target.value })}
                               className="w-full px-3 py-2 bg-card-hover border border-subtle rounded-lg text-sm text-primary focus:outline-none focus:border-accent-primary"
                             >
                               {ITEM_TYPES.map((type) => (
                                 <option key={type.value} value={type.value}>{type.label}</option>
                               ))}
                             </select>
                           </div>
                         </div>
                         <div>
                           <label className="block text-xs font-medium text-muted mb-1.5">Cantidad Personalizada</label>
                           <input
                             type="number"
                             min="1"
                             value={formData.count}
                             onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) || 1 })}
                             className="w-full px-3 py-2 bg-card-hover border border-subtle rounded-lg text-sm text-primary focus:outline-none focus:border-accent-primary"
                           />
                         </div>
                       </>
                     )}

                    {modalType === "vip" && (
                      <>
                        <div className="flex items-center gap-3">
                          <label className="text-xs font-medium text-muted">Estado VIP:</label>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, isPrime: !formData.isPrime })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              formData.isPrime
                                ? "bg-green-500/10 text-green-500 border border-green-500/30"
                                : "bg-red-500/10 text-red-500 border border-red-500/30"
                            }`}
                          >
                            {formData.isPrime ? "ACTIVADO" : "DESACTIVADO"}
                          </button>
                        </div>
                        {formData.isPrime && (
                          <div>
                            <label className="block text-xs font-medium text-muted mb-1.5">Días de duración</label>
                            <input
                              type="number"
                              min="1"
                              value={formData.days}
                              onChange={(e) => setFormData({ ...formData, days: parseInt(e.target.value) || 1 })}
                              className="w-full px-3 py-2 bg-card-hover border border-subtle rounded-lg text-sm text-primary focus:outline-none focus:border-accent-primary"
                            />
                          </div>
                        )}
                      </>
                    )}

                     <div className="flex items-center gap-3 pt-2">
                       <button
                         type="button"
                         onClick={() => setModalType("manage")}
                         className="flex-1 px-4 py-2 bg-card-hover border border-subtle rounded-lg text-sm text-muted hover:bg-card-hover/80 transition-colors"
                       >
                         Volver
                       </button>
                       <button
                         type="submit"
                         className="flex-1 px-4 py-2 bg-accent-primary text-white rounded-lg text-sm font-medium hover:bg-accent-primary/90 transition-colors flex items-center justify-center gap-2"
                       >
                         <Save size={14} />
                         Aplicar Cambio
                       </button>
                     </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
    </div>
  );
}