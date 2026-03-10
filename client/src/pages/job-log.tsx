import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { ArrowLeft, Plus, Trash2, Clock, AlertCircle } from "lucide-react";
import type { JobLogEntry } from "@shared/schema";

function timeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export default function JobLogPage() {
  const [, navigate] = useLocation();
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const { data: entries, isLoading } = useQuery<JobLogEntry[]>({
    queryKey: ["/api/job-log"],
  });

  const addEntry = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/job-log", {
        title: title.trim(),
        notes: notes.trim(),
      });
      return res.json();
    },
    onSuccess: () => {
      setTitle("");
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ["/api/job-log"] });
    },
  });

  const deleteEntry = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/job-log/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-log"] });
    },
  });

  const clearAll = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/job-log");
    },
    onSuccess: () => {
      setShowConfirmClear(false);
      queryClient.invalidateQueries({ queryKey: ["/api/job-log"] });
    },
  });

  const canAdd = title.trim().length > 0 && notes.trim().length > 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a]" data-testid="page-job-log">
      <div className="bg-[#0a0a0a] border-b border-[#1a1a1a] px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate("/")}
          className="text-[#999] hover:text-white transition-colors"
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-white font-bold text-lg" data-testid="text-page-title">
            Job Log
          </h1>
        </div>
        {entries && entries.length > 0 && (
          <button
            onClick={() => setShowConfirmClear(true)}
            className="text-[#666] hover:text-red-400 transition-colors p-2"
            data-testid="button-clear-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {showConfirmClear && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#141823] border border-[#2a3140] rounded-2xl p-5 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <h3 className="text-white font-bold text-lg">Clear All Entries?</h3>
            </div>
            <p className="text-[#999] text-sm mb-5">
              This will permanently delete all job log entries. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#2a2a2a] text-[#999] hover:text-white hover:border-[#444] transition-colors text-sm font-semibold"
                data-testid="button-cancel-clear"
              >
                Cancel
              </button>
              <button
                onClick={() => clearAll.mutate()}
                className="flex-1 py-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors text-sm font-semibold"
                data-testid="button-confirm-clear"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-6 max-w-2xl mx-auto pb-24">
        <p className="text-[#999] text-sm mb-4">
          Record settings, tweaks, and outcomes for future reference.
        </p>

        <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-4 mb-6">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='Title (ex: MIG 3G fillet, 0.035 wire)...'
            className="w-full bg-[#0b0b0b] border border-[#1c1c1c] rounded-2xl px-4 py-3 text-white placeholder-[#555] text-sm focus:outline-none focus:border-[#006bae] mb-3 transition-colors"
            data-testid="input-log-title"
          />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (what changed / what worked)..."
            rows={4}
            className="w-full bg-[#0b0b0b] border border-[#1c1c1c] rounded-2xl px-4 py-3 text-white placeholder-[#555] text-sm focus:outline-none focus:border-[#006bae] resize-none mb-3 transition-colors"
            data-testid="input-log-notes"
          />
          <div className="flex justify-end">
            <button
              onClick={() => addEntry.mutate()}
              disabled={!canAdd || addEntry.isPending}
              className="flex items-center gap-2 bg-[#006bae] hover:bg-[#0078c4] disabled:opacity-40 disabled:hover:bg-[#006bae] rounded-full px-5 py-2.5 transition-all"
              data-testid="button-add-entry"
            >
              <Plus className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-bold">Add Entry</span>
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-[#006bae] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {entries && entries.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <ClipboardIcon />
            <p className="text-[#555] text-sm mt-3">No entries yet. Add your first log above.</p>
          </div>
        )}

        <div className="space-y-3">
          {entries?.map((entry) => (
            <div
              key={entry.id}
              className="bg-[#111] border border-[#1c1c1c] rounded-2xl p-4 group"
              data-testid={`entry-${entry.id}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg" data-testid={`text-entry-title-${entry.id}`}>
                    {entry.title}
                  </h3>
                  <p className="text-[#d0d0d0] text-sm mt-2 leading-relaxed" data-testid={`text-entry-notes-${entry.id}`}>
                    {entry.notes}
                  </p>
                  <div className="flex items-center gap-1.5 mt-3">
                    <Clock className="w-3 h-3 text-[#555]" />
                    <span className="text-[#555] text-xs">
                      {timeAgo(entry.createdAt as unknown as string)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => deleteEntry.mutate(entry.id)}
                  className="text-[#333] group-hover:text-[#666] hover:!text-red-400 transition-colors p-1"
                  data-testid={`button-delete-${entry.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ClipboardIcon() {
  return (
    <div className="mx-auto w-12 h-12 rounded-2xl bg-[#111] border border-[#1f1f1f] flex items-center justify-center">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      </svg>
    </div>
  );
}
