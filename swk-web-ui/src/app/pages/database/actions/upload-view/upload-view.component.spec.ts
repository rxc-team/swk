import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UploadViewComponent } from './upload-view.component';

describe('UploadViewComponent', () => {
  let component: UploadViewComponent;
  let fixture: ComponentFixture<UploadViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
