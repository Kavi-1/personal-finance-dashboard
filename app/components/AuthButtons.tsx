"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";

export default function AuthButtons() {
    const { data: session, status } = useSession();
    if (status === "loading") return null;

    if (!session) {
        return (
            <Button variant="outlined" onClick={() => signIn("google")}>
                Sign in with Google
            </Button>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <Avatar
                src={session.user?.image ?? undefined}
                alt={session.user?.name ?? "user"}
                sx={{ width: 28, height: 28 }}
            />
            <span className="text-sm text-slate-600">{session.user?.name}</span>
            <Button variant="outlined" onClick={() => signOut()}>
                Sign out
            </Button>
        </div>
    );
}
