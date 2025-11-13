import { useState } from "react";
import { User, Mail, Phone, MapPin, Edit2, Save, X } from "lucide-react";

export const ProfileView = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "Ana García",
    email: "ana.garcia@email.com",
    phone: "+34 612 345 678",
    address: "Madrid, España",
    bio: "Amante de los accesorios elegantes y la moda atemporal.",
  });

  const [editData, setEditData] = useState(formData);

  const handleSave = () => {
    setFormData(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(formData);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen pt-20 bg-white">
      <div className="max-w-4xl mx-auto px-8 py-16">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extralight tracking-widest mb-8 uppercase">
            Mi Perfil
          </h1>
          
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-6 py-2 border border-black/20 text-sm tracking-widest uppercase hover:border-black/40 transition-colors"
            >
              <Edit2 size={16} />
              Editar
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {/* Avatar Section */}
          <div className="md:col-span-1">
            <div className="flex flex-col items-center">
              <div className="w-48 h-48 rounded-full bg-[#314737]/10 flex items-center justify-center mb-6 overflow-hidden">
                <User size={80} className="text-[#314737]/40" />
              </div>
              
              {isEditing && (
                <button className="text-sm tracking-widest text-black/60 uppercase hover:text-black transition-colors">
                  Cambiar foto
                </button>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="md:col-span-2 space-y-8">
            {/* Name */}
            <div className="border-b border-black/10 pb-6">
              <label className="block text-xs tracking-[0.15em] uppercase text-black/60 mb-3">
                Nombre completo
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full text-lg tracking-[0.05em] text-black bg-transparent border border-black/20 px-4 py-2 focus:outline-none focus:border-black/40 transition-colors"
                />
              ) : (
                <p className="text-lg tracking-[0.05em] text-black">{formData.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="border-b border-black/10 pb-6">
              <label className="flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-black/60 mb-3">
                <Mail size={14} />
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  className="w-full text-lg tracking-[0.05em] text-black bg-transparent border border-black/20 px-4 py-2 focus:outline-none focus:border-black/40 transition-colors"
                />
              ) : (
                <p className="text-lg tracking-[0.05em] text-black">{formData.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="border-b border-black/10 pb-6">
              <label className="flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-black/60 mb-3">
                <Phone size={14} />
                Teléfono
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  className="w-full text-lg tracking-[0.05em] text-black bg-transparent border border-black/20 px-4 py-2 focus:outline-none focus:border-black/40 transition-colors"
                />
              ) : (
                <p className="text-lg tracking-[0.05em] text-black">{formData.phone}</p>
              )}
            </div>

            {/* Address */}
            <div className="border-b border-black/10 pb-6">
              <label className="flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-black/60 mb-3">
                <MapPin size={14} />
                Dirección
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.address}
                  onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                  className="w-full text-lg tracking-[0.05em] text-black bg-transparent border border-black/20 px-4 py-2 focus:outline-none focus:border-black/40 transition-colors"
                />
              ) : (
                <p className="text-lg tracking-[0.05em] text-black">{formData.address}</p>
              )}
            </div>            

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-8 py-3 bg-[#314737] text-white text-sm tracking-[0.15em] uppercase hover:bg-[#314737]/90 transition-colors"
                >
                  <Save size={16} />
                  Guardar
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-8 py-3 border border-black/20 text-sm tracking-widest uppercase hover:border-black/40 transition-colors"
                >
                  <X size={16} />
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Orders Section */}
        <div className="mt-16 pt-16 border-t border-black/10">
          <h2 className="text-2xl font-extralight tracking-[0.2em] text-black uppercase mb-8">
            Mis Pedidos
          </h2>
          
          <div className="space-y-4">
            {[1, 2, 3].map((order) => (
              <div
                key={order}
                className="border border-black/10 p-6 hover:border-black/20 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm tracking-widest uppercase text-black/60 mb-1">
                      Pedido #{1000 + order}
                    </p>
                    <p className="text-lg tracking-[0.05em] text-black">
                      Reloj Classic Edition
                    </p>
                  </div>
                  <span className="text-sm tracking-widest uppercase text-[#314737]">
                    Entregado
                  </span>
                </div>
                <p className="text-sm tracking-[0.05em] text-black/60">
                  15 de marzo, 2024
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
