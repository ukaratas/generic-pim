import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProductTypesService } from '../product-types.service';
import { PropertyDefinition } from '../type.model';

@Component({
  selector: 'app-type-properties-page',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatTableModule,
    MatCardModule,
    MatDialogModule
  ],
  templateUrl: './type-properties-page.html',
  styleUrl: './type-properties-page.scss'
})
export class TypePropertiesPage {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(ProductTypesService);
  private readonly dialog = inject(MatDialog);

  protected readonly props = signal<PropertyDefinition[]>([]);
  protected readonly displayedColumns = ['name', 'key', 'type', 'required', 'status', 'actions'];
  protected productTypeId = Number(this.route.snapshot.paramMap.get('id'));

  constructor() {
    this.load();
  }

  load() {
    this.service.listProps(this.productTypeId).subscribe(data => this.props.set(data));
  }

  openCreate() {
    this.openEditor().then(changed => changed && this.load());
  }

  openEdit(p: PropertyDefinition) {
    this.openEditor(p).then(changed => changed && this.load());
  }

  deactivate(p: PropertyDefinition) {
    if (!confirm(`Deactivate ${p.name}?`)) return;
    this.service.deactivateProp(this.productTypeId, p.id).subscribe(() => this.load());
  }

  activate(p: PropertyDefinition) {
    if (!confirm(`Activate ${p.name}?`)) return;
    this.service.activateProp(this.productTypeId, p.id).subscribe(() => this.load());
  }

  private async openEditor(prop?: PropertyDefinition): Promise<boolean> {
    const { PropertyEditDialog } = await import('../property-edit-dialog/property-edit-dialog');
    const ref = this.dialog.open(PropertyEditDialog, {
      width: '520px',
      data: { productTypeId: this.productTypeId, prop: prop ?? null },
      disableClose: true
    });
    const result = await ref.afterClosed().toPromise();
    return !!result;
  }
}
