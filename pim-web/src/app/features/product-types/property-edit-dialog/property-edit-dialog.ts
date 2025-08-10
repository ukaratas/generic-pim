import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { ProductTypesService } from '../product-types.service';
import { DataType, PropertyDefinition } from '../type.model';

@Component({
  selector: 'app-property-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule
  ],
  templateUrl: './property-edit-dialog.html',
  styleUrl: './property-edit-dialog.scss'
})
export class PropertyEditDialog {
  private readonly service = inject(ProductTypesService);
  private readonly ref = inject(MatDialogRef<PropertyEditDialog, boolean>);

  productTypeId!: number;
  model: Partial<PropertyDefinition> = {
    name: '',
    key: '',
    dataType: 'Text',
    isRequired: false,
    optionsJson: '[]',
    sortOrder: 0
  };

  dataTypes: DataType[] = ['Enum', 'Number', 'Text', 'Boolean', 'Date'];

  constructor(@Inject(MAT_DIALOG_DATA) public data: { productTypeId: number; prop: PropertyDefinition | null }) {
    this.productTypeId = data.productTypeId;
    if (data.prop) {
      const p = data.prop;
      this.model = {
        name: p.name,
        key: p.key,
        dataType: p.dataType,
        isRequired: p.isRequired,
        optionsJson: p.optionsJson ?? '[]',
        min: p.min,
        max: p.max,
        regex: p.regex,
        sortOrder: p.sortOrder
      };
    }
  }

  get isEnum() { return this.model.dataType === 'Enum'; }
  get isNumber() { return this.model.dataType === 'Number'; }
  get isText() { return this.model.dataType === 'Text'; }

  save() {
    if (!this.model.name || !this.model.key || !this.model.dataType) return;
    const payload: Partial<PropertyDefinition> = { ...this.model };
    if (this.data.prop) {
      this.service.updateProp(this.productTypeId, this.data.prop.id, payload).subscribe(() => this.ref.close(true));
    } else {
      this.service.createProp(this.productTypeId, payload).subscribe(() => this.ref.close(true));
    }
  }
}
