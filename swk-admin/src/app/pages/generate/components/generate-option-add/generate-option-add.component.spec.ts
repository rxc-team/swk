import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateOptionAddComponent } from './generate-option-add.component';

describe('GenerateOptionAddComponent', () => {
  let component: GenerateOptionAddComponent;
  let fixture: ComponentFixture<GenerateOptionAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenerateOptionAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateOptionAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
