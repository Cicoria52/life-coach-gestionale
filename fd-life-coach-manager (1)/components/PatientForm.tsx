import React, { useState } from 'react';
import { Patient } from '../types';
import { X, Save, Sparkles } from 'lucide-react';
import { suggestTherapyPlan } from '../services/geminiService';

interface PatientFormProps {
  initialData?: Partial<Patient>;
  onSave: (patient: Patient) => void;
  onCancel: () => void;
}

// Simple ID Generator
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export const PatientForm: React.FC<PatientFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Patient>>({
    firstName: '',
    lastName: '',
    age: 18,
    email: '',
    phone: '',
    presentingProblem: '',
    diagnosis: '',
    currentTherapy: '',
    plannedTherapy: '',
    notes: [],
    tests: [],
    ...initialData
  });

  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAiSuggestion = async () => {
    if (!formData.presentingProblem) return;
    setLoadingSuggestion(true);
    const suggestion = await suggestTherapyPlan(formData.presentingProblem);
    setFormData(prev => ({ ...prev, plannedTherapy: suggestion }));
    setLoadingSuggestion(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName) return;
    
    const newPatient: Patient = {
        id: formData.id || generateId(),
        firstName: formData.firstName!,
        lastName: formData.lastName!,
        age: Number(formData.age),
        email: formData.email || '',
        phone: formData.phone || '',
        presentingProblem: formData.presentingProblem || '',
        diagnosis: formData.diagnosis || '',
        currentTherapy: formData.currentTherapy || '',
        plannedTherapy: formData.plannedTherapy || '',
        notes: formData.notes || [],
        tests: formData.tests || [],
    };
    onSave(newPatient);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-gold-600/30 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-6 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gold-400">
            {initialData?.id ? 'Modifica Cartella Clinica' : 'Nuova Scheda Paziente'}
          </h2>
          <button onClick={onCancel} className="text-zinc-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Section 1: Anagrafica */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4 border-l-4 border-gold-500 pl-3">Dati Anagrafici</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Nome</label>
                <input required name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white focus:border-gold-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Cognome</label>
                <input required name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white focus:border-gold-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Età</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white focus:border-gold-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Telefono</label>
                <input name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white focus:border-gold-500 focus:outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-zinc-400 mb-1">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white focus:border-gold-500 focus:outline-none" />
              </div>
            </div>
          </div>

          {/* Section 2: Clinica */}
          <div className="col-span-1 md:col-span-2">
             <h3 className="text-lg font-semibold text-white mb-4 border-l-4 border-gold-500 pl-3 mt-4">Quadro Clinico</h3>
             
             <div className="mb-4">
                <label className="block text-sm text-zinc-400 mb-1">Sintesi Problematica (Motivo consultazione)</label>
                <textarea name="presentingProblem" rows={3} value={formData.presentingProblem} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white focus:border-gold-500 focus:outline-none" placeholder="Descrivi il motivo della visita..." />
             </div>

             <div className="mb-4">
                <label className="block text-sm text-zinc-400 mb-1">Diagnosi / Ipotesi Diagnostica</label>
                <input name="diagnosis" value={formData.diagnosis} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white focus:border-gold-500 focus:outline-none" />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm text-zinc-400 mb-1">Terapia in Atto</label>
                  <textarea name="currentTherapy" rows={4} value={formData.currentTherapy} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white focus:border-gold-500 focus:outline-none" placeholder="Farmaci o altre terapie..." />
               </div>
               <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm text-zinc-400">Obiettivi / Terapia da fare</label>
                    <button 
                      type="button"
                      onClick={handleAiSuggestion}
                      disabled={loadingSuggestion || !formData.presentingProblem}
                      className="text-xs flex items-center gap-1 text-gold-400 hover:text-gold-300 disabled:opacity-50"
                    >
                        <Sparkles size={12} /> {loadingSuggestion ? 'Analisi...' : 'Suggerisci AI'}
                    </button>
                  </div>
                  <textarea name="plannedTherapy" rows={4} value={formData.plannedTherapy} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white focus:border-gold-500 focus:outline-none" placeholder="Piano terapeutico..." />
               </div>
             </div>
          </div>

          <div className="col-span-1 md:col-span-2 flex justify-end gap-3 pt-6 border-t border-zinc-800">
             <button type="button" onClick={onCancel} className="px-6 py-2 rounded-lg text-zinc-300 hover:bg-zinc-800 transition">Annulla</button>
             <button type="submit" className="px-6 py-2 rounded-lg bg-gold-600 hover:bg-gold-500 text-black font-semibold shadow-lg shadow-gold-900/20 flex items-center gap-2">
               <Save size={18} /> Salva Scheda
             </button>
          </div>

        </form>
      </div>
    </div>
  );
};