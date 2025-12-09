import React, { useState } from 'react';
import { Patient, ClinicalNote } from '../types';
import { ArrowLeft, Plus, FileText, Activity, Clock, Sparkles, Trash2, AlertTriangle } from 'lucide-react';
import { generateClinicalSummary } from '../services/geminiService';

interface PatientDetailProps {
  patient: Patient;
  onBack: () => void;
  onUpdate: (updatedPatient: Patient) => void;
  onDelete: (id: string) => void;
}

// Simple ID Generator
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export const PatientDetail: React.FC<PatientDetailProps> = ({ patient, onBack, onUpdate, onDelete }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'notes' | 'tests'>('info');
  const [newNote, setNewNote] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const handleAddNote = async (useAi: boolean = false) => {
    if (!newNote.trim()) return;

    let finalContent = newNote;
    if (useAi) {
      setIsAiGenerating(true);
      const summary = await generateClinicalSummary(patient, newNote);
      finalContent = `${summary}\n\n-- Note Originali --\n${newNote}`;
      setIsAiGenerating(false);
    }

    const note: ClinicalNote = {
      id: generateId(),
      date: new Date().toISOString(),
      content: finalContent,
      isAiGenerated: useAi
    };

    const updatedPatient = {
      ...patient,
      notes: [note, ...patient.notes]
    };
    
    onUpdate(updatedPatient);
    setNewNote('');
  };

  const handleDelete = () => {
    // Delegate entirely to parent (App.tsx) which handles the Confirmation Modal
    onDelete(patient.id);
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      {/* Header */}
      <div className="p-6 border-b border-zinc-800 flex items-center gap-4 bg-zinc-900">
        <button onClick={onBack} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
           <h2 className="text-2xl font-bold text-white flex items-center gap-3">
             {patient.lastName} {patient.firstName}
             <span className="text-sm font-normal text-zinc-500 bg-zinc-800 px-2 py-1 rounded border border-zinc-700">Età: {patient.age}</span>
           </h2>
           <p className="text-gold-500 text-sm">{patient.email}</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setActiveTab('info')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'info' ? 'bg-zinc-800 text-white border border-gold-600/50' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
                Info & Clinica
            </button>
            <button 
                onClick={() => setActiveTab('notes')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'notes' ? 'bg-zinc-800 text-white border border-gold-600/50' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
                Diario Sedute
            </button>
            <button 
                onClick={() => setActiveTab('tests')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'tests' ? 'bg-zinc-800 text-white border border-gold-600/50' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
                Test & Documenti
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-950/30 hover:text-red-400 transition ml-2 border border-transparent hover:border-red-900"
              title="Elimina Paziente"
            >
              <Trash2 size={18} />
            </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-lg">
                <h3 className="text-gold-400 font-semibold mb-4 flex items-center gap-2"><Activity size={18}/> Quadro Clinico</h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs uppercase text-zinc-500 tracking-wider">Motivo Consultazione</label>
                        <p className="text-zinc-200 mt-1 leading-relaxed">{patient.presentingProblem}</p>
                    </div>
                    <div>
                        <label className="text-xs uppercase text-zinc-500 tracking-wider">Diagnosi</label>
                        <p className="text-zinc-200 mt-1">{patient.diagnosis || 'Non specificata'}</p>
                    </div>
                </div>
            </div>

            <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-lg">
                <h3 className="text-gold-400 font-semibold mb-4 flex items-center gap-2"><Clock size={18}/> Piano Terapeutico</h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs uppercase text-zinc-500 tracking-wider">Terapia in Atto</label>
                        <p className="text-zinc-200 mt-1">{patient.currentTherapy || 'Nessuna'}</p>
                    </div>
                    <div>
                        <label className="text-xs uppercase text-zinc-500 tracking-wider">Obiettivi Futuri</label>
                        <p className="text-zinc-200 mt-1">{patient.plannedTherapy || 'Da definire'}</p>
                    </div>
                </div>
            </div>
            
             <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-lg col-span-1 lg:col-span-2">
                 <h3 className="text-zinc-400 font-semibold mb-4">Contatti</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs uppercase text-zinc-500">Telefono</label>
                        <p className="text-white">{patient.phone}</p>
                    </div>
                    <div>
                        <label className="text-xs uppercase text-zinc-500">Email</label>
                        <p className="text-white">{patient.email}</p>
                    </div>
                 </div>
             </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="max-w-4xl mx-auto">
            {/* New Note Input */}
            <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 mb-8">
                <textarea 
                    className="w-full bg-zinc-950 p-4 rounded-lg text-zinc-200 border border-zinc-800 focus:border-gold-500 outline-none resize-none"
                    rows={3}
                    placeholder="Scrivi appunti sulla seduta odierna..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                />
                <div className="flex justify-end gap-2 mt-3">
                    <button 
                        onClick={() => handleAddNote(true)}
                        disabled={isAiGenerating || !newNote}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-gold-400 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                        <Sparkles size={16} /> 
                        {isAiGenerating ? 'Generazione...' : 'Analizza con AI'}
                    </button>
                    <button 
                        onClick={() => handleAddNote(false)}
                        disabled={!newNote}
                        className="px-4 py-2 bg-gold-600 hover:bg-gold-500 text-black rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                    >
                        <Plus size={16} /> Aggiungi Nota
                    </button>
                </div>
            </div>

            {/* Timeline */}
            <div className="space-y-6">
                {patient.notes.length === 0 && <p className="text-center text-zinc-600 italic">Nessuna nota presente.</p>}
                {patient.notes.map((note) => (
                    <div key={note.id} className="relative pl-8 border-l border-zinc-800">
                        <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-gold-600"></div>
                        <div className="bg-zinc-900 p-5 rounded-lg border border-zinc-800/50">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-mono text-zinc-500">
                                    {new Date(note.date).toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                                </span>
                                {note.isAiGenerated && (
                                    <span className="text-[10px] bg-indigo-900/30 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <Sparkles size={10} /> AI Assisted
                                    </span>
                                )}
                            </div>
                            <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed text-sm">
                                {note.content}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'tests' && (
           <div className="flex flex-col items-center justify-center h-64 text-zinc-500 border-2 border-dashed border-zinc-800 rounded-xl">
              <FileText size={48} className="mb-4 opacity-50"/>
              <p>Nessun test o documento caricato.</p>
              <button className="mt-4 text-gold-500 hover:underline text-sm">Carica Documento</button>
           </div>
        )}

      </div>
    </div>
  );
};