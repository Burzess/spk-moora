"use client";

import { ListChecks, Pencil, Plus, Trash2 } from "lucide-react";

import {
  createCriteriaAction,
  createSubCriteriaAction,
  deleteCriteriaAction,
  deleteSubCriteriaAction,
  updateCriteriaAction,
  updateSubCriteriaAction,
} from "@/app/actions";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CriteriaTableProps {
  criteria: Array<{
    id: number;
    code: string;
    name: string;
    type: string;
    subCriteria: Array<{
      id: number;
      name: string;
      value: number;
    }>;
  }>;
}

function CriteriaFormFields({
  criterion,
}: {
  criterion?: { id: number; code: string; name: string; type: string };
}) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={criterion ? `code-${criterion.id}` : "code"}>Kode</Label>
        <Input
          id={criterion ? `code-${criterion.id}` : "code"}
          name="code"
          defaultValue={criterion?.code ?? ""}
          placeholder="C1"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={criterion ? `name-${criterion.id}` : "name"}>
          Nama
        </Label>
        <Input
          id={criterion ? `name-${criterion.id}` : "name"}
          name="name"
          defaultValue={criterion?.name ?? ""}
          placeholder="Akses jalan"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={criterion ? `type-${criterion.id}` : "type"}>
          Benefit
        </Label>
        <select
          id={criterion ? `type-${criterion.id}` : "type"}
          name="type"
          className="h-8 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground"
          defaultValue={criterion?.type ?? "BENEFIT"}
        >
          <option value="BENEFIT">Ya (Benefit)</option>
          <option value="COST">Tidak (Cost)</option>
        </select>
      </div>
    </>
  );
}

function SubCriteriaManager({
  criterion,
}: {
  criterion: {
    id: number;
    code: string;
    name: string;
    subCriteria: Array<{
      id: number;
      name: string;
      value: number;
    }>;
  };
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="gap-1.5">
          <ListChecks className="size-3.5" />
          Sub-Kriteria
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Kelola Sub-Kriteria {criterion.code}
          </DialogTitle>
          <DialogDescription>
            Atur daftar sub-kriteria untuk {criterion.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <p className="mb-3 text-sm font-medium">Tambah Sub-Kriteria</p>
            <ActionForm
              action={createSubCriteriaAction}
              className="grid gap-2 md:grid-cols-[1fr_130px_auto]"
            >
              <input type="hidden" name="criteriaId" value={criterion.id} />
              <Input name="name" placeholder="Contoh: Sangat Baik" required />
              <Input
                name="value"
                type="number"
                min={1}
                max={5}
                placeholder="1-5"
                required
              />
              <SubmitButton>Tambah</SubmitButton>
            </ActionForm>
          </div>

          <div className="rounded-lg border p-4">
            <p className="mb-3 text-sm font-medium">Daftar Sub-Kriteria</p>

            {criterion.subCriteria.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Belum ada sub-kriteria.
              </p>
            ) : (
              <div className="space-y-2">
                {criterion.subCriteria.map((sub) => (
                  <div
                    key={sub.id}
                    className="grid gap-2 rounded-lg border p-3 md:grid-cols-[1fr_120px_auto_auto]"
                  >
                    <ActionForm action={updateSubCriteriaAction} className="contents">
                      <input type="hidden" name="id" value={sub.id} />
                      <Input name="name" defaultValue={sub.name} required />
                      <Input
                        name="value"
                        type="number"
                        min={1}
                        max={5}
                        defaultValue={sub.value}
                        required
                      />
                      <SubmitButton variant="outline">
                        Update
                      </SubmitButton>
                    </ActionForm>

                    <ActionForm action={deleteSubCriteriaAction} className="contents">
                      <input type="hidden" name="id" value={sub.id} />
                      <SubmitButton variant="destructive" pendingText="Menghapus...">
                        Hapus
                      </SubmitButton>
                    </ActionForm>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function CriteriaTable({ criteria }: CriteriaTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>Daftar Kriteria</CardTitle>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" />
              Tambah Kriteria
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Kriteria</DialogTitle>
              <DialogDescription>
                Isi data kriteria baru, lalu simpan perubahan.
              </DialogDescription>
            </DialogHeader>

            <ActionForm action={createCriteriaAction} className="space-y-4">
              <CriteriaFormFields />

              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Batal
                  </Button>
                </DialogClose>
                <SubmitButton>Simpan</SubmitButton>
              </div>
            </ActionForm>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Benefit</TableHead>
              <TableHead className="w-[320px] text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {criteria.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  Belum ada data kriteria.
                </TableCell>
              </TableRow>
            ) : (
              criteria.map((criterion) => (
                <TableRow key={criterion.id}>
                  <TableCell className="font-medium">{criterion.code}</TableCell>
                  <TableCell>{criterion.name}</TableCell>
                  <TableCell>
                    <Badge variant={criterion.type === "BENEFIT" ? "default" : "secondary"}>
                      {criterion.type === "BENEFIT" ? "Ya" : "Tidak"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <SubCriteriaManager criterion={criterion} />

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-1.5">
                            <Pencil className="size-3.5" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Edit Kriteria</DialogTitle>
                            <DialogDescription>
                              Ubah data kriteria {criterion.code}.
                            </DialogDescription>
                          </DialogHeader>

                          <ActionForm action={updateCriteriaAction} className="space-y-4">
                            <input type="hidden" name="id" value={criterion.id} />
                            <CriteriaFormFields criterion={criterion} />

                            <div className="flex justify-end gap-2">
                              <DialogClose asChild>
                                <Button type="button" variant="outline">
                                  Batal
                                </Button>
                              </DialogClose>
                              <SubmitButton variant="outline">
                                Simpan Perubahan
                              </SubmitButton>
                            </div>
                          </ActionForm>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="gap-1.5">
                            <Trash2 className="size-3.5" />
                            Hapus
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Hapus Kriteria</DialogTitle>
                            <DialogDescription>
                              Yakin ingin menghapus kriteria{" "}
                              <span className="font-medium text-foreground">
                                {criterion.code} - {criterion.name}
                              </span>
                              ?
                            </DialogDescription>
                          </DialogHeader>

                          <ActionForm action={deleteCriteriaAction} className="space-y-4">
                            <input type="hidden" name="id" value={criterion.id} />

                            <div className="flex justify-end gap-2">
                              <DialogClose asChild>
                                <Button type="button" variant="outline">
                                  Batal
                                </Button>
                              </DialogClose>
                              <SubmitButton variant="destructive" pendingText="Menghapus...">
                                Ya, Hapus
                              </SubmitButton>
                            </div>
                          </ActionForm>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
