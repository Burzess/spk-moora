"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Circle,
  MapPin,
  CheckSquare,
  Square,
  RotateCcw,
  ListChecks,
  Info,
  DollarSign,
  Filter,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface AlternativeItem {
  id: number;
  code: string;
  name: string;
  region?: string | null;
  indicators: string[];
  rentalPrice?: string;
}

interface AlternativeFilterProps {
  alternatives: AlternativeItem[];
  initialSelectedIds: number[];
}

export function AlternativeFilter({
  alternatives,
  initialSelectedIds,
}: AlternativeFilterProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>(initialSelectedIds);
  const [selectedRegion, setSelectedRegion] = useState<string>("ALL");

  // Extract distinct regions
  const availableRegions = useMemo(() => {
    const set = new Set<string>();
    alternatives.forEach((a) => {
      if (a.region?.trim()) {
        set.add(a.region.trim());
      }
    });
    return Array.from(set).sort();
  }, [alternatives]);

  // Alternatives filtered by active region tab
  const displayedAlternatives = useMemo(() => {
    if (selectedRegion === "ALL") return alternatives;
    return alternatives.filter((a) => a.region?.trim() === selectedRegion);
  }, [alternatives, selectedRegion]);

  const displayedIds = useMemo(
    () => displayedAlternatives.map((a) => a.id),
    [displayedAlternatives]
  );

  const allSelected =
    alternatives.length > 0 && selectedIds.length === alternatives.length;

  const allInViewSelected =
    displayedIds.length > 0 &&
    displayedIds.every((id) => selectedIds.includes(id));

  const isDefault =
    alternatives.length >= 2 &&
    selectedIds.length === 2 &&
    alternatives.slice(0, 2).every((alt) => selectedIds.includes(alt.id));

  const toggleAlternative = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleAll = () => {
    if (selectedRegion === "ALL") {
      if (allSelected) {
        // Revert to default 2 alternatives
        setSelectedIds(alternatives.slice(0, 2).map((a) => a.id));
      } else {
        // Select all alternatives
        setSelectedIds(alternatives.map((a) => a.id));
      }
    } else {
      if (allInViewSelected) {
        // Deselect all in this region
        setSelectedIds((prev) => prev.filter((id) => !displayedIds.includes(id)));
      } else {
        // Select all in this region (union with currently selected)
        setSelectedIds((prev) => Array.from(new Set([...prev, ...displayedIds])));
      }
    }
  };

  const handleResetDefault = () => {
    setSelectedIds(alternatives.slice(0, 2).map((a) => a.id));
  };

  return (
    <form method="GET" className="space-y-6">
      {/* 1. Region Filter Pills Toolbar */}
      {availableRegions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-muted/40 p-3 border border-border/70">
          <span className="text-xs font-semibold text-foreground flex items-center gap-1.5 shrink-0 mr-1">
            <Filter className="size-3.5 text-primary" />
            Filter Wilayah:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedRegion("ALL")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedRegion === "ALL"
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "bg-background text-muted-foreground hover:bg-card hover:text-foreground border border-border/60"
              }`}
            >
              Semua Wilayah ({alternatives.length})
            </button>
            {availableRegions.map((region) => {
              const count = alternatives.filter(
                (a) => a.region?.trim() === region
              ).length;
              const isCurrent = selectedRegion === region;
              return (
                <button
                  key={region}
                  type="button"
                  onClick={() => setSelectedRegion(region)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                      : "bg-background text-muted-foreground hover:bg-card hover:text-foreground border border-border/60"
                  }`}
                >
                  {region} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Selection Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <Badge
            variant="secondary"
            className="border border-blue-400/25 bg-blue-500/15 text-blue-700 dark:text-blue-200"
          >
            {selectedIds.length} dari {alternatives.length} alternatif dipilih
          </Badge>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {selectedRegion === "ALL"
              ? "Menampilkan semua alternatif lokasi"
              : `Menampilkan alternatif wilayah ${selectedRegion}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleToggleAll}
            className="h-8 gap-1.5 text-xs font-medium cursor-pointer"
          >
            {selectedRegion === "ALL" ? (
              allSelected ? (
                <>
                  <Square className="size-3.5" />
                  Batal Pilih Semua
                </>
              ) : (
                <>
                  <CheckSquare className="size-3.5 text-primary" />
                  Pilih Semua
                </>
              )
            ) : allInViewSelected ? (
              <>
                <Square className="size-3.5" />
                Batal Pilih ({selectedRegion})
              </>
            ) : (
              <>
                <CheckSquare className="size-3.5 text-primary" />
                Pilih Semua ({selectedRegion})
              </>
            )}
          </Button>

          {!isDefault && alternatives.length >= 2 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetDefault}
              className="h-8 gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <RotateCcw className="size-3" />
              Default (2)
            </Button>
          )}
        </div>
      </div>

      {/* 3. Hidden Inputs for All Selected Alternative IDs */}
      {selectedIds.map((id) => (
        <input key={id} type="hidden" name="alt" value={id} />
      ))}

      {/* 4. Alternative Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayedAlternatives.map((alt) => {
          const isSelected = selectedIds.includes(alt.id);
          return (
            <div
              key={alt.id}
              className={`group relative overflow-hidden rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col h-full gap-2 ${
                isSelected
                  ? "border-blue-400/60 bg-blue-500/10 ring-1 ring-blue-400/25"
                  : "border-border bg-card/50 hover:border-blue-500/50"
              }`}
            >
              <div
                className="flex items-start gap-4 flex-1 cursor-pointer"
                onClick={() => toggleAlternative(alt.id)}
              >
                <div className="mt-0.5 shrink-0 transition-colors">
                  {isSelected ? (
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground group-hover:text-blue-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <Badge
                      variant="outline"
                      className="font-mono text-xs text-muted-foreground"
                    >
                      {alt.code}
                    </Badge>
                    {alt.region && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-medium bg-muted/60 text-muted-foreground border-border/80"
                      >
                        {alt.region}
                      </Badge>
                    )}
                  </div>
                  <p
                    className={`font-medium leading-tight ${
                      isSelected
                        ? "text-blue-900 dark:text-blue-100"
                        : "text-foreground/90"
                    }`}
                  >
                    {alt.name}
                  </p>
                </div>
              </div>

              <div className="mt-auto border-t border-border/60 pt-2 pl-9 flex items-center gap-3">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    alt.name
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 transition-colors hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200"
                >
                  <MapPin className="h-3 w-3" />
                  Maps
                </a>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-xs font-medium text-blue-700 hover:text-blue-900 hover:bg-transparent dark:text-blue-300 dark:hover:text-blue-200 cursor-pointer"
                    >
                      Lihat Indikator ({(alt.indicators || []).length})
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-lg">
                        <ListChecks className="size-5 text-primary" />
                        Detail Indikator & Biaya - {alt.name}
                      </DialogTitle>
                      <DialogDescription>
                        Rincian harga sewa dan indikator yang terpenuhi untuk alternatif ini.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto p-1 mt-4">
                      {alt.rentalPrice && (
                        <div className="mb-4 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 dark:border-amber-500/30 dark:bg-amber-950/20 shadow-xs">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                              <DollarSign className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                Harga Sewa Lokasi
                              </p>
                              <p className="text-base font-bold text-foreground">
                                {alt.rentalPrice}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="border-amber-300 text-amber-700 dark:border-amber-600 dark:text-amber-300 text-[11px]"
                          >
                            Biaya Sewa
                          </Badge>
                        </div>
                      )}

                      {(alt.indicators || []).length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                          {(alt.indicators || []).map((ind, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card shadow-sm hover:border-emerald-200 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all"
                            >
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                                <CheckCircle2 className="h-4 w-4" />
                              </div>
                              <span className="text-sm font-medium leading-tight text-foreground/90">
                                {ind}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/30 rounded-xl border border-dashed border-border">
                          <Info className="size-10 text-muted-foreground/50 mb-3" />
                          <span className="text-sm font-medium text-muted-foreground">
                            Tidak ada indikator benefit lainnya.
                          </span>
                          <span className="text-xs text-muted-foreground/70 mt-1">
                            Alternatif ini belum memiliki atau hanya memenuhi kriteria biaya.
                          </span>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          );
        })}
      </div>

      {displayedAlternatives.length === 0 && (
        <div className="p-8 text-center bg-muted/20 rounded-xl border border-dashed border-border text-muted-foreground text-sm">
          Tidak ada alternatif yang terdaftar di wilayah {selectedRegion}.
        </div>
      )}

      {/* 5. Submit Button & Validation */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {selectedIds.length < 2 ? (
          <p className="text-xs font-medium text-red-500">
            * Pilih minimal 2 alternatif untuk dapat menghitung ranking MOORA.
          </p>
        ) : (
          <span />
        )}
        <Button
          type="submit"
          size="lg"
          disabled={selectedIds.length < 2}
          className="w-full sm:w-auto font-semibold cursor-pointer"
        >
          Hitung Ranking
        </Button>
      </div>
    </form>
  );
}
