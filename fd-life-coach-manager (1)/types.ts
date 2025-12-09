export enum AppointmentType {
  WORK = 'Turno Lavoro',
  PATIENT = 'Paziente',
  SOCIAL = 'Social / Marketing',
  OTHER = 'Altro'
}

export interface Appointment {
  id: string;
  title: string;
  date: Date; // Keep as date object for calculations
  durationMinutes: number;
  type: AppointmentType;
  patientId?: string; // Optional link to a patient
  notes?: string;
}

export interface ClinicalNote {
  id: string;
  date: string;
  content: string;
  isAiGenerated?: boolean;
}

export interface TestResult {
  id: string;
  name: string;
  date: string;
  score?: string;
  notes?: string;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  phone: string;
  avatar?: string;
  
  // Clinical Data
  presentingProblem: string; // "Sintesi problematica"
  diagnosis: string;
  currentTherapy: string; // "Terapia in atto"
  plannedTherapy: string; // "Terapia da fare"
  
  notes: ClinicalNote[];
  tests: TestResult[];
}

export type ViewState = 'dashboard' | 'calendar' | 'patients' | 'settings';