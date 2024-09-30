import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WidthComponent } from './width.component';

describe('WidthComponent', () => {
  let component: WidthComponent;
  let fixture: ComponentFixture<WidthComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [WidthComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
