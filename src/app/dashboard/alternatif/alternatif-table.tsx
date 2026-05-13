"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";

import {
  createAlternativeAction,
  deleteAlternativeAction,
  updateAlternativeAction,
} from "@/app/actions";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
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

interface AlternatifTableProps {
  alternatives: Array<{
    id: number;
    code: string;
    name: string;
  }>;
}

function AlternatifFormFields({
  alternative,
}: {
  alternative?: { id: number; code: string; name: string };
}) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={alternative ? `code-${alternative.id}` : "code"}>
          Kode
        </Label>
        <Input
          id={alternative ? `code-${alternative.id}` : "code"}
          name="code"
          defaultValue={alternative?.code ?? ""}
          placeholder="A1"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={alternative ? `name-${alternative.id}` : "name"}>
          Nama Lokasi
        </Label>
        <Input
          id={alternative ? `name-${alternative.id}` : "name"}
          name="name"
          defaultValue={alternative?.name ?? ""}
          placeholder="Lokasi Pusat Kota"
          required
        />
      </div>
    </>
  );
}

export function AlternatifTable({ alternatives }: AlternatifTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>Daftar Alternatif</CardTitle>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" />
              Tambah Alternatif
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Alternatif</DialogTitle>
              <DialogDescription>
                Isi data alternatif baru, lalu simpan perubahan.
              </DialogDescription>
            </DialogHeader>

            <ActionForm action={createAlternativeAction} className="space-y-4">
              <AlternatifFormFields />

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
              <TableHead className="w-[220px] text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alternatives.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                  Belum ada data alternatif.
                </TableCell>
              </TableRow>
            ) : (
              alternatives.map((alternative) => (
                <TableRow key={alternative.id}>
                  <TableCell className="font-medium">{alternative.code}</TableCell>
                  <TableCell>{alternative.name}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-1.5">
                            <Pencil className="size-3.5" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Edit Alternatif</DialogTitle>
                            <DialogDescription>
                              Ubah data alternatif {alternative.code}.
                            </DialogDescription>
                          </DialogHeader>

                          <ActionForm action={updateAlternativeAction} className="space-y-4">
                            <input type="hidden" name="id" value={alternative.id} />
                            <AlternatifFormFields alternative={alternative} />

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
                            <DialogTitle>Hapus Alternatif</DialogTitle>
                            <DialogDescription>
                              Yakin ingin menghapus alternatif{" "}
                              <span className="font-medium text-foreground">
                                {alternative.code} - {alternative.name}
                              </span>
                              ?
                            </DialogDescription>
                          </DialogHeader>

                          <ActionForm action={deleteAlternativeAction} className="space-y-4">
                            <input type="hidden" name="id" value={alternative.id} />

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
