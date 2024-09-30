import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FieldFormComponent } from './field-form.component';

describe('FieldFormComponent', () => {
  let component: FieldFormComponent;
  let fixture: ComponentFixture<FieldFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FieldFormComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
