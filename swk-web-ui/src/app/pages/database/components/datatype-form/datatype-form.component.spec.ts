import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DatatypeFormComponent } from './datatype-form.component';

describe('DatatypeFormComponent', () => {
  let component: DatatypeFormComponent;
  let fixture: ComponentFixture<DatatypeFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DatatypeFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatatypeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
