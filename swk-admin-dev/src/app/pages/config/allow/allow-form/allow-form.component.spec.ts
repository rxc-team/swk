import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllowFormComponent } from './allow-form.component';

describe('AllowFormComponent', () => {
  let component: AllowFormComponent;
  let fixture: ComponentFixture<AllowFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllowFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AllowFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
