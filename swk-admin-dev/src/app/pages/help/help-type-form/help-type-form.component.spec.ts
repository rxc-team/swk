import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HelpTypeFormComponent } from './help-type-form.component';

describe('HelpTypeFormComponent', () => {
  let component: HelpTypeFormComponent;
  let fixture: ComponentFixture<HelpTypeFormComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [HelpTypeFormComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpTypeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
