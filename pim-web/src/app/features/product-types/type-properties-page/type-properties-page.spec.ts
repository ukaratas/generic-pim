import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypePropertiesPage } from './type-properties-page';

describe('TypePropertiesPage', () => {
  let component: TypePropertiesPage;
  let fixture: ComponentFixture<TypePropertiesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypePropertiesPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypePropertiesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
