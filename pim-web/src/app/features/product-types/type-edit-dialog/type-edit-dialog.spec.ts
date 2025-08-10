import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeEditDialog } from './type-edit-dialog';

describe('TypeEditDialog', () => {
  let component: TypeEditDialog;
  let fixture: ComponentFixture<TypeEditDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeEditDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeEditDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
