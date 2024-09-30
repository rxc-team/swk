import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DatastoreFormComponent } from './datastore-form.component';

describe('DatastoreFormComponent', () => {
  let component: DatastoreFormComponent;
  let fixture: ComponentFixture<DatastoreFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DatastoreFormComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatastoreFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
