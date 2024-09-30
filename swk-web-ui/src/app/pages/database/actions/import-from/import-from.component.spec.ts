import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ImportFromComponent } from './import-from.component';

describe('ImportFromComponent', () => {
  let component: ImportFromComponent;
  let fixture: ComponentFixture<ImportFromComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportFromComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportFromComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
