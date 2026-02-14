import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useLocalAuth } from "@/hooks/useLocalAuth";

type AuthMode = "local" | "cloud";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    mode: AuthMode;
    switchMode: (mode: AuthMode) => void;
    signIn: (email: string, password: string, displayName?: string) => Promise<{ error: unknown }>;
    signUp: (email: string, password: string, displayName?: string) => Promise<{ error: unknown }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    mode: "local",
    switchMode: () => { },
    signIn: async () => ({ error: null }),
    signUp: async () => ({ error: null }),
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [mode, setMode] = useState<AuthMode>(() => {
        return (localStorage.getItem("lifeline-auth-mode") as AuthMode) || "local";
    });

    const localAuth = useLocalAuth();
    const [cloudUser, setCloudUser] = useState<User | null>(null);
    const [cloudSession, setCloudSession] = useState<Session | null>(null);
    const [cloudLoading, setCloudLoading] = useState(true);

    // Persist mode choice
    useEffect(() => {
        localStorage.setItem("lifeline-auth-mode", mode);
    }, [mode]);

    // Cloud Auth Effect
    useEffect(() => {
        let mounted = true;

        // Check initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!mounted) return;
            if (session) {
                setCloudSession(session);
                setCloudUser(session.user);
                // Auto-switch to cloud if we have a session
                setMode("cloud");
                localStorage.setItem("lifeline-auth-mode", "cloud");
            }
            setCloudLoading(false);
        });

        // Subscribe to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                if (!mounted) return;
                setCloudSession(session);
                setCloudUser(session?.user ?? null);
                setCloudLoading(false);

                if (session) {
                    setMode("cloud");
                    localStorage.setItem("lifeline-auth-mode", "cloud");
                }
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const switchMode = (newMode: AuthMode) => {
        setMode(newMode);
    };

    const handleSignIn = async (email: string, password: string, _displayName?: string) => {
        if (mode === "local") {
            const { error } = await localAuth.signIn(email, password);
            return { error };
        } else {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            return { error };
        }
    };

    const handleSignUp = async (email: string, password: string, displayName?: string) => {
        if (mode === "local") {
            const { error } = await localAuth.signUp(email, password, displayName);
            return { error };
        } else {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        display_name: displayName,
                    },
                },
            });
            return { error };
        }
    };

    const handleSignOut = async () => {
        if (mode === "local") {
            await localAuth.signOut();
        } else {
            await supabase.auth.signOut();
        }
    };

    // derived state based on mode
    // Cast local user/session through 'unknown' because local storage format is similar but not identical
    const user: User | null = mode === "local"
        ? (localAuth.user as unknown as User | null)
        : cloudUser;
    const session: Session | null = mode === "local"
        ? (localAuth.session as unknown as Session | null)
        : cloudSession;
    const loading = mode === "local" ? localAuth.loading : cloudLoading;

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                loading,
                mode,
                switchMode,
                signIn: handleSignIn,
                signUp: handleSignUp,
                signOut: handleSignOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
