import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HelpTypeListComponent } from './help-type-list.component';

describe('HelpTypeListComponent', () => {
  let component: HelpTypeListComponent;
  let fixture: ComponentFixture<HelpTypeListComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [HelpTypeListComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpTypeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
