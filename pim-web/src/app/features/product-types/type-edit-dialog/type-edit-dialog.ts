import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ProductTypesService } from '../product-types.service';
import { ProductType } from '../type.model';

@Component({
  selector: 'app-type-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './type-edit-dialog.html',
  styleUrl: './type-edit-dialog.scss'
})
export class TypeEditDialog {
  private readonly service = inject(ProductTypesService);
  private readonly ref = inject(MatDialogRef<TypeEditDialog, boolean>);

  model: Partial<ProductType> = {
    name: '',
    code: ''
  };

  constructor(@Inject(MAT_DIALOG_DATA) public data: ProductType | null) {
    if (data) {
      this.model = { name: data.name, code: data.code };
    }
  }

  save() {
    if (!this.model.name || !this.model.code) return;
    if (this.data) {
      this.service.updateType(this.data.id, this.model).subscribe(() => this.ref.close(true));
    } else {
      this.service.createType(this.model).subscribe(() => this.ref.close(true));
    }
  }
}
