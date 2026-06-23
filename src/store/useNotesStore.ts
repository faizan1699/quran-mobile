import { create } from 'zustand';
import {
  Note,
  NoteInput,
  listNotes,
  createNote,
  updateNote,
  deleteNote,
  setNotePinned,
} from '@/services/notesDb';

interface NotesState {
  notes: Note[];
  loading: boolean;
  loaded: boolean;
  search: string;
  error: string | null;

  loadNotes: () => Promise<void>;
  setSearch: (query: string) => void;
  addNote: (input: NoteInput) => Promise<Note | null>;
  editNote: (id: number, input: NoteInput) => Promise<boolean>;
  removeNote: (id: number) => Promise<boolean>;
  togglePin: (id: number) => Promise<void>;
  setPinned: (id: number, pinned: boolean) => Promise<void>;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  loading: false,
  loaded: false,
  search: '',
  error: null,

  loadNotes: async () => {
    const q = get().search;
    set({ loading: true, error: null });
    try {
      const notes = await listNotes(q);
      if (get().search !== q) {
        return;
      }
      set({ notes, loading: false, loaded: true });
    } catch (e) {
      if (get().search !== q) {
        return;
      }
      set({
        loading: false,
        loaded: true,
        error: e instanceof Error ? e.message : 'Failed to load notes',
      });
    }
  },

  setSearch: (query) => {
    set({ search: query });
    void get().loadNotes();
  },

  addNote: async (input) => {
    try {
      const note = await createNote(input);
      await get().loadNotes();
      return note;
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to save note' });
      return null;
    }
  },

  editNote: async (id, input) => {
    try {
      await updateNote(id, input);
      await get().loadNotes();
      return true;
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to save note' });
      return false;
    }
  },

  removeNote: async (id) => {
    try {
      await deleteNote(id);
      await get().loadNotes();
      return true;
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to delete note' });
      return false;
    }
  },

  togglePin: async (id) => {
    const note = get().notes.find((n) => n.id === id);
    if (!note) {
      return;
    }
    await get().setPinned(id, !note.isPinned);
  },

  setPinned: async (id, pinned) => {
    try {
      await setNotePinned(id, pinned);
      await get().loadNotes();
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to update note' });
    }
  },
}));
