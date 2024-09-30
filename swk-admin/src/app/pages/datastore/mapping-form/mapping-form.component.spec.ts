import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MappingFormComponent } from './mapping-form.component';

describe('MappingFormComponent', () => {
  let component: MappingFormComponent;
  let fixture: ComponentFixture<MappingFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MappingFormComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MappingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
