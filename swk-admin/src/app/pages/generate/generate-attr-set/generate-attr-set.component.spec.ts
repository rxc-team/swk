import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateAttrSetComponent } from './generate-attr-set.component';

describe('GenerateAttrSetComponent', () => {
  let component: GenerateAttrSetComponent;
  let fixture: ComponentFixture<GenerateAttrSetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenerateAttrSetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateAttrSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
