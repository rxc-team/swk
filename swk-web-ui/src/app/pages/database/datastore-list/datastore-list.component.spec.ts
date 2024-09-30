import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DatastoreListComponent } from './datastore-list.component';

describe('DatastoreListComponent', () => {
  let component: DatastoreListComponent;
  let fixture: ComponentFixture<DatastoreListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DatastoreListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatastoreListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
