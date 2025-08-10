import { Component, inject, signal, computed } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ProductsService } from '../products.service';
import { Product } from '../product.model';
import { ProductTypesService } from '../../product-types/product-types.service';
import { ProductType } from '../../product-types/type.model';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

interface GroupRow {
  __group: true;
  typeId: number | null;
  typeName: string;
}

interface DataRow extends Product {
  __group?: false;
}

type TableRow = GroupRow | DataRow;

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatTableModule,
    MatCardModule,
    MatDialogModule,
    TableModule,
    TagModule
  ],
  templateUrl: './products-page.html',
  styleUrl: './products-page.scss'
})
export class ProductsPage {
  private readonly service = inject(ProductsService);
  private readonly typesService = inject(ProductTypesService);
  private readonly dialog = inject(MatDialog);

  protected readonly products = signal<Product[]>([]);
  protected readonly types = signal<ProductType[]>([]);

  // Grouped datasource for PrimeNG (flat array with group headers)
  protected readonly rows = computed<TableRow[]>(() => {
    const items = this.products();
    const groups = new Map<number | null, Product[]>();
    for (const p of items) {
      const key = p.productTypeId ?? null;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(p);
    }
    const order = Array.from(groups.keys()).sort((a, b) => {
      const an = this.typeName(a);
      const bn = this.typeName(b);
      return an.localeCompare(bn);
    });
    const out: TableRow[] = [];
    for (const key of order) {
      out.push({ __group: true, typeId: key, typeName: this.typeName(key) });
      for (const p of groups.get(key)!) out.push({ ...p, __group: false });
    }
    return out;
  });

  constructor() {
    this.typesService.listTypes().subscribe(ts => this.types.set(ts));
    this.load();
  }

  typeName(typeId?: number | null): string {
    if (!typeId) return 'None';
    const t = this.types().find(x => x.id === typeId);
    return t?.name ?? 'None';
  }

  isGroup = (row: TableRow) => (row as GroupRow).__group === true;

  load() {
    this.service.list().subscribe(data => this.products.set(data));
  }

  openCreate() {
    this.openEditor().then(changed => changed && this.load());
  }

  openEdit(p: Product) {
    this.openEditor(p).then(changed => changed && this.load());
  }

  deactivate(p: Product) {
    if (!confirm(`Deactivate ${p.name}?`)) return;
    this.service.deactivate(p.id).subscribe(() => this.load());
  }

  activate(p: Product) {
    if (!confirm(`Activate ${p.name}?`)) return;
    this.service.activate(p.id).subscribe(() => this.load());
  }

  private async openEditor(product?: Product): Promise<boolean> {
    const { ProductEditDialog } = await import('../product-edit-dialog/product-edit-dialog');
    const ref = this.dialog.open(ProductEditDialog, {
      width: '420px',
      data: product ?? null,
      disableClose: true
    });
    const result = await ref.afterClosed().toPromise();
    return !!result;
  }
}
