import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HelpListComponent } from './help-list.component';

describe('HelpListComponent', () => {
  let component: HelpListComponent;
  let fixture: ComponentFixture<HelpListComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [HelpListComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
