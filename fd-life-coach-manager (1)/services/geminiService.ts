import { GoogleGenAI } from "@google/genai";
import { Patient } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateClinicalSummary = async (patient: Patient, newNotes: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Errore: API Key mancante.";

  const prompt = `
    Sei un assistente clinico esperto per uno psicologo (Dott. Fabio Donati).
    Analizza i seguenti dati del paziente e gli appunti della seduta odierna.
    Genera una sintesi professionale clinica (max 200 parole) da inserire in cartella clinica.
    Usa un tono formale, medico e oggettivo.

    PAZIENTE: ${patient.firstName} ${patient.lastName}, ${patient.age} anni.
    PROBLEMATICA INIZIALE: ${patient.presentingProblem}
    DIAGNOSI: ${patient.diagnosis}

    APPUNTI GREZZI SEDUTA ODIERNA:
    ${newNotes}

    SINTESI SUGGERITA:
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Impossibile generare la sintesi.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Errore durante la generazione della sintesi AI.";
  }
};

export const suggestTherapyPlan = async (problem: string): Promise<string> => {
    const ai = getAiClient();
    if (!ai) return "Errore: API Key mancante.";
  
    const prompt = `
      Sei un supervisore clinico senior.
      Dato il seguente problema presentato da un paziente: "${problem}"
      
      Suggerisci 3 possibili approcci terapeutici o obiettivi a breve termine.
      Formatta la risposta come elenco puntato conciso.
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text || "Nessun suggerimento disponibile.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Errore AI.";
    }
  };