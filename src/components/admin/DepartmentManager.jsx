import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import { Plus, Edit2, Trash2, X, Check, Building } from "lucide-react";

export default function DepartmentManager() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isAdding, setIsAdding] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("departments")
      .select("*")
      .order("name");
    
    if (error) {
      setError("Failed to load departments.");
    } else {
      setDepartments(data);
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newDeptName.trim()) return;
    const { error } = await supabase.from("departments").insert([{ name: newDeptName.trim() }]);
    
    if (error) {
      alert("Failed to add department.");
    } else {
      setNewDeptName("");
      setIsAdding(false);
      fetchDepartments();
    }
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) return;
    const { error } = await supabase.from("departments").update({ name: editName.trim() }).eq("id", id);
    
    if (error) {
      alert("Failed to update department.");
    } else {
      setEditingId(null);
      fetchDepartments();
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This may break faculties linked to it.`)) return;
    
    const { error } = await supabase.from("departments").delete().eq("id", id);
    if (error) {
      alert("Failed to delete. Ensure no faculties are linked to this department first.");
    } else {
      fetchDepartments();
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Departments</h1>
        <p className="text-slate-500 mt-2 text-sm">Manage the academic departments and administrative blocks.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden flex-1 flex flex-col relative">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Building className="text-blue-600" size={20} />
            Department List
          </h2>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all duration-200 text-sm font-semibold active:scale-95"
          >
            <Plus size={18} /> Add New
          </button>
        </div>

        {error && <div className="p-4 m-4 rounded-xl text-rose-600 bg-rose-50 border border-rose-100/50 text-sm font-medium">{error}</div>}

        <div className="overflow-y-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <tr className="text-slate-500 text-xs uppercase tracking-widest">
                <th className="p-5 font-bold">ID</th>
                <th className="p-5 font-bold">Department Name</th>
                <th className="p-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
            {isAdding && (
              <tr className="bg-blue-50/30">
                <td className="p-5 text-slate-400 text-sm font-medium">New</td>
                <td className="p-5">
                  <input
                    type="text"
                    value={newDeptName}
                    onChange={(e) => setNewDeptName(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-blue-200 bg-white rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700"
                    placeholder="e.g. Computer Science"
                    autoFocus
                  />
                </td>
                <td className="p-5 flex justify-end gap-2">
                  <button onClick={handleAdd} className="p-2.5 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-colors">
                    <Check size={20} />
                  </button>
                  <button onClick={() => setIsAdding(false)} className="p-2.5 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors">
                    <X size={20} />
                  </button>
                </td>
              </tr>
            )}

            {loading && !isAdding ? (
              <tr>
                <td colSpan="3" className="p-12 text-center text-slate-400 font-medium">Loading departments...</td>
              </tr>
            ) : departments.length === 0 && !isAdding ? (
              <tr>
                <td colSpan="3" className="p-12 text-center text-slate-400 font-medium">No departments found. Create one to get started.</td>
              </tr>
            ) : (
              departments.map((dept) => (
                <tr key={dept.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-5 text-slate-400 text-sm font-medium tracking-wider">#{dept.id.toString().padStart(3, '0')}</td>
                  
                  <td className="p-5 font-bold text-slate-700">
                    {editingId === dept.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-blue-200 bg-white rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700"
                        autoFocus
                      />
                    ) : (
                      dept.name
                    )}
                  </td>
                  
                  <td className="p-5 flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    {editingId === dept.id ? (
                      <>
                        <button onClick={() => handleUpdate(dept.id)} className="p-2.5 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-colors">
                          <Check size={20} />
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-2.5 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors">
                          <X size={20} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => { setEditingId(dept.id); setEditName(dept.name); }} 
                          className="p-2.5 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(dept.id, dept.name)} 
                          className="p-2.5 text-rose-500 hover:bg-rose-100 rounded-xl transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}
