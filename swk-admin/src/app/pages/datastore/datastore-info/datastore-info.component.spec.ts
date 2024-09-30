import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DatastoreInfoComponent } from './datastore-info.component';

describe('DatastoreInfoComponent', () => {
  let component: DatastoreInfoComponent;
  let fixture: ComponentFixture<DatastoreInfoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DatastoreInfoComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatastoreInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
