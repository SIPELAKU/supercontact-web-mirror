// lib/api/notes.ts
// Notes API functions

import { logger } from "../utils/logger";

// ============================================
// Types
// ============================================

export interface NoteData {
  title: string;
  content: string;
  reminder_date: string;
  reminder_time: string;
}

export interface Note extends NoteData {
  id: string;
}

export interface NotesResponse {
  success: boolean;
  data: {
    notes: Note[];
  };
  error?: string;
}

// ============================================
// Functions
// ============================================

export async function fetchNotes(token: string): Promise<NotesResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/notes`;
  
  logger.info("Making GET request to fetch notes", { url });

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    let json;
    try {
      json = await res.json();
    } catch (parseError: any) {
      logger.error("Failed to parse notes response JSON", { 
        status: res.status,
        statusText: res.statusText,
        parseError: parseError.message 
      });
      throw new Error(`Server returned invalid response (${res.status})`);
    }

    logger.apiResponse("/notes (GET)", { status: res.status, response: json });
    
    if (!res.ok) {
      logger.error(`Fetch notes failed: ${res.status}`, {
        status: res.status,
        statusText: res.statusText,
        response: json,
        url
      });
      throw new Error(json.message || json.error?.message || `Failed to fetch notes (${res.status}: ${res.statusText})`);
    }
    
    return json;
  } catch (error: any) {
    logger.error("Fetch notes request failed", { error: error.message, url });
    throw error;
  }
}

export async function createNote(token: string, noteData: NoteData): Promise<any> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/notes`;
  
  logger.info("Making POST request to create note", { 
    url, 
    noteData
  });

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(noteData),
    });

    let json;
    try {
      json = await res.json();
    } catch (parseError: any) {
      logger.error("Failed to parse create note response JSON", { 
        status: res.status,
        statusText: res.statusText,
        parseError: parseError.message 
      });
      throw new Error(`Server returned invalid response (${res.status})`);
    }

    logger.apiResponse("/notes (POST)", { status: res.status, response: json });
    
    if (!res.ok) {
      logger.error(`Create note failed: ${res.status}`, {
        status: res.status,
        statusText: res.statusText,
        response: json,
        url
      });
      throw new Error(json.message || json.error?.message || `Failed to create note (${res.status}: ${res.statusText})`);
    }
    
    return json;
  } catch (error: any) {
    logger.error("Create note request failed", { error: error.message, url });
    throw error;
  }
}

export async function updateNote(token: string, noteId: string, noteData: NoteData): Promise<any> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/notes?note_id=${noteId}`;
  
  logger.info("Making PUT request to update note", { 
    url, 
    noteId,
    noteData
  });

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(noteData),
    });

    let json;
    try {
      json = await res.json();
    } catch (parseError: any) {
      logger.error("Failed to parse update note response JSON", { 
        status: res.status,
        statusText: res.statusText,
        parseError: parseError.message 
      });
      throw new Error(`Server returned invalid response (${res.status})`);
    }

    logger.apiResponse("/notes (PUT)", { status: res.status, response: json });
    
    if (!res.ok) {
      logger.error(`Update note failed: ${res.status}`, {
        status: res.status,
        statusText: res.statusText,
        response: json,
        url
      });
      throw new Error(json.message || json.error?.message || `Failed to update note (${res.status}: ${res.statusText})`);
    }
    
    return json;
  } catch (error: any) {
    logger.error("Update note request failed", { error: error.message, url });
    throw error;
  }
}
