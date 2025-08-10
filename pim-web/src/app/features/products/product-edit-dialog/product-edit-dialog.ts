import { Component, Inject, inject, signal, computed } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { ProductsService } from '../products.service';
import { Product } from '../product.model';
import { ProductTypesService } from '../../product-types/product-types.service';
import { ProductType, PropertyDefinition } from '../../product-types/type.model';

@Component({
  selector: 'app-product-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './product-edit-dialog.html',
  styleUrl: './product-edit-dialog.scss'
})
export class ProductEditDialog {
  private readonly service = inject(ProductsService);
  private readonly typesService = inject(ProductTypesService);
  private readonly ref = inject(MatDialogRef<ProductEditDialog, boolean>);

  model: Partial<Product> = {
    name: '',
    code: '',
    description: '',
    productTypeId: null,
    attributesJson: '{}'
  };

  types = signal<ProductType[]>([]);
  props = signal<PropertyDefinition[]>([]);
  attrs: Record<string, any> = {};

  constructor(@Inject(MAT_DIALOG_DATA) public data: Product | null) {
    this.typesService.listTypes().subscribe(ts => this.types.set(ts));

    if (data) {
      this.model = {
        name: data.name,
        code: data.code ?? '',
        description: data.description ?? '',
        productTypeId: data.productTypeId ?? null,
        attributesJson: data.attributesJson ?? '{}'
      };
      try { this.attrs = JSON.parse(this.model.attributesJson ?? '{}'); } catch { this.attrs = {}; }
      if (this.model.productTypeId) this.loadProps(this.model.productTypeId);
    }
  }

  onTypeChange() {
    this.attrs = {};
    if (this.model.productTypeId) this.loadProps(this.model.productTypeId);
  }

  private loadProps(typeId: number) {
    this.typesService.listProps(typeId).subscribe(ps => this.props.set(ps.filter(p => p.isActive)));
  }

  optionsFor(prop: PropertyDefinition): string[] {
    if (!prop.optionsJson) return [];
    try { return JSON.parse(prop.optionsJson) as string[]; } catch { return []; }
  }

  save() {
    if (!this.model.name) return;
    if (this.model.productTypeId) {
      this.model.attributesJson = JSON.stringify(this.attrs ?? {});
    } else {
      this.model.attributesJson = '{}';
    }

    if (this.data) {
      this.service.update(this.data.id, this.model).subscribe(() => this.ref.close(true));
    } else {
      this.service.create(this.model).subscribe(() => this.ref.close(true));
    }
  }
}
