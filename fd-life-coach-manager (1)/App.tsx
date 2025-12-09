import React, { useState } from 'react';
import { ViewState, Appointment, AppointmentType, Patient } from './types';
import { LayoutDashboard, Users, Calendar as CalendarIcon, Settings, Plus, LogOut, Clock, CalendarDays, Trash2, AlertTriangle, X } from 'lucide-react';
import { Logo } from './components/Logo';
import { PatientForm } from './components/PatientForm';
import { PatientDetail } from './components/PatientDetail';
import { AppointmentForm } from './components/AppointmentForm';

// Utility per generare ID univoci compatibile con tutti i browser
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

// Dati iniziali VUOTI come richiesto
const MOCK_PATIENTS: Patient[] = [];
const MOCK_APPOINTMENTS: Appointment[] = [];

// Interfaccia per lo stato della modale di conferma
interface ConfirmModalState {
    isOpen: boolean;
    type: 'appointment' | 'patient' | null;
    id: string | null;
    title: string;
    message: string;
}

export default function App() {
  const [view, setView] = useState<ViewState>('dashboard');
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  
  const [returnToAppointment, setReturnToAppointment] = useState(false);

  // Stato per la modale di conferma personalizzata
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
      isOpen: false,
      type: null,
      id: null,
      title: '',
      message: ''
  });

  // --- Derived State for Dashboard ---
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isSameDay = (d1: Date, d2: Date) => 
    d1.getDate() === d2.getDate() && 
    d1.getMonth() === d2.getMonth() && 
    d1.getFullYear() === d2.getFullYear();

  const todayAppointments = appointments.filter(a => isSameDay(a.date, today)).sort((a, b) => a.date.getTime() - b.date.getTime());
  const tomorrowAppointments = appointments.filter(a => isSameDay(a.date, tomorrow)).sort((a, b) => a.date.getTime() - b.date.getTime());

  // --- Handlers ---

  const handleSavePatient = (newPatient: Patient) => {
    // Assicura che l'ID sia presente
    const patientToSave = { ...newPatient, id: newPatient.id || generateId() };

    const existingIndex = patients.findIndex(p => p.id === patientToSave.id);
    if (existingIndex >= 0) {
        const updated = [...patients];
        updated[existingIndex] = patientToSave;
        setPatients(updated);
    } else {
        setPatients([...patients, patientToSave]);
    }
    setShowPatientForm(false);

    if (returnToAppointment) {
        setReturnToAppointment(false);
        setShowAppointmentForm(true);
    }
  };

  const handleUpdatePatient = (updatedPatient: Patient) => {
      const idx = patients.findIndex(p => p.id === updatedPatient.id);
      if (idx !== -1) {
          const newPatients = [...patients];
          newPatients[idx] = updatedPatient;
          setPatients(newPatients);
      }
  };

  // Funzioni che aprono la modale invece di usare window.confirm
  const initiateDeletePatient = (id: string) => {
      setConfirmModal({
          isOpen: true,
          type: 'patient',
          id: id,
          title: 'Elimina Paziente',
          message: 'Sei sicuro di voler eliminare definitivamente questo paziente e tutti i suoi dati? Verranno rimossi anche gli appuntamenti associati.'
      });
  };

  const initiateDeleteAppointment = (id: string) => {
      setConfirmModal({
          isOpen: true,
          type: 'appointment',
          id: id,
          title: 'Elimina Appuntamento',
          message: 'Sei sicuro di voler rimuovere questo impegno dal calendario?'
      });
  };

  // Funzione che esegue effettivamente l'eliminazione
  const executeDelete = () => {
      if (!confirmModal.id || !confirmModal.type) return;

      if (confirmModal.type === 'patient') {
          setPatients(prev => prev.filter(p => p.id !== confirmModal.id));
          setAppointments(prev => prev.filter(a => a.patientId !== confirmModal.id));
          if (selectedPatientId === confirmModal.id) {
              setSelectedPatientId(null);
          }
      } else if (confirmModal.type === 'appointment') {
          setAppointments(prev => prev.filter(a => a.id !== confirmModal.id));
      }

      // Chiudi modale
      setConfirmModal({ isOpen: false, type: null, id: null, title: '', message: '' });
  };

  const handleAddAppointment = (newApp: Appointment) => {
      setAppointments([...appointments, { ...newApp, id: newApp.id || generateId() }]);
      setShowAppointmentForm(false);
  };

  const handleNewPatientRequest = () => {
    setReturnToAppointment(true);
    setShowAppointmentForm(false);
    setShowPatientForm(true);
  };

  const getTypeColor = (type: AppointmentType) => {
    switch (type) {
      case AppointmentType.WORK: return 'bg-blue-900/20 border-blue-800 text-blue-200';
      case AppointmentType.PATIENT: return 'bg-gold-600/10 border-gold-600/40 text-gold-100';
      case AppointmentType.SOCIAL: return 'bg-purple-900/20 border-purple-800 text-purple-200';
      default: return 'bg-zinc-800 border-zinc-700 text-zinc-300';
    }
  };

  // --- Render Functions ---

  const renderDashboard = () => (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-white">Bentornato, <span className="text-gold-500">Dott. Donati</span></h2>
        <p className="text-zinc-400">Ecco il riepilogo delle tue attività.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Today */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-600/5 rounded-full blur-3xl pointer-events-none"></div>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                <Clock className="text-gold-500" /> Oggi
                <span className="text-sm font-normal text-zinc-500 ml-auto capitalize">{today.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            </h3>
            
            {todayAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-zinc-500 relative z-10">
                    <CalendarDays size={48} className="mb-2 opacity-20" />
                    <p className="italic">Nessun impegno per oggi.</p>
                </div>
            ) : (
                <div className="space-y-3 relative z-10">
                    {todayAppointments.map(app => (
                        <div key={app.id} className={`p-4 rounded-xl border flex items-center gap-4 ${getTypeColor(app.type)}`}>
                            <div className="text-center min-w-[3rem]">
                                <span className="block font-bold text-lg leading-none">{app.date.getHours().toString().padStart(2, '0')}</span>
                                <span className="text-xs opacity-70">:{app.date.getMinutes().toString().padStart(2, '0')}</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold">{app.title}</h4>
                                <span className="text-xs uppercase tracking-wider opacity-70">{app.type}</span>
                            </div>
                            <button 
                                type="button"
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={(e) => { 
                                    e.preventDefault();
                                    e.stopPropagation(); 
                                    initiateDeleteAppointment(app.id); 
                                }}
                                className="relative z-50 p-2.5 bg-zinc-950/50 hover:bg-red-900/80 text-zinc-400 hover:text-white rounded-lg border border-transparent hover:border-red-500 transition cursor-pointer shadow-sm"
                                title="Elimina appuntamento"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Tomorrow */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 shadow-xl relative">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <CalendarDays className="text-zinc-500" /> Domani
                <span className="text-sm font-normal text-zinc-500 ml-auto capitalize">{tomorrow.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            </h3>
             {tomorrowAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
                    <p className="italic">Nessun impegno per domani.</p>
                </div>
            ) : (
                <div className="space-y-3 relative z-10">
                    {tomorrowAppointments.map(app => (
                        <div key={app.id} className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/50 flex items-center gap-4 text-zinc-400">
                             <div className="text-center min-w-[3rem]">
                                <span className="block font-bold text-lg leading-none">{app.date.getHours().toString().padStart(2, '0')}</span>
                                <span className="text-xs opacity-70">:{app.date.getMinutes().toString().padStart(2, '0')}</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-zinc-300">{app.title}</h4>
                                <span className="text-xs uppercase tracking-wider opacity-50">{app.type}</span>
                            </div>
                            <button 
                                type="button"
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={(e) => { 
                                    e.preventDefault();
                                    e.stopPropagation(); 
                                    initiateDeleteAppointment(app.id); 
                                }}
                                className="relative z-50 p-2.5 bg-zinc-900/50 hover:bg-red-900/80 text-zinc-500 hover:text-white rounded-lg border border-transparent hover:border-red-500 transition cursor-pointer shadow-sm"
                                title="Elimina appuntamento"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );

  const renderPatientsList = () => (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-white">Clienti</h2>
            <button 
                onClick={() => setShowPatientForm(true)}
                className="bg-gold-600 hover:bg-gold-500 text-black px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition shadow-lg shadow-gold-900/20"
            >
                <Plus size={20} /> Nuovo Paziente
            </button>
        </div>

        {patients.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-500 border border-zinc-800 rounded-xl bg-zinc-900/50 border-dashed">
                <Users size={48} className="mb-4 opacity-30" />
                <p className="text-lg">Nessun paziente in archivio.</p>
                <p className="text-sm">Clicca su "Nuovo Paziente" per iniziare.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {patients.map(patient => (
                    <div key={patient.id} className="relative group">
                        {/* Action Bar Overlay - Assicura che il cestino sia cliccabile */}
                        <div className="absolute top-2 right-2 z-50">
                             <button 
                                type="button"
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    initiateDeletePatient(patient.id);
                                }}
                                className="p-2.5 bg-zinc-950/80 hover:bg-red-600 text-zinc-400 hover:text-white rounded-lg transition shadow-md border border-zinc-700 hover:border-red-500 cursor-pointer backdrop-blur-md"
                                title="Elimina paziente"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>

                        {/* Clickable Card */}
                        <div 
                            onClick={() => setSelectedPatientId(patient.id)}
                            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-gold-600/50 p-6 rounded-xl cursor-pointer transition h-full relative z-10 shadow-lg group-hover:shadow-gold-900/10"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-gold-500 font-bold text-xl border border-zinc-700 group-hover:border-gold-500 transition">
                                    {patient.firstName[0]}{patient.lastName[0]}
                                </div>
                            </div>
                            
                            <h3 className="text-lg font-bold text-white group-hover:text-gold-400 transition pr-8">{patient.lastName} {patient.firstName}</h3>
                            
                            {patient.diagnosis && (
                                <div className="mt-2">
                                    <span className="bg-zinc-950 text-zinc-400 text-xs px-2 py-1 rounded border border-zinc-800 inline-block">
                                        {patient.diagnosis.length > 25 ? patient.diagnosis.slice(0, 25) + '...' : patient.diagnosis}
                                    </span>
                                </div>
                            )}
                            
                            <p className="text-sm text-zinc-500 mt-4 pt-4 border-t border-zinc-800/50 flex items-center gap-2">
                                <Clock size={14} />
                                Ultima visita: {patient.notes.length > 0 ? new Date(patient.notes[0].date).toLocaleDateString('it-IT') : 'Nessuna nota'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );

  const renderCalendar = () => (
      <div className="p-8 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
                <h2 className="text-3xl font-bold text-white">Agenda</h2>
                <button 
                    onClick={() => setShowAppointmentForm(true)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-gold-400 px-3 py-1.5 rounded-lg text-sm font-medium border border-zinc-700 flex items-center gap-2 transition"
                >
                    <Plus size={16} /> Nuovo Impegno
                </button>
            </div>
            <div className="flex gap-4">
                 <div className="flex items-center gap-2 text-sm text-zinc-400 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div> Lavoro
                 </div>
                 <div className="flex items-center gap-2 text-sm text-zinc-400 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
                    <div className="w-2 h-2 bg-gold-500 rounded-full"></div> Pazienti
                 </div>
                 <div className="flex items-center gap-2 text-sm text-zinc-400 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div> Social
                 </div>
            </div>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl flex-1 overflow-auto shadow-inner">
            <div className="divide-y divide-zinc-900">
                {[0, 1, 2, 3, 4, 5, 6].map(offset => {
                    const date = new Date();
                    date.setDate(date.getDate() + offset);
                    date.setHours(0,0,0,0);
                    const isToday = offset === 0;
                    
                    const dayApps = appointments.filter(a => isSameDay(a.date, date)).sort((a,b) => a.date.getTime() - b.date.getTime());
                    
                    return (
                        <div key={offset} className={`flex transition hover:bg-zinc-900/30 ${isToday ? 'bg-gold-900/5' : ''}`}>
                            {/* Date Column */}
                            <div className={`w-32 py-6 text-right pr-6 border-r border-zinc-800 flex flex-col items-end ${isToday ? 'text-gold-500' : 'text-zinc-500'}`}>
                                <span className="text-2xl font-bold leading-none">{date.getDate()}</span>
                                <span className="text-sm uppercase font-medium tracking-wide">{date.toLocaleDateString('it-IT', { weekday: 'short' })}</span>
                                {isToday && <span className="text-[10px] bg-gold-600 text-black font-bold px-1.5 py-0.5 rounded mt-1">OGGI</span>}
                            </div>
                            
                            {/* Events Column */}
                            <div className="flex-1 p-4 space-y-2">
                                {dayApps.length === 0 ? (
                                    <span className="text-zinc-700 text-sm italic py-2 block">Nessun impegno pianificato</span>
                                ) : (
                                    dayApps.map(app => (
                                        <div key={app.id} className={`p-3 rounded-lg border text-sm flex items-center justify-between group ${getTypeColor(app.type)} relative`}>
                                            <div className="flex items-center gap-4">
                                                <div className="font-mono font-bold opacity-80 w-16 text-right">
                                                    {app.date.getHours().toString().padStart(2, '0')}:{app.date.getMinutes().toString().padStart(2, '0')}
                                                </div>
                                                <div>
                                                    <span className="font-semibold block">{app.title}</span>
                                                    <span className="text-xs opacity-60 flex items-center gap-1">
                                                        <Clock size={10} /> {app.durationMinutes} min
                                                    </span>
                                                </div>
                                            </div>
                                            {/* Fix bottone elimina calendario */}
                                            <button 
                                                type="button"
                                                onMouseDown={(e) => e.stopPropagation()}
                                                onClick={(e) => { 
                                                    e.preventDefault();
                                                    e.stopPropagation(); 
                                                    initiateDeleteAppointment(app.id); 
                                                }}
                                                className="relative z-50 p-2 text-zinc-400 hover:text-red-500 hover:bg-red-950/80 rounded-lg transition cursor-pointer border border-transparent hover:border-red-900"
                                                title="Elimina"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
      </div>
  );

  // --- Main Render Flow ---

  if (selectedPatientId) {
      const patient = patients.find(p => p.id === selectedPatientId);
      if (patient) {
          return (
              <>
                <PatientDetail 
                    patient={patient} 
                    onBack={() => setSelectedPatientId(null)} 
                    onUpdate={handleUpdatePatient}
                    onDelete={initiateDeletePatient}
                />
                
                {/* Modale Conferma (se aperta sopra il dettaglio) */}
                {confirmModal.isOpen && (
                    <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-zinc-900 border border-red-900/50 rounded-xl p-6 max-w-md w-full shadow-2xl relative">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="p-3 bg-red-900/20 rounded-full text-red-500">
                                    <AlertTriangle size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">{confirmModal.title}</h3>
                                    <p className="text-zinc-400 text-sm leading-relaxed">{confirmModal.message}</p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button 
                                    onClick={() => setConfirmModal({...confirmModal, isOpen: false})}
                                    className="px-4 py-2 rounded-lg text-zinc-300 hover:bg-zinc-800 transition text-sm font-medium"
                                >
                                    Annulla
                                </button>
                                <button 
                                    onClick={executeDelete}
                                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-900/20 text-sm"
                                >
                                    Elimina Definitivamente
                                </button>
                            </div>
                        </div>
                    </div>
                )}
              </>
          );
      }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-zinc-200 font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="p-8 border-b border-zinc-800/50 flex justify-center">
           <Logo />
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${view === 'dashboard' ? 'bg-gold-600/10 text-gold-400 border border-gold-600/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button 
             onClick={() => setView('calendar')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${view === 'calendar' ? 'bg-gold-600/10 text-gold-400 border border-gold-600/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
          >
            <CalendarIcon size={20} /> Calendario
          </button>
          <button 
             onClick={() => setView('patients')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${view === 'patients' ? 'bg-gold-600/10 text-gold-400 border border-gold-600/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
          >
            <Users size={20} /> Clienti
          </button>
        </nav>

        <div className="p-4 border-t border-zinc-800">
           <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-white transition">
             <Settings size={20} /> Impostazioni
           </button>
           <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-red-400 transition">
             <LogOut size={20} /> Esci
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {view === 'dashboard' && renderDashboard()}
        {view === 'calendar' && renderCalendar()}
        {view === 'patients' && renderPatientsList()}
      </main>

      {/* Custom Confirmation Modal */}
      {confirmModal.isOpen && (
          <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-zinc-900 border border-red-900/50 rounded-xl p-6 max-w-md w-full shadow-2xl relative">
                  <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 bg-red-900/20 rounded-full text-red-500">
                          <AlertTriangle size={24} />
                      </div>
                      <div>
                          <h3 className="text-xl font-bold text-white mb-1">{confirmModal.title}</h3>
                          <p className="text-zinc-400 text-sm leading-relaxed">{confirmModal.message}</p>
                      </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                      <button 
                          onClick={() => setConfirmModal({...confirmModal, isOpen: false})}
                          className="px-4 py-2 rounded-lg text-zinc-300 hover:bg-zinc-800 transition text-sm font-medium"
                      >
                          Annulla
                      </button>
                      <button 
                          onClick={executeDelete}
                          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-900/20 text-sm"
                      >
                          Elimina Definitivamente
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Forms Modals */}
      {showPatientForm && (
        <PatientForm 
            onSave={handleSavePatient} 
            onCancel={() => setShowPatientForm(false)} 
        />
      )}

      {showAppointmentForm && (
        <AppointmentForm
            patients={patients}
            onSave={handleAddAppointment}
            onCancel={() => setShowAppointmentForm(false)}
            onNewPatientRequested={handleNewPatientRequest}
        />
      )}

    </div>
  );
}