import React, { useState } from 'react';
import { Appointment, AppointmentType, Patient } from '../types';
import { X, Save, Calendar, Clock, UserPlus } from 'lucide-react';

interface AppointmentFormProps {
  patients: Patient[];
  onSave: (appointment: Appointment) => void;
  onCancel: () => void;
  onNewPatientRequested: () => void;
}

// Simple ID Generator
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export const AppointmentForm: React.FC<AppointmentFormProps> = ({ patients, onSave, onCancel, onNewPatientRequested }) => {
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    duration: 60,
    type: AppointmentType.PATIENT,
    patientId: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    const [year, month, day] = formData.date.split('-').map(Number);
    const [hours, minutes] = formData.time.split(':').map(Number);
    const dateObj = new Date(year, month - 1, day, hours, minutes);

    const newAppointment: Appointment = {
      id: generateId(),
      title: formData.title,
      date: dateObj,
      durationMinutes: Number(formData.duration),
      type: formData.type,
      patientId: formData.patientId || undefined,
      notes: formData.notes
    };

    onSave(newAppointment);
  };

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pid = e.target.value;
    
    // Check if user selected "Create New"
    if (pid === '_NEW_PATIENT_') {
      onNewPatientRequested();
      return;
    }

    const patient = patients.find(p => p.id === pid);
    setFormData(prev => ({
        ...prev, 
        patientId: pid,
        title: patient ? `Seduta ${patient.firstName} ${patient.lastName}` : prev.title
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-gold-600/30 rounded-xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Nuovo Appuntamento</h2>
          <button onClick={onCancel} className="text-zinc-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Tipologia</label>
            <select 
              value={formData.type} 
              onChange={e => setFormData({...formData, type: e.target.value as AppointmentType})}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white focus:border-gold-500 outline-none"
            >
              {Object.values(AppointmentType).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {formData.type === AppointmentType.PATIENT && (
             <div>
                <label className="block text-sm text-zinc-400 mb-1">Paziente</label>
                <div className="relative">
                  <select 
                    value={formData.patientId} 
                    onChange={handlePatientChange}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white focus:border-gold-500 outline-none appearance-none"
                  >
                    <option value="">Seleziona Paziente...</option>
                    <option value="_NEW_PATIENT_" className="text-gold-400 font-bold bg-zinc-800">
                      + NUOVO PAZIENTE (Crea Scheda)
                    </option>
                    <hr className="border-zinc-700 my-2" />
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.lastName} {p.firstName}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-3 pointer-events-none text-zinc-500">
                    <UserPlus size={16} />
                  </div>
                </div>
             </div>
          )}

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Titolo / Descrizione</label>
            <input 
              required
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white focus:border-gold-500 outline-none"
              placeholder="Es. Seduta Clinica, Riunione, ecc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm text-zinc-400 mb-1">Data</label>
                <div className="relative">
                    <input 
                        type="date"
                        required
                        value={formData.date}
                        onChange={e => setFormData({...formData, date: e.target.value})}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white focus:border-gold-500 outline-none"
                    />
                    <Calendar className="absolute right-3 top-3 text-zinc-500 pointer-events-none" size={16} />
                </div>
             </div>
             <div>
                <label className="block text-sm text-zinc-400 mb-1">Ora Inizio</label>
                 <div className="relative">
                    <input 
                        type="time"
                        required
                        value={formData.time}
                        onChange={e => setFormData({...formData, time: e.target.value})}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white focus:border-gold-500 outline-none"
                    />
                    <Clock className="absolute right-3 top-3 text-zinc-500 pointer-events-none" size={16} />
                </div>
             </div>
          </div>

          <div>
             <label className="block text-sm text-zinc-400 mb-1">Durata (minuti)</label>
             <input 
                 type="number"
                 value={formData.duration}
                 onChange={e => setFormData({...formData, duration: Number(e.target.value)})}
                 className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white focus:border-gold-500 outline-none"
             />
          </div>

          <button type="submit" className="w-full bg-gold-600 hover:bg-gold-500 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 mt-4 shadow-lg shadow-gold-900/20">
            <Save size={18} /> Salva Appuntamento
          </button>
        </form>
      </div>
    </div>
  );
};