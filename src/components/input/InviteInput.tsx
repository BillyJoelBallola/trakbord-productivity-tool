"use client";

import { useState, useEffect, useRef } from "react";
import { searchUsers, inviteMember } from "@/actions/workspace.action";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserPlus, Loader } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

export default function InviteInput({ workspaceId }: { workspaceId: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    { id: string; username: string; email: string }[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // search with debounce
  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsSearching(true);
      const data = await searchUsers(query);
      setResults(data);
      setShowDropdown(true);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleInvite = async (email: string) => {
    setIsInviting(true);
    setShowDropdown(false);
    setQuery("");

    const response = await inviteMember(workspaceId, email);
    if (response.error) {
      toast.error(response.error);
    } else {
      toast.success("Member invited.");
      router.refresh();
    }
    setIsInviting(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Search by name or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-8 text-sm pr-8"
          />
          {isSearching && (
            <Loader className="size-3 animate-spin absolute right-2.5 top-2.5 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-sm z-50 overflow-hidden">
          {results.length === 0 ? (
            <p className="text-xs text-muted-foreground px-3 py-2.5">
              No users found.
            </p>
          ) : (
            results.map((user) => (
              <button
                key={user.id}
                onClick={() => handleInvite(user.email)}
                disabled={isInviting}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors text-left"
              >
                <Avatar className="size-7 shrink-0">
                  <AvatarFallback className="text-xs bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                    {user.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.username}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
                <UserPlus className="size-3.5 text-muted-foreground shrink-0" />
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
