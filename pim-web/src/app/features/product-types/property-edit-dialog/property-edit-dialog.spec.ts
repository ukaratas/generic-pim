import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyEditDialog } from './property-edit-dialog';

describe('PropertyEditDialog', () => {
  let component: PropertyEditDialog;
  let fixture: ComponentFixture<PropertyEditDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyEditDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertyEditDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
