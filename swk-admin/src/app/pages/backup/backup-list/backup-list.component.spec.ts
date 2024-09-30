import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BackupListComponent } from './backup-list.component';

describe('BackupListComponent', () => {
  let component: BackupListComponent;
  let fixture: ComponentFixture<BackupListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [BackupListComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BackupListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
