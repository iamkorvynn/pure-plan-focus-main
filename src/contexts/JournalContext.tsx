import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface JournalEntry {
    id: string;
    content: string;
    mood: string | null;
    createdAt: string;
}

interface JournalContextType {
    entries: JournalEntry[];
    loading: boolean;
    addEntry: (content: string, mood?: string) => void;
    editEntry: (id: string, content: string, mood?: string) => void;
    deleteEntry: (id: string) => void;
}

const JournalContext = createContext<JournalContextType | null>(null);

export function JournalProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setEntries([]);
            setLoading(false);
            return;
        }

        supabase
            .from("journal_entries")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .then(({ data }) => {
                setEntries(
                    (data || []).map((e) => ({
                        id: e.id,
                        content: e.content,
                        mood: e.mood,
                        createdAt: e.created_at,
                    }))
                );
                setLoading(false);
            });
    }, [user]);

    const addEntry = useCallback(
        async (content: string, mood?: string) => {
            if (!user || !content) return;

            const { data } = await supabase
                .from("journal_entries")
                .insert({
                    user_id: user.id,
                    content,
                    mood: mood || null,
                })
                .select()
                .single();

            if (data) {
                setEntries((prev) => [
                    {
                        id: data.id,
                        content: data.content,
                        mood: data.mood,
                        createdAt: data.created_at,
                    },
                    ...prev,
                ]);
            }
        },
        [user]
    );

    const editEntry = useCallback(
        async (id: string, content: string, mood?: string) => {
            const trimmedContent = content.trim();
            if (!user || !trimmedContent) return;

            const { data } = await supabase
                .from("journal_entries")
                .update({
                    content: trimmedContent,
                    mood: mood || null,
                })
                .eq("id", id)
                .eq("user_id", user.id)
                .select()
                .single();

            if (data) {
                setEntries((prev) =>
                    prev.map((entry) =>
                        entry.id === id
                            ? {
                                ...entry,
                                content: data.content,
                                mood: data.mood,
                                createdAt: data.created_at,
                            }
                            : entry
                    )
                );
            }
        },
        [user]
    );

    const deleteEntry = useCallback(async (id: string) => {
        setEntries((prev) => prev.filter((e) => e.id !== id));
        await supabase.from("journal_entries").delete().eq("id", id);
    }, []);

    return (
        <JournalContext.Provider value={{ entries, loading, addEntry, editEntry, deleteEntry }}>
            {children}
        </JournalContext.Provider>
    );
}

export function useJournalContext() {
    const ctx = useContext(JournalContext);
    if (!ctx) throw new Error("useJournalContext must be used within JournalProvider");
    return ctx;
}
