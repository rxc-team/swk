import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AppCopyComponent } from './app-copy.component';

describe('AppCopyComponent', () => {
  let component: AppCopyComponent;
  let fixture: ComponentFixture<AppCopyComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AppCopyComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppCopyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
