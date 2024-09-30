import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UploadInventoryComponent } from './upload-inventory.component';

describe('UploadInventoryComponent', () => {
  let component: UploadInventoryComponent;
  let fixture: ComponentFixture<UploadInventoryComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [UploadInventoryComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
