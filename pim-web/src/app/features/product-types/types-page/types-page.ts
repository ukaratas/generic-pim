import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { ProductTypesService } from '../product-types.service';
import { ProductType } from '../type.model';

@Component({
  selector: 'app-types-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatTableModule,
    MatCardModule,
    MatDialogModule
  ],
  templateUrl: './types-page.html',
  styleUrl: './types-page.scss'
})
export class TypesPage {
  private readonly service = inject(ProductTypesService);
  private readonly dialog = inject(MatDialog);

  protected readonly types = signal<ProductType[]>([]);
  protected readonly displayedColumns = ['name', 'code', 'status', 'actions'];

  constructor() {
    this.load();
  }

  load() {
    this.service.listTypes().subscribe(data => this.types.set(data));
  }

  openCreate() {
    this.openEditor().then(changed => changed && this.load());
  }

  openEdit(t: ProductType) {
    this.openEditor(t).then(changed => changed && this.load());
  }

  deactivate(t: ProductType) {
    if (!confirm(`Deactivate ${t.name}?`)) return;
    this.service.deactivateType(t.id).subscribe(() => this.load());
  }

  activate(t: ProductType) {
    if (!confirm(`Activate ${t.name}?`)) return;
    this.service.activateType(t.id).subscribe(() => this.load());
  }

  manageProps(t: ProductType) {
    // navigation via routerLink in template
  }

  private async openEditor(type?: ProductType): Promise<boolean> {
    const { TypeEditDialog } = await import('../type-edit-dialog/type-edit-dialog');
    const ref = this.dialog.open(TypeEditDialog, {
      width: '420px',
      data: type ?? null,
      disableClose: true
    });
    const result = await ref.afterClosed().toPromise();
    return !!result;
  }
}
